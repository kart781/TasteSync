// Request bodies shared by the app and the API.
import { z } from "zod";

export const visitMode = z.enum(["dine_in", "takeaway", "delivery"]);
export const experience = z.enum(["dine_in", "delivery"]);
export const band = z.enum(["loved", "fine", "not_for_me"]);
export const audience = z.enum(["public", "friends", "circle", "private"]);
export const outcome = z.enum(["better", "worse", "tie", "skip"]);

export type VisitMode = z.infer<typeof visitMode>;
export type Experience = z.infer<typeof experience>;
export type Audience = z.infer<typeof audience>;

export function experienceOf(mode: VisitMode): Experience {
  return mode === "dine_in" ? "dine_in" : "delivery";
}

const comparisons = z
  .array(z.object({ otherPlaceId: z.uuid(), outcome }))
  .max(4);

export const createVisitBody = z
  .object({
    placeId: z.uuid(),
    visitedOn: z.iso.date().optional(),
    mode: visitMode.default("dine_in"),
    feeling: band,
    // "skip for now": the place joins the band unranked and can be ranked later.
    skipComparisons: z.boolean().default(false),
    comparisons: comparisons.default([]),
    // "still where it was?" on a repeat visit with the same feeling: keep the position.
    keepPosition: z.boolean().default(false),
    audience: audience.default("friends"),
    circleIds: z.array(z.uuid()).max(10).default([]),
    dishes: z
      .array(z.object({ dishId: z.uuid().optional(), name: z.string().trim().min(1).max(80).optional(), standout: z.boolean().default(false) }))
      .max(20)
      .default([]),
    companionIds: z.array(z.uuid()).max(25).default([]),
    note: z.string().max(1000).optional(),
    pricePerPerson: z.int().min(0).max(100000).optional(),
    wasHosted: z.boolean().default(false),
    logStartedAt: z.iso.datetime().optional(), // for the log_saved duration event
  })
  .refine((v) => v.audience !== "circle" || v.circleIds.length > 0, {
    message: "pick at least one circle",
    path: ["circleIds"],
  })
  .refine((v) => v.dishes.every((d) => d.dishId || d.name), {
    message: "a dish needs an id or a name",
    path: ["dishes"],
  });
export type CreateVisitBody = z.infer<typeof createVisitBody>;

export const updateVisitBody = z.object({
  visitedOn: z.iso.date().optional(),
  // A new feeling moves the place to that band unranked; the app then asks for comparisons.
  feeling: band.optional(),
  audience: audience.optional(),
  circleIds: z.array(z.uuid()).max(10).optional(),
  note: z.string().max(1000).nullable().optional(),
  pricePerPerson: z.int().min(0).max(100000).nullable().optional(),
  wasHosted: z.boolean().optional(),
});

export const rankBody = z.object({
  placeId: z.uuid(),
  experience,
  band,
  comparisons,
});

export const reorderBody = z.object({
  experience,
  band,
  placeIds: z.array(z.uuid()).min(1), // the whole band, best first
});

export const createPlaceBody = z.object({
  name: z.string().trim().min(2).max(120),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  areaId: z.uuid().optional(),
  address: z.string().max(300).optional(),
  landmark: z.string().max(200).optional(),
  cuisines: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  isDeliveryOnly: z.boolean().default(false),
});

export const discoverMode = z.enum(["eat_out", "order_in"]);
export type DiscoverMode = z.infer<typeof discoverMode>;

export const placeSearchQuery = z.object({
  q: z.string().trim().max(120).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  mode: discoverMode.default("eat_out"),
  // Limits places found by location alone; omitted means the mode's default, 0 means all of the city.
  radiusKm: z.coerce.number().min(0).max(50).optional(),
  areaId: z.uuid().optional(),
  cuisine: z.string().max(40).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const signUpBody = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_.]{3,24}$/, "3 to 24 letters, digits, dots or underscores"),
  displayName: z.string().trim().min(1).max(60),
  birthDate: z.iso.date(),
  homeAreaId: z.uuid().optional(), // fallback for the location bar
});

export function isAdult(birthDate: string, today = new Date()): boolean {
  const [y, m, d] = birthDate.split("-").map(Number) as [number, number, number];
  const eighteenth = new Date(Date.UTC(y + 18, m - 1, d));
  return eighteenth.getTime() <= Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
}
