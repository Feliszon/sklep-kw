"use server";

import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, safeEqual, ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from "@/lib/auth";
import { getDb } from "@/lib/firebase-db";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

// Skróty o stałej długości - porównanie nie zdradza długości hasła.
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

async function attemptsRef() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const key = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
  return getDb().ref(`security/loginAttempts/${key}`);
}

export async function login(prevState, formData) {
  const password = formData.get("password");
  const ref = await attemptsRef();

  const record = (await ref.get()).val();
  const now = Date.now();
  if (record && now - record.firstAt < WINDOW_MS && record.count >= MAX_ATTEMPTS) {
    const minutes = Math.ceil((record.firstAt + WINDOW_MS - now) / 60000);
    return { error: `Za dużo nieudanych prób. Spróbuj ponownie za ${minutes} min.` };
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== "string" || !safeEqual(sha256(password), sha256(expected))) {
    await ref.transaction((cur) =>
      !cur || now - cur.firstAt >= WINDOW_MS ? { count: 1, firstAt: now } : { ...cur, count: cur.count + 1 }
    );
    return { error: "Nieprawidłowe hasło." };
  }

  await ref.remove();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  redirect("/admin");
}
