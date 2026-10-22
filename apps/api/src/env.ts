import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3000),
  PHONE_HASH_SECRET: z.string().min(32, "PHONE_HASH_SECRET must be at least 32 characters"),
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),
  DEV_AUTH: z.stringbool().default(false),
  NODE_ENV: z.string().default("development"),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const env = schema.parse(source);
  if (env.DEV_AUTH && env.NODE_ENV === "production") throw new Error("DEV_AUTH must be off in production");
  return env;
}
