import { describe, expect, it } from "vitest";
import { cityScore, tasteMatch } from "./scores";

describe("cityScore", () => {
  it("matches the PRD example: 8.5, 9.0, 7.5 in a city with mean 7.0 shows 7.7", () => {
    const rankings = [8.5, 9.0, 7.5].map((score) => ({ score, hosted: false }));
    expect(cityScore(rankings, 7.0)).toBe(7.7);
  });

  it("counts hosted meals at half weight", () => {
    // (0.5 * 10 + 3 * 7) / (0.5 + 3) = 26 / 3.5 = 7.43
    expect(cityScore([{ score: 10, hosted: true }], 7.0)).toBe(7.4);
  });

  it("returns the city mean with no rankings", () => {
    expect(cityScore([], 6.8)).toBe(6.8);
  });
});

describe("tasteMatch", () => {
  it("matches the PRD example: Ravi and Asha share six places, 91% agreement, 72% match", () => {
    const result = tasteMatch([0.5, 1.0, 0.0, 2.0, 1.5, 0.5]);
    expect(result).not.toBeNull();
    expect(Math.round(result!.agreement * 100)).toBe(91); // 90.8%
    expect(Math.round(result!.match * 100)).toBe(72); // 72.3%
  });

  it("is never shown for fewer than three shared places", () => {
    expect(tasteMatch([0.5, 1.0])).toBeNull();
  });
});
