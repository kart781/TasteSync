import { round1 } from "./ranking";

const CITY_PRIOR = 3;
const HOSTED_WEIGHT = 0.5;
const MATCH_PRIOR = 5;
export const MIN_SHARED_PLACES = 3;

// Smoothed city score (PRD "Scores other people see"). cityMean is the mean for that list.
export function cityScore(rankings: readonly { score: number; hosted: boolean }[], cityMean: number): number {
  let weighted = CITY_PRIOR * cityMean;
  let weights = CITY_PRIOR;
  for (const r of rankings) {
    const w = r.hosted ? HOSTED_WEIGHT : 1;
    weighted += w * r.score;
    weights += w;
  }
  return round1(weighted / weights);
}

// Taste match from the score gaps on shared places; null below the minimum.
export function tasteMatch(gaps: readonly number[]): { agreement: number; match: number } | null {
  const n = gaps.length;
  if (n < MIN_SHARED_PLACES) return null;
  const agreement = 1 - gaps.reduce((a, g) => a + Math.abs(g), 0) / n / 10;
  return { agreement, match: (n * agreement + MATCH_PRIOR * 0.5) / (n + MATCH_PRIOR) };
}
