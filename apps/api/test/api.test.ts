import { applyAnswer, nextQuestion, startSearch, type Answer } from "@tastesync/core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app";
import { makeVerifier } from "../src/auth";
import { connect, type Sql } from "../src/db";
import { loadEnv } from "../src/env";
import { startTestDb } from "./testdb";

let db: Awaited<ReturnType<typeof startTestDb>>;
let sql: Sql;
let app: ReturnType<typeof buildApp>;

beforeAll(async () => {
  db = await startTestDb(55000 + Math.floor(Math.random() * 1000));
  sql = connect(db.url, 1);
  const env = loadEnv({
    DATABASE_URL: db.url,
    PHONE_HASH_SECRET: "test-secret-test-secret-test-secret-123",
    DEV_AUTH: "true",
    NODE_ENV: "test",
  });
  app = buildApp({ sql, env, verify: makeVerifier(env) });
  await app.ready();
}, 120_000);

afterAll(async () => {
  await app?.close();
  await sql?.end();
  await db?.stop();
});

let userCounter = 0;
type Call = { method: "GET" | "POST" | "PATCH" | "DELETE"; url: string; body?: unknown };

async function newUser(birthDate = "1995-05-01") {
  const n = ++userCounter;
  const token = `dev:uid${n}:+9190000000${String(n).padStart(2, "0")}`;
  const call = ({ method, url, body }: Call) =>
    app.inject({ method, url, payload: body as object | undefined, headers: { authorization: `Bearer ${token}` } });
  const res = await call({
    method: "POST",
    url: "/auth/session",
    body: { username: `user${n}`, displayName: `User ${n}`, birthDate },
  });
  return { call, res, id: res.json().user?.id as string };
}

async function addPlace(name: string, lng = 78.4, lat = 17.42, status = "open") {
  const [p] = await sql`
    INSERT INTO places (name, geog, status) VALUES (${name}, ST_MakePoint(${lng}, ${lat})::geography, ${status})
    RETURNING id`;
  return p!.id as string;
}

// Answers a user who knows the true order would give: the new place belongs at `target`.
function answersFor(band: string[], target: number): Answer[] {
  const answers: Answer[] = [];
  let s = startSearch(band.length);
  for (let q = nextQuestion(s); q.kind === "ask"; q = nextQuestion(s)) {
    const outcome = target <= q.position ? "better" : "worse";
    answers.push({ otherPlaceId: band[q.position - 1]!, outcome });
    s = applyAnswer(s, q.position, outcome);
  }
  return answers;
}

async function band(call: Awaited<ReturnType<typeof newUser>>["call"], experience = "dine_in", b = "loved") {
  const res = await call({ method: "GET", url: `/me/rankings?experience=${experience}&band=${b}` });
  return res.json().places as { placeId: string; position: number | null; score: number | null }[];
}

// Logs places in true order, best first, so each lands at the bottom of the band.
async function logInOrder(user: Awaited<ReturnType<typeof newUser>>, placeIds: string[], mode = "dine_in") {
  for (const [i, placeId] of placeIds.entries()) {
    const current = (await band(user.call, mode === "dine_in" ? "dine_in" : "delivery")).map((p) => p.placeId);
    const res = await user.call({
      method: "POST",
      url: "/visits",
      body: { placeId, mode, feeling: "loved", comparisons: answersFor(current, i + 1) },
    });
    expect(res.statusCode, res.body).toBe(201);
  }
}

