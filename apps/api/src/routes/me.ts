import { band, experience, rankBody, reorderBody } from "@tastesync/core";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { HttpError, type Deps } from "../app";
import { lockList, rankPlace, reorderBand } from "../rankings";

const rankingsQuery = z.object({
  experience,
  band: band.optional(),
  areaId: z.uuid().optional(),
  cuisine: z.string().max(40).optional(),
});

const diaryQuery = z.object({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "use YYYY-MM") });

export const meRoutes =
  ({ sql }: Deps): FastifyPluginAsync =>
  async (app) => {
    app.get("/me", async (req) => {
      const [user] = await sql`
        SELECT id, username, display_name, home_area_id, top_four, created_at FROM users WHERE id = ${req.user.id}`;
      return { user };
    });

    // A whole list, or one band of it. The app loads a band before asking comparisons.
    app.get("/me/rankings", async (req) => {
      const q = rankingsQuery.parse(req.query);
      const places = await sql`
        SELECT r.place_id, p.name, a.name AS area_name, p.cuisines, p.status, r.band, r.position, r.score,
               (SELECT max(v.visited_on) FROM visits v
                WHERE v.user_id = r.user_id AND v.place_id = r.place_id AND v.experience = r.experience) AS last_visited_on
        FROM rankings r
        JOIN places p ON p.id = r.place_id
        LEFT JOIN areas a ON a.id = p.area_id
        WHERE r.user_id = ${req.user.id} AND r.experience = ${q.experience}
          ${q.band ? sql`AND r.band = ${q.band}` : sql``}
          ${q.areaId ? sql`AND p.area_id = ${q.areaId}` : sql``}
          ${q.cuisine ? sql`AND ${q.cuisine} = ANY(p.cuisines)` : sql``}
        ORDER BY r.band, r.position NULLS LAST, p.name`;
      return { places };
    });

    // Ranks a place already in the list, e.g. one skipped earlier or moved to a new band.
    app.post("/me/rankings/rank", async (req) => {
      const body = rankBody.parse(req.body);
      return sql.begin(async (tx) => {
        await lockList(tx, req.user.id, body.experience);
        const [existing] = await tx`
          SELECT 1 FROM rankings WHERE user_id = ${req.user.id} AND place_id = ${body.placeId} AND experience = ${body.experience}`;
        if (!existing) throw new HttpError(404, "log a visit to this place first");
        return rankPlace(tx, {
          userId: req.user.id,
          placeId: body.placeId,
          experience: body.experience,
          band: body.band,
          answers: body.comparisons,
          skip: false,
        });
      });
    });

    app.patch("/me/rankings/order", async (req) => {
      const body = reorderBody.parse(req.body);
      await sql.begin(async (tx) => {
        await lockList(tx, req.user.id, body.experience);
        await reorderBand(tx, req.user.id, body.experience, body.band, body.placeIds);
      });
      return { ok: true };
    });

    app.get("/me/diary", async (req) => {
      const { month } = diaryQuery.parse(req.query);
      const visits = await sql`
        SELECT v.id, v.visited_on, v.mode, v.experience, v.feeling, v.audience, v.note,
               p.id AS place_id, p.name AS place_name, r.score
        FROM visits v
        JOIN places p ON p.id = v.place_id
        LEFT JOIN rankings r ON r.user_id = v.user_id AND r.place_id = v.place_id AND r.experience = v.experience
        WHERE v.user_id = ${req.user.id}
          AND v.visited_on >= ${`${month}-01`}::date
          AND v.visited_on < (${`${month}-01`}::date + interval '1 month')
        ORDER BY v.visited_on DESC, v.created_at DESC`;
      return { month, count: visits.length, visits };
    });
  };
