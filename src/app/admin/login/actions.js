"use server";

import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from "@/lib/auth";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min

// Nieudane próby per adres IP. Pamięć jest lokalna dla instancji serwera -
// na serverless (Vercel) każda instancja liczy osobno, ale i tak mocno
// spowalnia zgadywanie hasła.
const failedAttempts = new Map();

async function getClientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

function isBlocked(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, firstAt: Date.now() });
  } else {
    entry.count += 1;
  }
}

function passwordMatches(input) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof input !== "string") return false;
  // Porównanie skrótów o stałej długości - bez wycieku informacji przez czas odpowiedzi.
  const a = crypto.createHash("sha256").update(input).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function login(prevState, formData) {
  const ip = await getClientIp();

  if (isBlocked(ip)) {
    return { error: "Zbyt wiele nieudanych prób. Spróbuj ponownie za 15 minut." };
  }

  if (!passwordMatches(formData.get("password"))) {
    recordFailure(ip);
    return { error: "Nieprawidłowe hasło." };
  }

  failedAttempts.delete(ip);

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
