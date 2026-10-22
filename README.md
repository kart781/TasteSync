# TasteSync

A food diary you keep with your friends: log, rank, share. See [docs/PRD.md](docs/PRD.md).

| Folder | What |
| --- | --- |
| `apps/mobile` | iOS and Android app (Expo, Expo Router) |
| `apps/api` | API (Fastify, Postgres via `postgres.js`) |
| `packages/core` | Ranking engine, score formulas and request schemas, shared by app and API |
| `db/migrations` | Database schema (dbmate format) |

## Setup

Needs **Node 22** or newer (`.nvmrc`).

```sh
npm install
cp apps/api/.env.example apps/api/.env        # set PHONE_HASH_SECRET (openssl rand -hex 32)
cp apps/mobile/.env.example apps/mobile/.env  # set your computer's LAN IP
```

Run these in three terminals:

```sh
npm run db:dev -w @tastesync/api   # local Postgres (PGlite, PostGIS, pg_trgm) on :5432, no Docker needed
npm run api                        # API on :3000
npm run mobile                     # Expo dev server; open in Expo Go
```

Load places with `npm run import-places -w @tastesync/api -- ../../db/seeds/places.example.csv`.

With `DEV_AUTH=true` (API) and `EXPO_PUBLIC_DEV_AUTH=true` (app), sign-in takes any Indian mobile number and the code `123456`, so the app runs in Expo Go.

## Real phone sign-in (Firebase)

1. Create a Firebase project and turn on Phone sign-in.
2. Add an Android app and an iOS app with the id `app.tastesync`, or change it in `apps/mobile/app.json`. For Android, add your SHA-1 fingerprints.
3. Put `google-services.json` and `GoogleService-Info.plist` in `apps/mobile/`. `app.config.ts` turns on the Firebase plugins once both files are present.
4. Download a service account key for the API and set `FIREBASE_SERVICE_ACCOUNT` in `apps/api/.env`.
5. Set `EXPO_PUBLIC_DEV_AUTH=false` and build a development client: `npx eas-cli build --profile development`.

## Tests

```sh
npm test
```

- `packages/core`: the PRD's worked examples (band scores, binary insertion, city score, taste match).
- `apps/api`: runs against an in-memory Postgres with PostGIS. Covers sign-up, search, logging, ranking, edits, deletes, reorder and the diary.

## Production database

Any Postgres 14+ with PostGIS and pg_trgm (e.g. Supabase or Neon in an Indian region). Apply migrations with `dbmate --migrations-dir db/migrations up`.
