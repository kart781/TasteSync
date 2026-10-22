import { describe, expect, it } from "vitest";
import { heat, priceBand, shelvesFor, type ShelfInput } from "./discovery";

describe("heat", () => {
  it("counts a visit today as 1 and halves each week", () => {
    expect(heat([0])).toBe(1);
    expect(heat([7])).toBe(0.5);
    expect(heat([0, 7, 14])).toBe(1.75);
  });
});

describe("priceBand", () => {
  it("uses the PRD bands", () => {
    expect(priceBand(250)).toBe(1);
    expect(priceBand(300)).toBe(1);
    expect(priceBand(301)).toBe(2);
    expect(priceBand(700)).toBe(2);
    expect(priceBand(1500)).toBe(3);
    expect(priceBand(1501)).toBe(4);
  });
});

const place = (over: Partial<ShelfInput>): ShelfInput => ({
  cityScore: 7.0,
  rankings: 3,
  heat: 0,
  visitors14d: 0,
  priceBand: 2,
  ...over,
});

describe("shelvesFor", () => {
  it("puts a busy, liked place on Hottest", () => {
    expect(shelvesFor(place({ heat: 3.2, visitors14d: 3 }))).toContain("hottest");
  });
  it("keeps one person's daily visits off Hottest", () => {
    expect(shelvesFor(place({ heat: 6, visitors14d: 1 }))).not.toContain("hottest");
  });
  it("keeps a busy but disliked place off Hottest", () => {
    expect(shelvesFor(place({ heat: 5, visitors14d: 5, cityScore: 6.4 }))).not.toContain("hottest");
  });
  it("finds Cheap and best", () => {
    expect(shelvesFor(place({ priceBand: 1, cityScore: 7.5 }))).toContain("cheap_and_best");
    expect(shelvesFor(place({ priceBand: 2, cityScore: 9 }))).not.toContain("cheap_and_best");
  });
  it("needs 5 rankings for Highest rated", () => {
    expect(shelvesFor(place({ rankings: 5 }))).toContain("highest_rated");
    expect(shelvesFor(place({ rankings: 4 }))).not.toContain("highest_rated");
  });
  it("finds Hidden gems between 3 and 9 rankings", () => {
    expect(shelvesFor(place({ cityScore: 8.1, rankings: 3 }))).toContain("hidden_gems");
    expect(shelvesFor(place({ cityScore: 8.1, rankings: 10 }))).not.toContain("hidden_gems");
  });
});
