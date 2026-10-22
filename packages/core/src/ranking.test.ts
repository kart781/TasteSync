import { describe, expect, it } from "vitest";
import {
  bandScores,
  insertAt,
  MAX_QUESTIONS,
  placeFromAnswers,
  type Answer,
} from "./ranking";

// Simulates a user who knows the true order: the new place's true position is `target`.
function answersFor(band: string[], target: number): Answer[] {
  const answers: Answer[] = [];
  let lo = 1;
  let hi = band.length + 1;
  while (lo < hi && answers.length < MAX_QUESTIONS) {
    const mid = Math.floor((lo + hi) / 2);
    const better = target <= mid;
    answers.push({ otherPlaceId: band[mid - 1]!, outcome: better ? "better" : "worse" });
    if (better) hi = mid;
    else lo = mid + 1;
  }
  return answers;
}

const band = (k: number) => Array.from({ length: k }, (_, i) => `p${i + 1}`);

describe("bandScores (PRD step 3)", () => {
  it("matches the PRD example for a loved band of four", () => {
    expect(bandScores("loved", 4)).toEqual([9.4, 8.8, 8.2, 7.6]);
  });

  it("matches the PRD example after inserting a fifth place", () => {
    expect(bandScores("loved", 5)).toEqual([9.5, 9.0, 8.5, 8.0, 7.5]);
  });

  it("puts a band of one in the middle", () => {
    expect(bandScores("loved", 1)).toEqual([8.5]);
    expect(bandScores("fine", 1)).toEqual([5.5]); // 5.45 rounds half up, as numeric(3,1) does
    expect(bandScores("not_for_me", 1)).toEqual([2.0]); // 1.95
  });

  it("never touches the band edges", () => {
    const s = bandScores("not_for_me", 30);
    expect(Math.max(...s)).toBeLessThan(3.9);
    expect(Math.min(...s)).toBeGreaterThan(0);
  });

  it("returns nothing for an empty band", () => {
    expect(bandScores("fine", 0)).toEqual([]);
  });
});

describe("placeFromAnswers (PRD step 2)", () => {
  it("matches the PRD example: beats 3rd, beats 2nd, loses to 1st, lands at 2", () => {
    const b = band(4);
    const answers: Answer[] = [
      { otherPlaceId: "p3", outcome: "better" },
      { otherPlaceId: "p2", outcome: "better" },
      { otherPlaceId: "p1", outcome: "worse" },
    ];
    expect(placeFromAnswers(b, answers)).toEqual({ position: 2, questions: 3 });
  });

  it("asks nothing for the first place in a band", () => {
    expect(placeFromAnswers([], [])).toEqual({ position: 1, questions: 0 });
  });

  it("finds every exact position in a band of 15 with at most 4 questions", () => {
    const b = band(15);
    for (let target = 1; target <= 16; target++) {
      const answers = answersFor(b, target);
      expect(answers.length).toBeLessThanOrEqual(4);
      expect(placeFromAnswers(b, answers).position).toBe(target);
    }
  });

  it("stops after 4 questions in a band over 15 and lands in the narrowed range", () => {
    const b = band(40);
    const answers = answersFor(b, 1);
    expect(answers).toHaveLength(4);
    const { position } = placeFromAnswers(b, answers);
    expect(position).toBeGreaterThanOrEqual(1);
    expect(position).toBeLessThanOrEqual(3); // range [1, 3] after 4 halvings of 41 slots
  });

  it("puts a tie right below the compared place", () => {
    const b = band(4);
    expect(placeFromAnswers(b, [{ otherPlaceId: "p3", outcome: "tie" }]).position).toBe(4);
  });

  it("counts 'don't remember' toward the limit so the session ends", () => {
    const b = band(8);
    const skips: Answer[] = Array.from({ length: 4 }, () => ({ otherPlaceId: "p5", outcome: "skip" as const }));
    expect(placeFromAnswers(b, skips)).toEqual({ position: 5, questions: 4 });
  });

  it("rejects an answer about the wrong place", () => {
    expect(() => placeFromAnswers(band(4), [{ otherPlaceId: "p1", outcome: "better" }])).toThrow();
  });

  it("rejects missing answers", () => {
    expect(() => placeFromAnswers(band(4), [{ otherPlaceId: "p3", outcome: "better" }])).toThrow();
  });

  it("rejects extra answers", () => {
    const answers: Answer[] = [
      { otherPlaceId: "p1", outcome: "tie" },
      { otherPlaceId: "p1", outcome: "tie" },
    ];
    expect(() => placeFromAnswers(band(1), answers)).toThrow();
  });
});

describe("insertAt", () => {
  it("shifts places at or below the position down by one", () => {
    expect(insertAt(["a", "b", "c", "d"], 2, "new")).toEqual(["a", "new", "b", "c", "d"]);
    expect(insertAt([], 1, "new")).toEqual(["new"]);
    expect(insertAt(["a"], 2, "new")).toEqual(["a", "new"]);
  });
});
