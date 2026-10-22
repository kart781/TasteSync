import { createPlaceBody, placeSearchQuery, RADIUS_KM } from "@tastesync/core";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { HttpError, type Deps } from "../app";

const DUPLICATE_METERS = 150;

function likePattern(text: string) {
  return `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export const placeRoutes =
  ({ sql }: Deps): FastifyPluginAsync =>
  async (app) => {
    // By name (fuzzy), near a point, by area or cuisine, for eating out or ordering in.
    // Pending places show only to whoever added them. A name search covers the whole city;
    // browsing by location alone stays inside the radius and the mode (Eat out or Order in).
    app.get("/places/search", async (req) => {
      const q = placeSearchQuery.parse(req.query);
      const point = () =>
        q.lat !== undefined && q.lng !== undefined ? sql`ST_MakePoint(${q.lng}, ${q.lat})::geography` : null;
      const near = point();
      if (!q.q && !near && !q.areaId && !q.cuisine) throw new HttpError(400, "give a name, a location, an area or a cuisine");
      const radiusMeters = (q.radiusKm ?? RADIUS_KM[q.mode]) * 1000;

      const places = await sql`
        SELECT p.id, p.name, p.cuisines, p.is_delivery_only, p.price_band, p.status, p.landmark, a.name AS area_name,
               ${near ? sql`round(ST_Distance(p.geog, ${point()!}))::int` : sql`NULL::int`} AS meters,
               ${q.q ? sql`similarity(p.name, ${q.q})` : sql`0`} AS match
        FROM places p
        LEFT JOIN areas a ON a.id = p.area_id
        WHERE (p.status = 'open' OR (p.status = 'pending' AND p.added_by = ${req.user.id}))
          ${q.q ? sql`` : q.mode === "order_in" ? sql`AND (p.is_delivery_only OR p.offers_delivery IS NOT FALSE)` : sql`AND NOT p.is_delivery_only`}
          ${q.q ? sql`AND (p.name % ${q.q} OR p.name ILIKE ${likePattern(q.q)})` : sql``}
          ${q.areaId ? sql`AND p.area_id = ${q.areaId}` : sql``}
          ${q.cuisine ? sql`AND ${q.cuisine} = ANY(p.cuisines)` : sql``}
          ${!q.q && near && radiusMeters > 0 ? sql`AND ST_DWithin(p.geog, ${point()!}, ${radiusMeters})` : sql``}
        ORDER BY ${q.q ? sql`match DESC,` : sql``} ${near ? sql`meters ASC,` : sql``} p.name
        LIMIT ${q.limit}`;
      return { places };
    });

    // Launch areas for the location sheet; nearest first when a point is given (that one labels the bar).
    app.get("/areas", async (req) => {
      const q = z.object({ lat: z.coerce.number().optional(), lng: z.coerce.number().optional() }).parse(req.query);
      const near = q.lat !== undefined && q.lng !== undefined;
      const areas = await sql`
        SELECT id, name, ST_Y(center::geometry) AS lat, ST_X(center::geometry) AS lng,
               ${near ? sql`round(ST_Distance(center, ST_MakePoint(${q.lng!}, ${q.lat!})::geography))::int` : sql`NULL::int`} AS meters
        FROM areas
        WHERE city = 'Hyderabad' AND center IS NOT NULL
        ORDER BY ${near ? sql`meters,` : sql``} name`;
      return { areas };
    });

    app.get("/places/:id", async (req) => {
      const { id } = z.object({ id: z.uuid() }).parse(req.params);
      const [place] = await sql`
        SELECT p.id, p.name, p.address, p.landmark, p.cuisines, p.is_delivery_only, p.status, p.merged_into,
               a.name AS area_name, ST_Y(p.geog::geometry) AS lat, ST_X(p.geog::geometry) AS lng
        FROM places p LEFT JOIN areas a ON a.id = p.area_id
        WHERE p.id = ${id} AND (p.status <> 'pending' OR p.added_by = ${req.user.id})`;
      if (!place) throw new HttpError(404, "place not found");
      const myRankings = await sql`
        SELECT experience, band, position, score FROM rankings
        WHERE user_id = ${req.user.id} AND place_id = ${id}`;
      const myVisits = await sql`
        SELECT id, visited_on, mode, feeling, audience FROM visits
        WHERE user_id = ${req.user.id} AND place_id = ${id}
        ORDER BY visited_on DESC, created_at DESC LIMIT 20`;
      const dishes = await sql`SELECT id, name FROM dishes WHERE place_id = ${id} ORDER BY name`;
      return { place, myRankings, myVisits, dishes };
    });

    // Adds a missing place for review. Similar names within 150 m come back first unless confirmed.
    app.post("/places", async (req, reply) => {
      const body = createPlaceBody.parse(req.body);
      const { confirm } = z.object({ confirm: z.stringbool().default(false) }).parse(req.query);
      const point = sql`ST_MakePoint(${body.lng}, ${body.lat})::geography`;
      if (!confirm) {
        const similar = await sql`
          SELECT id, name, status FROM places
          WHERE status IN ('open', 'pending') AND ST_DWithin(geog, ${point}, ${DUPLICATE_METERS})
            AND similarity(name, ${body.name}) > 0.3
          ORDER BY similarity(name, ${body.name}) DESC LIMIT 5`;
        if (similar.length > 0) throw new HttpError(409, "a similar place is close by", { similar });
      }
      const [place] = await sql`
        INSERT INTO places (name, area_id, address, landmark, geog, cuisines, is_delivery_only, status, added_by)
        VALUES (${body.name}, ${body.areaId ?? null}, ${body.address ?? null}, ${body.landmark ?? null},
                ${point}, ${body.cuisines}, ${body.isDeliveryOnly}, 'pending', ${req.user.id})
        RETURNING id, name, status`;
      return reply.status(201).send({ place });
    });
  };
