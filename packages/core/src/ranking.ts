// Binary-insertion ranking from the PRD ("Ranking and taste match").
// Runs on the phone to ask questions and on the server to replay the answers.

export type Band = "loved" | "fine" | "not_for_me";
export type Outcome = "better" | "worse" | "tie" | "skip"; // skip = "don't remember"
export type Answer = { otherPlaceId: string; outcome: Outcome };

export const MAX_QUESTIONS = 4;

export const BAND_RANGE: Record<Band, { low: number; high: number }> = {
  loved: { low: 7.0, high: 10.0 },
  fine: { low: 4.0, high: 6.9 },
  not_for_me: { low: 0.0, high: 3.9 },
};

// Positions are 1-based; the new place will be inserted at a position in [lo, hi].
export type Search = { lo: number; hi: number; asked: number };

export function startSearch(bandSize: number): Search {
  return { lo: 1, hi: bandSize + 1, asked: 0 };
}

// "ask" carries the position of the place to compare with; "done" carries the final position.
export function nextQuestion(s: Search): { kind: "ask" | "done"; position: number } {
  if (s.lo >= s.hi) return { kind: "done", position: s.lo };
  const mid = Math.floor((s.lo + s.hi) / 2);
  if (s.asked >= MAX_QUESTIONS) return { kind: "done", position: mid };
  return { kind: "ask", position: mid };
}

export function applyAnswer(s: Search, mid: number, outcome: Outcome): Search {
  const asked = s.asked + 1;
  switch (outcome) {
    case "better": // new place beats the one at mid
      return { lo: s.lo, hi: mid, asked };
    case "worse":
      return { lo: mid + 1, hi: s.hi, asked };
    case "tie": // sits right below it
      return { lo: mid + 1, hi: mid + 1, asked };
    case "skip":
      return { ...s, asked };
  }
}

export class InvalidAnswersError extends Error {}

// Replays answers against the band (place ids, best first) and returns the final position.
// Throws if the answers are not exactly the questions the algorithm would have asked.
export function placeFromAnswers(
  bandPlaceIds: readonly string[],
  answers: readonly Answer[],
): { position: number; questions: number } {
  let s = startSearch(bandPlaceIds.length);
  for (const answer of answers) {
    const q = nextQuestion(s);
    if (q.kind === "done") throw new InvalidAnswersError("more answers than questions");
    if (bandPlaceIds[q.position - 1] !== answer.otherPlaceId) {
      throw new InvalidAnswersError(`expected a comparison with ${bandPlaceIds[q.position - 1]}`);
    }
    s = applyAnswer(s, q.position, answer.outcome);
  }
  const end = nextQuestion(s);
  if (end.kind === "ask") throw new InvalidAnswersError("comparisons not finished");
  return { position: end.position, questions: answers.length };
}

export function insertAt<T>(band: readonly T[], position: number, item: T): T[] {
  return [...band.slice(0, position - 1), item, ...band.slice(position - 1)];
}

// Half-up rounding to one decimal, matching Postgres numeric(3,1).
export function round1(x: number): number {
  return Math.round(x * 10 + 1e-9) / 10;
}

// Scores for positions 1..k of a band, best first (PRD step 3).
export function bandScores(band: Band, k: number): number[] {
  const { low, high } = BAND_RANGE[band];
  return Array.from({ length: k }, (_, i) => round1(low + ((high - low) * (k - i)) / (k + 1)));
}
