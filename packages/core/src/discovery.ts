// Discover shelf rules (PRD "Discover and location"). The nightly job computes the inputs;
// these rules decide which data-driven shelves a place belongs on.

export type Shelf = "hottest" | "cheap_and_best" | "highest_rated" | "hidden_gems";

export const SHELF_MIN_PLACES = 8; // a shelf shows in an area only with this many places
export const HEAT_WINDOW_DAYS = 14;
export const RADIUS_KM = { eat_out: 5, order_in: 7 } as const;

// Each visit counts 1 today, halving every week.
export function heat(visitAgesDays: readonly number[]): number {
  return visitAgesDays.reduce((sum, age) => sum + 0.5 ** (age / 7), 0);
}

// 1 = up to ₹300 per person, 2 = up to ₹700, 3 = up to ₹1,500, 4 = above.
export function priceBand(medianPerPerson: number): 1 | 2 | 3 | 4 {
  if (medianPerPerson <= 300) return 1;
  if (medianPerPerson <= 700) return 2;
  if (medianPerPerson <= 1500) return 3;
  return 4;
}

export type ShelfInput = {
  cityScore: number;
  rankings: number;
  heat: number;
  visitors14d: number; // different qualifying accounts in the heat window
  priceBand: number | null;
};

export function shelvesFor(p: ShelfInput): Shelf[] {
  const shelves: Shelf[] = [];
  if (p.heat >= 3 && p.visitors14d >= 3 && p.cityScore >= 7.0) shelves.push("hottest");
  if (p.priceBand === 1 && p.cityScore >= 7.5) shelves.push("cheap_and_best");
  if (p.rankings >= 5) shelves.push("highest_rated");
  if (p.cityScore >= 8.0 && p.rankings >= 3 && p.rankings <= 9) shelves.push("hidden_gems");
  return shelves;
}
