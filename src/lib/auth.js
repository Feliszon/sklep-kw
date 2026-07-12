import crypto from "crypto";

const SESSION_COOKIE = "kw_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12h

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Brak ADMIN_SESSION_SECRET w zmiennych środowiskowych.");
  return secret;
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
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

  const expected = sign(expires);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export const ADMIN_SESSION_COOKIE = SESSION_COOKIE;
export const ADMIN_SESSION_MAX_AGE = MAX_AGE_SECONDS;
