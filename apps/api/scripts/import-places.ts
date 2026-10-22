// Imports seed places from a CSV as open places.
// Usage: npm run import-places -w @tastesync/api -- places.csv
// Columns: name,lat,lng,area,address,landmark,cuisines,delivery_only
//   area must match a launch area name; cuisines are separated by ";"; delivery_only is yes/no.
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { connect } from "../src/db";

const row = z.object({
  name: z.string().trim().min(2),
  lat: z.coerce.number().min(17).max(18), // Hyderabad
  lng: z.coerce.number().min(78).max(79),
  area: z.string().trim().min(1),
  address: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  cuisines: z.string().optional(),
  delivery_only: z.string().optional(),
});

const file = process.argv[2];
if (!file) throw new Error("pass the CSV path");
const sql = connect(process.env.DATABASE_URL!);
const areas = new Map((await sql`SELECT id, name FROM areas`).map((a) => [String(a.name).toLowerCase(), a.id]));
const records: Record<string, string>[] = parse(readFileSync(file), { columns: true, skip_empty_lines: true, trim: true });

let added = 0;
const problems: string[] = [];
for (const [i, raw] of records.entries()) {
  const line = i + 2;
  const parsed = row.safeParse(raw);
  if (!parsed.success) {
    problems.push(`line ${line}: ${parsed.error.issues.map((x) => `${x.path.join(".")} ${x.message}`).join(", ")}`);
    continue;
  }
  const r = parsed.data;
  const areaId = areas.get(r.area.toLowerCase());
  if (!areaId) {
    problems.push(`line ${line}: unknown area "${r.area}"`);
    continue;
  }
  const point = sql`ST_MakePoint(${r.lng}, ${r.lat})::geography`;
  const [dupe] = await sql`
    SELECT name FROM places WHERE ST_DWithin(geog, ${point}, 150) AND similarity(name, ${r.name}) > 0.5 LIMIT 1`;
  if (dupe) {
    problems.push(`line ${line}: skipped, looks like "${dupe.name}"`);
    continue;
  }
  const cuisines = (r.cuisines ?? "").split(";").map((c) => c.trim().toLowerCase()).filter(Boolean);
  await sql`
    INSERT INTO places (name, area_id, address, landmark, geog, cuisines, is_delivery_only, status)
    VALUES (${r.name}, ${areaId}, ${r.address || null}, ${r.landmark || null}, ${point}, ${cuisines},
            ${/^(yes|y|true|1)$/i.test(r.delivery_only ?? "")}, 'open')`;
  added++;
}
console.log(`added ${added} of ${records.length} places`);
for (const p of problems) console.log(p);
await sql.end();
