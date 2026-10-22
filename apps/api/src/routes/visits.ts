import { createVisitBody, experienceOf, updateVisitBody, type Experience } from "@tastesync/core";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { HttpError, type Deps } from "../app";
import type { Tx } from "../db";
import { lockList, rankPlace, RankingError, removeFromList } from "../rankings";

const idParam = z.object({ id: z.uuid() });

async function assertMemberOfAll(tx: Tx, userId: string, circleIds: string[]) {
  if (circleIds.length === 0) return;
  const [{ count }] = await tx<{ count: number }[]>`
    SELECT count(*)::int AS count FROM circle_members
    WHERE user_id = ${userId} AND circle_id = ANY(${circleIds}::uuid[])`;
  if (count !== new Set(circleIds).size) throw new HttpError(403, "you can only share to circles you are in");
}

async function setCircles(tx: Tx, visitId: string, circleIds: string[]) {
  await tx`DELETE FROM visit_circles WHERE visit_id = ${visitId}`;
  if (circleIds.length === 0) return;
  await tx`INSERT INTO visit_circles (visit_id, circle_id)
    SELECT ${visitId}, unnest(${[...new Set(circleIds)]}::uuid[])`;
}

export const visitRoutes =
  ({ sql }: Deps): FastifyPluginAsync =>
  async (app) => {
    app.post("/visits", async (req, reply) => {
      const body = createVisitBody.parse(req.body);
      const me = req.user.id;
      const experience = experienceOf(body.mode);

      const result = await sql.begin(async (tx) => {
        const [place] = await tx`
          SELECT id FROM places
          WHERE id = ${body.placeId} AND (status = 'open' OR (status = 'pending' AND added_by = ${me}))`;
        if (!place) throw new HttpError(404, "place not found");
        const circleIds = body.audience === "circle" ? body.circleIds : [];
        await assertMemberOfAll(tx, me, circleIds);
        const companionIds = [...new Set(body.companionIds)].filter((id) => id !== me);
        if (companionIds.length > 0) {
          const found = await tx`SELECT id FROM users WHERE id = ANY(${companionIds}::uuid[]) AND deleted_at IS NULL`;
          if (found.length !== companionIds.length) throw new HttpError(400, "unknown companion");
        }

        await lockList(tx, me, experience);
        let ranking: { position: number | null; score: number | null };
        if (body.keepPosition) {
          const [existing] = await tx<{ band: string; position: number | null; score: number | null }[]>`
            SELECT band, position, score FROM rankings
            WHERE user_id = ${me} AND place_id = ${body.placeId} AND experience = ${experience}`;
          if (!existing || existing.band !== body.feeling || body.comparisons.length > 0) {
            throw new RankingError("keepPosition needs an existing ranking with the same feeling and no comparisons");
          }
          ranking = { position: existing.position, score: existing.score };
        } else {
          ranking = await rankPlace(tx, {
            userId: me,
            placeId: body.placeId,
            experience,
            band: body.feeling,
            answers: body.comparisons,
            skip: body.skipComparisons,
          });
        }

        const [visit] = await tx<{ id: string }[]>`
          INSERT INTO visits (user_id, place_id, visited_on, mode, feeling, audience, note, price_per_person, was_hosted)
          VALUES (${me}, ${body.placeId}, ${body.visitedOn ?? sql`current_date`}, ${body.mode}, ${body.feeling},
                  ${body.audience}, ${body.note ?? null}, ${body.pricePerPerson ?? null}, ${body.wasHosted})
          RETURNING id`;
        const visitId = visit!.id;

        for (const dish of body.dishes) {
          const [row] = dish.dishId
            ? await tx<{ id: string }[]>`SELECT id FROM dishes WHERE id = ${dish.dishId} AND place_id = ${body.placeId}`
            : await tx<{ id: string }[]>`
                INSERT INTO dishes (place_id, name) VALUES (${body.placeId}, ${dish.name!})
                ON CONFLICT (place_id, name) DO UPDATE SET name = EXCLUDED.name
                RETURNING id`;
          if (!row) throw new HttpError(400, "that dish is not on this place's list");
          await tx`
            INSERT INTO visit_dishes (visit_id, dish_id, is_standout) VALUES (${visitId}, ${row.id}, ${dish.standout})
            ON CONFLICT (visit_id, dish_id) DO UPDATE SET is_standout = visit_dishes.is_standout OR EXCLUDED.is_standout`;
        }
        if (companionIds.length > 0) {
          await tx`INSERT INTO visit_companions (visit_id, companion_id)
            SELECT ${visitId}, unnest(${companionIds}::uuid[])`;
        }
        await setCircles(tx, visitId, circleIds);
        for (const c of body.comparisons) {
          await tx`
            INSERT INTO comparisons (user_id, visit_id, experience, new_place_id, other_place_id, outcome)
            VALUES (${me}, ${visitId}, ${experience}, ${body.placeId}, ${c.otherPlaceId}, ${c.outcome})`;
        }
        const durationMs = body.logStartedAt ? Date.now() - Date.parse(body.logStartedAt) : null;
        await tx`
          INSERT INTO events (user_id, name, props)
          VALUES (${me}, 'log_saved', ${sql.json({
            visitId,
            mode: body.mode,
            durationMs,
            comparisons: body.comparisons.length,
            skippedComparisons: body.skipComparisons,
          })})`;
        return { visitId, experience, ...ranking };
      });
      return reply.status(201).send(result);
    });

    // Own visits only until audience rules land in M4.
    app.get("/visits/:id", async (req) => {
      const { id } = idParam.parse(req.params);
      const [visit] = await sql`
        SELECT v.id, v.place_id, p.name AS place_name, v.visited_on, v.mode, v.experience, v.feeling, v.audience,
               v.note, v.price_per_person, v.was_hosted, r.band, r.position, r.score,
               coalesce((SELECT array_agg(circle_id) FROM visit_circles WHERE visit_id = v.id), '{}') AS circle_ids,
               coalesce((SELECT json_agg(json_build_object('name', d.name, 'standout', vd.is_standout))
                         FROM visit_dishes vd JOIN dishes d ON d.id = vd.dish_id WHERE vd.visit_id = v.id), '[]') AS dishes
        FROM visits v
        JOIN places p ON p.id = v.place_id
        LEFT JOIN rankings r ON r.user_id = v.user_id AND r.place_id = v.place_id AND r.experience = v.experience
        WHERE v.id = ${id} AND v.user_id = ${req.user.id}`;
      if (!visit) throw new HttpError(404, "visit not found");
      return { visit };
    });

    app.patch("/visits/:id", async (req) => {
      const { id } = idParam.parse(req.params);
      const body = updateVisitBody.parse(req.body);
      const me = req.user.id;
      return sql.begin(async (tx) => {
        const [visit] = await tx<{ placeId: string; experience: Experience; feeling: string; audience: string }[]>`
          SELECT place_id, experience, feeling, audience FROM visits WHERE id = ${id} AND user_id = ${me} FOR UPDATE`;
        if (!visit) throw new HttpError(404, "visit not found");

        const audience = body.audience ?? visit.audience;
        if (audience === "circle") {
          if (body.circleIds) {
            if (body.circleIds.length === 0) throw new HttpError(400, "pick at least one circle");
            await assertMemberOfAll(tx, me, body.circleIds);
            await setCircles(tx, id, body.circleIds);
          } else if (visit.audience !== "circle") {
            throw new HttpError(400, "pick at least one circle");
          }
        } else {
          await setCircles(tx, id, []);
        }

        await tx`
          UPDATE visits SET
            visited_on = coalesce(${body.visitedOn ?? null}::date, visited_on),
            feeling = coalesce(${body.feeling ?? null}::feeling_band, feeling),
            audience = ${audience}::audience,
            note = ${body.note === undefined ? sql`note` : body.note},
            price_per_person = ${body.pricePerPerson === undefined ? sql`price_per_person` : body.pricePerPerson},
            was_hosted = coalesce(${body.wasHosted ?? null}::boolean, was_hosted)
          WHERE id = ${id}`;

        let needsRanking = false;
        if (body.feeling && body.feeling !== visit.feeling) {
          await lockList(tx, me, visit.experience);
          const [ranking] = await tx<{ band: string }[]>`
            SELECT band FROM rankings WHERE user_id = ${me} AND place_id = ${visit.placeId} AND experience = ${visit.experience}`;
          if (ranking && ranking.band !== body.feeling) {
            await rankPlace(tx, {
              userId: me,
              placeId: visit.placeId,
              experience: visit.experience,
              band: body.feeling,
              answers: [],
              skip: true,
            });
            needsRanking = true;
          }
        }
        return { ok: true, needsRanking };
      });
    });

    app.delete("/visits/:id", async (req, reply) => {
      const { id } = idParam.parse(req.params);
      const me = req.user.id;
      await sql.begin(async (tx) => {
        const [visit] = await tx<{ placeId: string; experience: Experience }[]>`
          DELETE FROM visits WHERE id = ${id} AND user_id = ${me} RETURNING place_id, experience`;
        if (!visit) throw new HttpError(404, "visit not found");
        await lockList(tx, me, visit.experience);
        const [{ remaining }] = await tx<{ remaining: number }[]>`
          SELECT count(*)::int AS remaining FROM visits
          WHERE user_id = ${me} AND place_id = ${visit.placeId} AND experience = ${visit.experience}`;
        if (remaining === 0) await removeFromList(tx, me, visit.placeId, visit.experience, { deleteRow: true });
      });
      return reply.status(204).send();
    });
  };
