import "server-only";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

// Konto serwisowe (Firebase Console → Ustawienia projektu → Konta usługi → "Wygeneruj nowy klucz prywatny").
// Na Vercelu wklej całą zawartość pliku JSON do zmiennej FIREBASE_SERVICE_ACCOUNT
// (może być surowy JSON albo zakodowany w base64).
function readServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error("Brak FIREBASE_SERVICE_ACCOUNT w zmiennych środowiskowych.");
  }
  const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  return JSON.parse(json);
}

function getAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  if (!databaseURL) {
    throw new Error("Brak FIREBASE_DATABASE_URL w zmiennych środowiskowych.");
  }

  return initializeApp({ credential: cert(readServiceAccount()), databaseURL });
}

export function getDb() {
  return getDatabase(getAdminApp());
}
