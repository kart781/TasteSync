import { isAdult, signUpBody } from "@tastesync/core";
import type { FastifyPluginAsync } from "fastify";
import { bearer, HttpError, type Deps } from "../app";
import { phoneHash } from "../auth";

export const authRoutes =
  ({ sql, env, verify }: Deps): FastifyPluginAsync =>
  async (app) => {
    // Signs in with a Firebase phone token. A new number also needs the sign-up fields.
    app.post("/auth/session", async (req) => {
      const identity = await verify(bearer(req));
      const [existing] = await sql`
        SELECT id, username, display_name, home_area_id FROM users WHERE firebase_uid = ${identity.uid} AND deleted_at IS NULL`;
      if (existing) return { user: existing };

      if (!req.body) throw new HttpError(404, "no account yet", { needsSignUp: true });
      const body = signUpBody.parse(req.body);
      if (!isAdult(body.birthDate)) throw new HttpError(403, "TasteSync is for people 18 and over");

      const [taken] = await sql`SELECT 1 FROM users WHERE username = ${body.username}`;
      if (taken) throw new HttpError(409, "that username is taken");

      const user = await sql.begin(async (tx) => {
        const [created] = await tx`
          INSERT INTO users (username, display_name, firebase_uid, phone_hash, birth_date, home_area_id)
          VALUES (${body.username}, ${body.displayName}, ${identity.uid},
                  ${phoneHash(env.PHONE_HASH_SECRET, identity.phone)}, ${body.birthDate}, ${body.homeAreaId ?? null})
          ON CONFLICT DO NOTHING
          RETURNING id, username, display_name, home_area_id`;
        if (!created) throw new HttpError(409, "that username or phone number is already registered");
        await tx`INSERT INTO lists (owner_id, name, kind) VALUES (${created.id}, 'Want to try', 'want_to_try')`;
        return created;
      });
      return { user };
    });
  };