describe("sign-up", () => {
  it("blocks people under 18", async () => {
    const { res } = await newUser("2015-01-01");
    expect(res.statusCode).toBe(403);
  });

  it("creates an adult account once and signs in after", async () => {
    const user = await newUser();
    expect(user.res.statusCode).toBe(200);
    const again = await user.call({ method: "POST", url: "/auth/session" });
    expect(again.json().user.id).toBe(user.id);
    expect(again.json().user.homeAreaId).toBeNull();
    const [list] = await sql`SELECT kind FROM lists WHERE owner_id = ${user.id}`;
    expect(list!.kind).toBe("want_to_try");
  });

  it("stores only a keyed hash of the phone number", async () => {
    const user = await newUser();
    const [row] = await sql`SELECT phone_hash FROM users WHERE id = ${user.id}`;
    expect(row!.phoneHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("keeps the home area chosen at sign-up", async () => {
    const [area] = await sql`SELECT id FROM areas WHERE name = 'Kondapur'`;
    const n = ++userCounter;
    const res = await app.inject({
      method: "POST",
      url: "/auth/session",
      headers: { authorization: `Bearer dev:home${n}:+9181000000${String(n).padStart(2, "0")}` },
      payload: { username: `home${n}`, displayName: "Home", birthDate: "1990-01-01", homeAreaId: area!.id },
    });
    expect(res.json().user.homeAreaId).toBe(area!.id);
  });

  it("rejects requests without a token", async () => {
    const res = await app.inject({ method: "GET", url: "/me" });
    expect(res.statusCode).toBe(401);
  });
});

describe("place search", () => {
  it("finds a place despite a typo and orders nearby places by distance", async () => {
    const user = await newUser();
    await addPlace("Paradise Biryani Secunderabad", 78.4983, 17.4416);
    await addPlace("Shah Ghouse Cafe", 78.4, 17.42);
    const byName = await user.call({ method: "GET", url: "/places/search?q=paradize%20biryani" });
    expect(byName.json().places[0].name).toBe("Paradise Biryani Secunderabad");

    const near = await user.call({ method: "GET", url: "/places/search?lat=17.4201&lng=78.4001" });
    expect(near.json().places[0].name).toBe("Shah Ghouse Cafe");
  });

  it("shows a pending place only to the person who added it", async () => {
    const adder = await newUser();
    const other = await newUser();
    const res = await adder.call({ method: "POST", url: "/places", body: { name: "Ram ki Bandi", lat: 17.38, lng: 78.48 } });
    expect(res.statusCode).toBe(201);
    const mine = await adder.call({ method: "GET", url: "/places/search?q=Ram%20ki%20Bandi" });
    const theirs = await other.call({ method: "GET", url: "/places/search?q=Ram%20ki%20Bandi" });
    expect(mine.json().places).toHaveLength(1);
    expect(theirs.json().places).toHaveLength(0);
  });

  it("warns about a similar place close by before adding", async () => {
    const user = await newUser();
    await addPlace("Cafe Niloufer", 78.46, 17.4);
    const res = await user.call({ method: "POST", url: "/places", body: { name: "Niloufer Cafe", lat: 17.4001, lng: 78.4601 } });
    expect(res.statusCode).toBe(409);
    expect(res.json().similar[0].name).toBe("Cafe Niloufer");
    const confirmed = await user.call({
      method: "POST",
      url: "/places?confirm=true",
      body: { name: "Niloufer Cafe", lat: 17.4001, lng: 78.4601 },
    });
    expect(confirmed.statusCode).toBe(201);
  });
});

describe("location and modes", () => {
  // A quiet corner of the map so other tests' places stay out of range.
  const base = { lat: 17.3, lng: 78.6 };
  const at = (kmNorth: number) => ({ lat: base.lat + kmNorth / 111, lng: base.lng });

  it("browses Eat out and Order in like Swiggy and Zomato", async () => {
    const user = await newUser();
    const near = at(1);
    const dineOnly = await addPlace("Dine only", near.lng, near.lat);
    await sql`UPDATE places SET offers_delivery = false WHERE id = ${dineOnly}`;
    const kitchen = await addPlace("Cloud kitchen", near.lng, near.lat);
    await sql`UPDATE places SET is_delivery_only = true WHERE id = ${kitchen}`;
    const both = await addPlace("Does both", near.lng, near.lat);

    const names = async (mode: string) =>
      (await user.call({ method: "GET", url: `/places/search?lat=${base.lat}&lng=${base.lng}&mode=${mode}` }))
        .json()
        .places.map((p: { id: string }) => p.id)
        .sort();
    expect(await names("eat_out")).toEqual([dineOnly, both].sort());
    expect(await names("order_in")).toEqual([kitchen, both].sort());

    // A name search finds any place, whatever the mode.
    const byName = await user.call({ method: "GET", url: "/places/search?q=Cloud%20kitchen&mode=eat_out" });
    expect(byName.json().places[0].id).toBe(kitchen);
  });

  it("keeps location browsing inside the radius", async () => {
    const user = await newUser();
    const far = at(8);
    const farAway = await addPlace("Eight km away", far.lng, far.lat);
    const ids = async (extra: string) =>
      (await user.call({ method: "GET", url: `/places/search?lat=${base.lat}&lng=${base.lng}${extra}` }))
        .json()
        .places.map((p: { id: string }) => p.id);
    expect(await ids("")).not.toContain(farAway); // Eat out default: 5 km
    expect(await ids("&radiusKm=10")).toContain(farAway);
    expect(await ids("&radiusKm=0")).toContain(farAway); // all of the city
  });

  it("labels a point with the nearest launch area", async () => {
    const user = await newUser();
    const res = await user.call({ method: "GET", url: "/areas?lat=17.3616&lng=78.4747" }); // Charminar
    const areas = res.json().areas;
    expect(areas).toHaveLength(10);
    expect(areas[0]).toMatchObject({ name: "Old City", meters: 0 });
    // Public, so sign-up can offer a home area before the account exists.
    const anonymous = await app.inject({ method: "GET", url: "/areas" });
    expect(anonymous.statusCode).toBe(200);
  });
});

describe("log and rank", () => {
  it("reproduces the PRD example through the API", async () => {
    const user = await newUser();
    const places = await Promise.all(["A", "B", "C", "D"].map((n) => addPlace(`Biryani ${n} ${userCounter}`)));
    await logInOrder(user, places);
    expect((await band(user.call)).map((p) => p.score)).toEqual([9.4, 8.8, 8.2, 7.6]);

    const fresh = await addPlace(`New biryani ${userCounter}`);
    const res = await user.call({
      method: "POST",
      url: "/visits",
      body: {
        placeId: fresh,
        feeling: "loved",
        comparisons: [
          { otherPlaceId: places[2], outcome: "better" },
          { otherPlaceId: places[1], outcome: "better" },
          { otherPlaceId: places[0], outcome: "worse" },
        ],
      },
    });
    expect(res.statusCode, res.body).toBe(201);
    expect(res.json()).toMatchObject({ position: 2, score: 9.0 });
    const after = await band(user.call);
    expect(after.map((p) => p.placeId)).toEqual([places[0], fresh, places[1], places[2], places[3]]);
    expect(after.map((p) => p.score)).toEqual([9.5, 9.0, 8.5, 8.0, 7.5]);
    const [{ count }] = await sql`SELECT count(*)::int AS count FROM comparisons WHERE new_place_id = ${fresh}`;
    expect(count).toBe(3);
  });

  it("rejects answers that are not the questions it would ask, and saves nothing", async () => {
    const user = await newUser();
    const places = await Promise.all(["A", "B"].map((n) => addPlace(`Irani ${n} ${userCounter}`)));
    await logInOrder(user, places);
    const fresh = await addPlace(`Irani new ${userCounter}`);
    const res = await user.call({
      method: "POST",
      url: "/visits",
      body: { placeId: fresh, feeling: "loved", comparisons: [{ otherPlaceId: places[0], outcome: "better" }] },
    });
    expect(res.statusCode).toBe(409);
    const [{ count }] = await sql`SELECT count(*)::int AS count FROM visits WHERE place_id = ${fresh}`;
    expect(count).toBe(0);
    expect((await band(user.call)).map((p) => p.score)).toEqual([9.0, 8.0]);
  });

  it("keeps dine-in and delivery lists apart", async () => {
    const user = await newUser();
    const [a, b] = await Promise.all(["A", "B"].map((n) => addPlace(`Kitchen ${n} ${userCounter}`)));
    await logInOrder(user, [a!]);
    // First delivery visit: nothing to compare with, even though the dine-in list has a place.
    const res = await user.call({ method: "POST", url: "/visits", body: { placeId: b, mode: "takeaway", feeling: "loved" } });
    expect(res.json()).toMatchObject({ experience: "delivery", position: 1, score: 8.5 });
    expect((await band(user.call, "dine_in")).map((p) => p.placeId)).toEqual([a]);
    expect((await band(user.call, "delivery")).map((p) => p.placeId)).toEqual([b]);
  });

  it("closes the gap when the only visit to a place is deleted", async () => {
    const user = await newUser();
    const places = await Promise.all(["A", "B", "C"].map((n) => addPlace(`Tiffin ${n} ${userCounter}`)));
    await logInOrder(user, places);
    const [visit] = await sql`SELECT id FROM visits WHERE user_id = ${user.id} AND place_id = ${places[1]!}`;
    const res = await user.call({ method: "DELETE", url: `/visits/${visit!.id}` });
    expect(res.statusCode).toBe(204);
    const after = await band(user.call);
    expect(after.map((p) => p.placeId)).toEqual([places[0], places[2]]);
    expect(after.map((p) => p.position)).toEqual([1, 2]);
  });

  it("keeps the ranking when another visit to the place remains", async () => {
    const user = await newUser();
    const [a] = [await addPlace(`Haleem ${userCounter}`)];
    await logInOrder(user, [a!]);
    const again = await user.call({ method: "POST", url: "/visits", body: { placeId: a, feeling: "loved", keepPosition: true } });
    expect(again.statusCode, again.body).toBe(201);
    const { visitId } = again.json();
    await user.call({ method: "DELETE", url: `/visits/${visitId}` });
    expect((await band(user.call)).map((p) => p.placeId)).toEqual([a]);
  });

  it("lets a place skip comparisons, then ranks it later", async () => {
    const user = await newUser();
    const places = await Promise.all(["A", "B"].map((n) => addPlace(`Mandi ${n} ${userCounter}`)));
    await logInOrder(user, places);
    const fresh = await addPlace(`Mandi new ${userCounter}`);
    const skipped = await user.call({
      method: "POST",
      url: "/visits",
      body: { placeId: fresh, feeling: "loved", skipComparisons: true },
    });
    expect(skipped.json()).toMatchObject({ position: null, score: null });

    const rank = await user.call({
      method: "POST",
      url: "/me/rankings/rank",
      body: { placeId: fresh, experience: "dine_in", band: "loved", comparisons: [{ otherPlaceId: places[1], outcome: "worse" }] },
    });
    expect(rank.statusCode, rank.body).toBe(200);
    expect(rank.json()).toMatchObject({ position: 3 });
  });

  it("moves a place to its new band when the feeling changes", async () => {
    const user = await newUser();
    const places = await Promise.all(["A", "B"].map((n) => addPlace(`Chai ${n} ${userCounter}`)));
    await logInOrder(user, places);
    const [visit] = await sql`SELECT id FROM visits WHERE user_id = ${user.id} AND place_id = ${places[0]!}`;
    const res = await user.call({ method: "PATCH", url: `/visits/${visit!.id}`, body: { feeling: "fine" } });
    expect(res.json()).toMatchObject({ needsRanking: true });
    expect((await band(user.call, "dine_in", "loved")).map((p) => [p.placeId, p.score])).toEqual([[places[1], 8.5]]);
    expect((await band(user.call, "dine_in", "fine")).map((p) => p.position)).toEqual([null]);
  });

  it("reorders a band by drag", async () => {
    const user = await newUser();
    const places = await Promise.all(["A", "B", "C"].map((n) => addPlace(`Kebab ${n} ${userCounter}`)));
    await logInOrder(user, places);
    const order = [places[2]!, places[0]!, places[1]!];
    const res = await user.call({
      method: "PATCH",
      url: "/me/rankings/order",
      body: { experience: "dine_in", band: "loved", placeIds: order },
    });
    expect(res.statusCode, res.body).toBe(200);
    expect((await band(user.call)).map((p) => p.placeId)).toEqual(order);
    const partial = await user.call({
      method: "PATCH",
      url: "/me/rankings/order",
      body: { experience: "dine_in", band: "loved", placeIds: order.slice(0, 2) },
    });
    expect(partial.statusCode).toBe(409);
  });

  it("cannot touch another user's visit", async () => {
    const owner = await newUser();
    const stranger = await newUser();
    const [a] = [await addPlace(`Pathar ka gosht ${userCounter}`)];
    await logInOrder(owner, [a!]);
    const [visit] = await sql`SELECT id FROM visits WHERE user_id = ${owner.id}`;
    const del = await stranger.call({ method: "DELETE", url: `/visits/${visit!.id}` });
    expect(del.statusCode).toBe(404);
    const read = await stranger.call({ method: "GET", url: `/visits/${visit!.id}` });
    expect(read.statusCode).toBe(404);
    const own = await owner.call({ method: "GET", url: `/visits/${visit!.id}` });
    expect(own.json().visit).toMatchObject({ placeId: a, score: 8.5, dishes: [] });
  });

  it("shows visits in the month's diary with their score", async () => {
    const user = await newUser();
    const [a] = [await addPlace(`Osmania biscuits ${userCounter}`)];
    await user.call({ method: "POST", url: "/visits", body: { placeId: a, feeling: "fine", visitedOn: "2026-09-14" } });
    const diary = await user.call({ method: "GET", url: "/me/diary?month=2026-09" });
    expect(diary.json()).toMatchObject({ count: 1, visits: [{ placeId: a, score: 5.5, visitedOn: "2026-09-14" }] });
    const empty = await user.call({ method: "GET", url: "/me/diary?month=2026-10" });
    expect(empty.json().count).toBe(0);
  });

  it("records log time for the log_saved event", async () => {
    const user = await newUser();
    const [a] = [await addPlace(`Double ka meetha ${userCounter}`)];
    const startedAt = new Date(Date.now() - 30_000).toISOString();
    await user.call({ method: "POST", url: "/visits", body: { placeId: a, feeling: "loved", logStartedAt: startedAt } });
    const [event] = await sql`SELECT props FROM events WHERE user_id = ${user.id} AND name = 'log_saved'`;
    expect(event!.props.durationMs).toBeGreaterThanOrEqual(30_000);
  });
});
