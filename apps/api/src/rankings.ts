// Writes to a user's ranked lists. Every function runs inside the caller's transaction,
// after lockList, so two saves for the same list cannot interleave.
import {
  bandScores,
  insertAt,
  InvalidAnswersError,
  placeFromAnswers,
  type Answer,
  type Band,
  type Experience,
} from "@tastesync/core";
import type { Tx } from "./db";

export class RankingError extends Error {}

export async function lockList(tx: Tx, userId: string, experience: Experience) {
  await tx`SELECT pg_advisory_xact_lock(hashtext(${`${userId}:${experience}`}))`;
}

export async function rankedBand(tx: Tx, userId: string, experience: Experience, band: Band): Promise<string[]> {
  const rows = await tx<{ placeId: string }[]>`
    SELECT place_id FROM rankings
    WHERE user_id = ${userId} AND experience = ${experience} AND band = ${band} AND position IS NOT NULL
    ORDER BY position`;
  return rows.map((r) => r.placeId);
}

// Sets positions 1..n and scores for the given places, best first.
async function writeBand(tx: Tx, userId: string, experience: Experience, band: Band, placeIds: string[]) {
  if (placeIds.length === 0) return;
  const positions = placeIds.map((_, i) => i + 1);
  const scores = bandScores(band, placeIds.length).map(String);
  await tx`
    UPDATE rankings r
    SET band = ${band}, position = v.position, score = v.score::numeric, updated_at = now()
    FROM unnest(${placeIds}::uuid[], ${positions}::int[], ${scores}::text[]) AS v(place_id, position, score)
    WHERE r.user_id = ${userId} AND r.experience = ${experience} AND r.place_id = v.place_id`;
}

// Takes a place out of its band (if ranked) and closes the gap. Deletes the row when asked.
export async function removeFromList(
  tx: Tx,
  userId: string,
  placeId: string,
  experience: Experience,
  { deleteRow }: { deleteRow: boolean },
) {
  const [current] = await tx<{ band: Band; position: number | null }[]>`
    SELECT band, position FROM rankings
    WHERE user_id = ${userId} AND place_id = ${placeId} AND experience = ${experience}`;
  if (!current) return;
  if (deleteRow) {
    await tx`DELETE FROM rankings WHERE user_id = ${userId} AND place_id = ${placeId} AND experience = ${experience}`;
  } else {
    await tx`UPDATE rankings SET position = NULL, score = NULL, updated_at = now()
      WHERE user_id = ${userId} AND place_id = ${placeId} AND experience = ${experience}`;
  }
  if (current.position !== null) {
    const rest = (await rankedBand(tx, userId, experience, current.band)).filter((id) => id !== placeId);
    await writeBand(tx, userId, experience, current.band, rest);
  }
}

// Puts a place into a band: ranked from the answers, or unranked when skipped.
// Returns the place's new position and score (null when unranked).
export async function rankPlace(
  tx: Tx,
  args: {
    userId: string;
    placeId: string;
    experience: Experience;
    band: Band;
    answers: readonly Answer[];
    skip: boolean;
  },
): Promise<{ position: number | null; score: number | null }> {
  const { userId, placeId, experience, band, answers, skip } = args;
  await removeFromList(tx, userId, placeId, experience, { deleteRow: false });
  await tx`
    INSERT INTO rankings (user_id, place_id, experience, band)
    VALUES (${userId}, ${placeId}, ${experience}, ${band})
    ON CONFLICT (user_id, place_id, experience) DO UPDATE SET band = EXCLUDED.band, updated_at = now()`;
  if (skip) {
    if (answers.length > 0) throw new RankingError("answers sent with skip");
    return { position: null, score: null };
  }
  const bandIds = await rankedBand(tx, userId, experience, band);
  let position: number;
  try {
    position = placeFromAnswers(bandIds, answers).position;
  } catch (e) {
    if (e instanceof InvalidAnswersError) throw new RankingError(e.message);
    throw e;
  }
  const ordered = insertAt(bandIds, position, placeId);
  await writeBand(tx, userId, experience, band, ordered);
  return { position, score: bandScores(band, ordered.length)[position - 1]! };
}

// Drag to reorder: placeIds must be every place in the band (ranked or not), best first.
export async function reorderBand(tx: Tx, userId: string, experience: Experience, band: Band, placeIds: string[]) {
  const rows = await tx<{ placeId: string }[]>`
    SELECT place_id FROM rankings WHERE user_id = ${userId} AND experience = ${experience} AND band = ${band}`;
  const current = new Set(rows.map((r) => r.placeId));
  if (new Set(placeIds).size !== placeIds.length || placeIds.length !== current.size || !placeIds.every((id) => current.has(id))) {
    throw new RankingError("the order must list every place in the band exactly once");
  }
  await writeBand(tx, userId, experience, band, placeIds);
}
