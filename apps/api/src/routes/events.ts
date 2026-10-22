import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import type { Deps } from "../app";

// Events the app sends; log_saved is recorded by the API when a visit is saved.
const body = z.object({
  name: z.enum(["log_started", "comparison_answered", "comparison_skipped", "search_performed"]),
  props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
});

export const eventRoutes =
  ({ sql }: Deps): FastifyPluginAsync =>
  async (app) => {
    app.post("/events", async (req, reply) => {
      const { name, props } = body.parse(req.body);
      await sql`INSERT INTO events (user_id, name, props) VALUES (${req.user.id}, ${name}, ${sql.json(props)})`;
      return reply.status(204).send();
    });
  };
