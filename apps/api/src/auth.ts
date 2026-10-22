import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Auth } from "firebase-admin/auth";
import type { Env } from "./env";

export type Identity = { uid: string; phone: string };
export type VerifyToken = (token: string) => Promise<Identity>;

export class AuthError extends Error {}

export function makeVerifier(env: Env): VerifyToken {
  // Loaded on first use, so development and tests never load the Firebase SDK.
  let auth: Promise<Auth> | undefined;
  const loadAuth = async () => {
    const { cert, initializeApp } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");
    const credential = env.FIREBASE_SERVICE_ACCOUNT
      ? cert(JSON.parse(readFileSync(env.FIREBASE_SERVICE_ACCOUNT, "utf8")))
      : undefined;
    return getAuth(initializeApp(credential ? { credential } : undefined));
  };
  const firebase = async (token: string): Promise<Identity> => {
    auth ??= loadAuth();
    const firebaseAuth = await auth; // a setup error surfaces as a 500, not as a bad token
    try {
      const decoded = await firebaseAuth.verifyIdToken(token);
      if (!decoded.phone_number) throw new AuthError("token has no phone number");
      return { uid: decoded.uid, phone: decoded.phone_number };
    } catch (e) {
      throw e instanceof AuthError ? e : new AuthError("invalid token");
    }
  };
  if (!env.DEV_AUTH) return firebase;
  // Development and tests: "dev:<uid>:<phone>".
  return async (token) => {
    const [kind, uid, phone] = token.split(":");
    if (kind === "dev" && uid && phone) return { uid, phone };
    return firebase(token);
  };
}

export function phoneHash(secret: string, phone: string): string {
  return createHmac("sha256", secret).update(phone).digest("hex");
}
