import Fastify, { type FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AuthError, type VerifyToken } from "./auth";
import type { Sql } from "./db";
import type { Env } from "./env";
import { RankingError } from "./rankings";
import { authRoutes } from "./routes/auth";
import { eventRoutes } from "./routes/events";
import { meRoutes } from "./routes/me";
import { placeRoutes } from "./routes/places";
import { visitRoutes } from "./routes/visits";

export type Deps = { sql: Sql; env: Env; verify: VerifyToken };
export type User = { id: string; username: string };

declare module "fastify" {
  interface FastifyRequest {
    user: User;
  }
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public extra: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export function bearer(req: FastifyRequest): string {
  const header = req.headers.authorization ?? "";
  if (!header.startsWith("Bearer ")) throw new HttpError(401, "missing token");
  return header.slice(7);
}

// /areas is public so sign-up can offer a home area before the account exists.
const PUBLIC_ROUTES = new Set(["/health", "/auth/session", "/areas"]);

export function buildApp(deps: Deps) {
  const app = Fastify({
    logger:
      deps.env.NODE_ENV === "test"
        ? false
        : {
            // Paths only: query strings carry locations, which are never logged (PRD privacy).
            serializers: { req: (req: { method: string; url: string }) => ({ method: req.method, url: req.url.split("?")[0] }) },
          },
  });

  app.decorateRequest("user", null as unknown as User);

  app.addHook("onRequest", async (req) => {
    if (PUBLIC_ROUTES.has(req.routeOptions.url ?? "")) return;
    const identity = await deps.verify(bearer(req));
    const [user] = await deps.sql<User[]>`
      SELECT id, username FROM users WHERE firebase_uid = ${identity.uid} AND deleted_at IS NULL`;
    if (!user) throw new HttpError(401, "sign up first");
    req.user = user;
  });

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof HttpError) return reply.status(err.status).send({ error: err.message, ...err.extra });
    if (err instanceof AuthError) return reply.status(401).send({ error: err.message });
    if (err instanceof ZodError) return reply.status(400).send({ error: "invalid request", issues: err.issues });
    if (err instanceof RankingError) return reply.status(409).send({ error: err.message });
    const status = (err as { statusCode?: number }).statusCode;
    if (status && status < 500) return reply.status(status).send({ error: (err as Error).message });
    req.log.error(err);
    return reply.status(500).send({ error: "something went wrong" });
  });

  app.get("/health", async () => ({ ok: true }));
  app.register(authRoutes(deps));
  app.register(meRoutes(deps));
  app.register(placeRoutes(deps));
  app.register(visitRoutes(deps));
  app.register(eventRoutes(deps));
  return app;
}
