// Postgres without Docker: PGlite (Postgres in WebAssembly) with PostGIS and pg_trgm,
// served over the normal wire protocol so the API's driver connects as it would in production.
// Used by the tests (in memory) and by `npm run db:dev` (on disk).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { postgis } from "@electric-sql/pglite-postgis";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const migrationsDir = join(import.meta.dirname, "../../../db/migrations");

// Applies pending migrations, recording them in dbmate's schema_migrations table.
async function migrate(db: PGlite) {
  await db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version varchar(128) PRIMARY KEY)");
  const done = new Set((await db.query<{ version: string }>("SELECT version FROM schema_migrations")).rows.map((r) => r.version));
  for (const file of readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort()) {
    const version = file.split("_")[0]!;
    if (done.has(version)) continue;
    const up = readFileSync(join(migrationsDir, file), "utf8").split("-- migrate:down")[0]!.replace("-- migrate:up", "");
    await db.transaction(async (tx) => {
      await tx.exec(up);
      await tx.query("INSERT INTO schema_migrations (version) VALUES ($1)", [version]);
    });
  }
}

export async function startTestDb(port: number, dataDir?: string) {
  const db = await PGlite.create({ dataDir, extensions: { postgis, pg_trgm } });
  await migrate(db);
  const server = new PGLiteSocketServer({ db, port });
  await server.start();
  return {
    url: `postgres://postgres:postgres@127.0.0.1:${port}/postgres`,
    async stop() {
      await server.stop();
      await db.close();
    },
  };
}
