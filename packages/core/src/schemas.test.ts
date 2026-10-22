import { describe, expect, it } from "vitest";
import { createVisitBody, isAdult } from "./schemas";

describe("isAdult", () => {
  const today = new Date("2026-10-21T10:00:00Z");
  it("allows someone who turns 18 today", () => {
    expect(isAdult("2008-10-21", today)).toBe(true);
  });
  it("blocks someone who turns 18 tomorrow", () => {
    expect(isAdult("2008-10-22", today)).toBe(false);
  });
});

describe("createVisitBody", () => {
  const placeId = "7d0f4c4e-1c1a-4a59-9d3e-2f1f1c3b9a10";
  it("needs only place and feeling", () => {
    const v = createVisitBody.parse({ placeId, feeling: "loved" });
    expect(v.mode).toBe("dine_in");
    expect(v.audience).toBe("friends");
  });
  it("needs a circle when the audience is circle", () => {
    expect(createVisitBody.safeParse({ placeId, feeling: "fine", audience: "circle" }).success).toBe(false);
  });
});
