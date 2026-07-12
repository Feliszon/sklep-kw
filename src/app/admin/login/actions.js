"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from "@/lib/auth";

export async function login(prevState, formData) {
  const password = formData.get("password");

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { error: "Nieprawidłowe hasło." };
  }

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
