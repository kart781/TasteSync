import { buildApp } from "./app";
import { makeVerifier } from "./auth";
import { connect } from "./db";
import { loadEnv } from "./env";

const env = loadEnv();
const app = buildApp({ sql: connect(env.DATABASE_URL), env, verify: makeVerifier(env) });
await app.listen({ port: env.PORT, host: "0.0.0.0" });
