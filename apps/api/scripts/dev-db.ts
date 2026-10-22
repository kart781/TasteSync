// Local development database on port 5432, stored in apps/api/.pglite. Ctrl+C to stop.
// Swap DATABASE_URL to a real Postgres (Docker or managed) whenever you like.
import { startTestDb } from "../test/testdb";

const db = await startTestDb(5432, "./.pglite");
console.log(`dev database ready: ${db.url}`);
process.on("SIGINT", async () => {
  await db.stop();
  process.exit(0);
});
