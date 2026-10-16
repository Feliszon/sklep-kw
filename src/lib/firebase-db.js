import "server-only";
import { getDb } from "./firebase-admin.js";

// Dostęp do Realtime Database przez Admin SDK. Reguły bazy blokują cały
// dostęp publiczny (patrz database.rules.json) - zapisywać i czytać może
// wyłącznie serwer.

async function dbGet(path) {
  const snapshot = await getDb().ref(path).get();
  return snapshot.exists() ? snapshot.val() : null;
}

async function dbSet(path, data) {
  await getDb().ref(path).set(data);
  return data;
}

export { dbGet, dbSet, getDb };
