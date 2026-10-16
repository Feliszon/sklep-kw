import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "kw_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12h

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET musi mieć co najmniej 32 znaki.");
  }
  return secret;
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createSessionToken() {
  const expires = String(Date.now() + MAX_AGE_SECONDS * 1000);
  return `${expires}.${sign(expires)}`;
}

export function isValidSessionToken(token) {
  if (!token) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig) return false;
  if (Date.now() > Number(expires)) return false;
  return safeEqual(sig, sign(expires));
}

export async function isAdmin() {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

// Server actions są publicznymi endpointami POST - każda akcja panelu
// MUSI wywołać tę funkcję, sam layout panelu niczego nie chroni.
export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Brak uprawnień - zaloguj się ponownie.");
  }
}

export const ADMIN_SESSION_COOKIE = SESSION_COOKIE;
export const ADMIN_SESSION_MAX_AGE = MAX_AGE_SECONDS;
