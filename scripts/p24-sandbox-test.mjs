/**
 * Samodzielny test konta SANDBOX Przelewy24 (bez Firebase / Next.js).
 *
 * Uruchomienie (z głównego katalogu projektu):
 *   node --env-file=.env.local scripts/p24-sandbox-test.mjs
 *
 * Kroki:
 *   a) walidacja zmiennych środowiskowych,
 *   b) GET  /api/v1/testAccess            (Basic Auth: posId : klucz do raportów),
 *   c) POST /api/v1/transaction/register  (transakcja testowa 1,00 PLN),
 *   d) wypisanie linku {base}/trnRequest/{token} do opłacenia w przeglądarce.
 *
 * Źródło wzorów: oficjalna specyfikacja OpenAPI P24
 *   https://developers.przelewy24.pl/yaml/pl_documentation_1.0.yaml
 *   (wyświetlana na https://developers.przelewy24.pl/index.php?pl)
 *
 * Skrypt NIGDY nie wypisuje wartości kluczy ani nagłówka Authorization.
 */

import crypto from "node:crypto";

const SANDBOX_BASE_URL = "https://sandbox.przelewy24.pl";

// ---------------------------------------------------------------------------
// Pomocnicze
// ---------------------------------------------------------------------------

const SECRET_NAMES = ["P24_API_KEY", "P24_CRC_KEY"];

/** Usuwa z tekstu ewentualne wystąpienia sekretów (na wszelki wypadek). */
function redact(text) {
  let out = String(text);
  for (const name of SECRET_NAMES) {
    const value = process.env[name];
    if (value && value.length >= 4) out = out.split(value).join(`<${name}>`);
  }
  return out;
}

function mask(value) {
  if (!value) return "brak";
  return value.length > 4 ? `ustawione (…${value.slice(-4)})` : "ustawione";
}

function fail(message) {
  console.error(`\n❌ ${redact(message)}`);
  process.exit(1);
}

function sha384(input) {
  return crypto.createHash("sha384").update(input, "utf8").digest("hex");
}

async function readBody(res) {
  const text = await res.text().catch(() => "");
  try {
    return { text, json: JSON.parse(text) };
  } catch {
    return { text, json: null };
  }
}

/** fetch z czytelną obsługą błędu sieci (zły P24_BASE_URL, brak internetu). */
async function p24Fetch(url, options) {
  try {
    return await fetch(url, options);
  } catch (err) {
    fail(
      `Błąd sieci przy połączeniu z ${url}\n` +
        `   Szczegóły: ${err.cause?.code || err.message}\n` +
        `   Sprawdź P24_BASE_URL / P24_ENV (sandbox = ${SANDBOX_BASE_URL}) i połączenie z internetem.`
    );
  }
}

function explainHttpError(step, res, body) {
  if (res.status === 401) {
    return (
      `${step}: HTTP 401 Unauthorized - zły posId lub klucz API.\n` +
      "   Sprawdź:\n" +
      "   • czy dane pochodzą z panelu SANDBOX (sandbox.przelewy24.pl), a nie produkcyjnego,\n" +
      "   • czy P24_API_KEY to „klucz do raportów” (Moje dane), a nie klucz CRC,\n" +
      "   • czy P24_POS_ID / P24_MERCHANT_ID to ID konta sandbox."
    );
  }
  if (res.status === 404) {
    return (
      `${step}: HTTP 404 - endpoint nie istnieje pod tym adresem.\n` +
      `   Najpewniej zły P24_BASE_URL (oczekiwany: ${SANDBOX_BASE_URL}).`
    );
  }
  return `${step}: HTTP ${res.status}\n   Odpowiedź P24: ${body.text || "(pusta)"}`;
}

// ---------------------------------------------------------------------------
// a) Walidacja zmiennych
// ---------------------------------------------------------------------------

console.log("=== a) Walidacja zmiennych środowiskowych ===");

const env = process.env;
const p24Env = (env.P24_ENV || "sandbox").toLowerCase();
const baseUrl = (env.P24_BASE_URL || SANDBOX_BASE_URL).replace(/\/+$/, "");

if (p24Env !== "sandbox") {
  fail(`P24_ENV="${p24Env}" - ten skrypt działa wyłącznie na sandboxie. Ustaw P24_ENV=sandbox.`);
}
if (!/^https:\/\/sandbox\.przelewy24\.pl$/i.test(baseUrl)) {
  fail(`P24_BASE_URL="${baseUrl}" nie wskazuje na sandbox. Dozwolony jest tylko ${SANDBOX_BASE_URL}.`);
}

const missing = ["P24_MERCHANT_ID", "P24_API_KEY", "P24_CRC_KEY"].filter((n) => !env[n]?.trim());
if (missing.length) {
  fail(`Brak wymaganych zmiennych w .env.local: ${missing.join(", ")}`);
}

const merchantId = Number(env.P24_MERCHANT_ID.trim());
const posIdSource = env.P24_POS_ID?.trim() ? "P24_POS_ID" : "P24_MERCHANT_ID (brak P24_POS_ID)";
const posId = Number((env.P24_POS_ID?.trim() || env.P24_MERCHANT_ID).trim());
const apiKey = env.P24_API_KEY.trim();
const crcKey = env.P24_CRC_KEY.trim();

if (!Number.isInteger(merchantId) || merchantId <= 0) fail("P24_MERCHANT_ID musi być dodatnią liczbą całkowitą.");
if (!Number.isInteger(posId) || posId <= 0) fail("P24_POS_ID musi być dodatnią liczbą całkowitą.");

console.log(`  P24_ENV          : ${p24Env}`);
console.log(`  base URL        : ${baseUrl}`);
console.log(`  P24_MERCHANT_ID : ${mask(env.P24_MERCHANT_ID.trim())}`);
console.log(`  posId           : ${mask(String(posId))} — źródło: ${posIdSource}`);
console.log(`  P24_API_KEY     : ${mask(apiKey)}`);
console.log(`  P24_CRC_KEY     : ${mask(crcKey)}`);

const authorization = `Basic ${Buffer.from(`${posId}:${apiKey}`).toString("base64")}`;

// ---------------------------------------------------------------------------
// b) testAccess
// ---------------------------------------------------------------------------

console.log("\n=== b) GET /api/v1/testAccess ===");

const testRes = await p24Fetch(`${baseUrl}/api/v1/testAccess`, {
  method: "GET",
  headers: { Authorization: authorization },
});
const testBody = await readBody(testRes);

console.log(`  Status HTTP: ${testRes.status}`);
if (!testRes.ok || testBody.json?.data !== true) {
  fail(explainHttpError("testAccess", testRes, testBody));
}
console.log("  ✅ Sukces - dane dostępowe (posId + klucz do raportów) są poprawne.");

// ---------------------------------------------------------------------------
// c) transaction/register
// ---------------------------------------------------------------------------

console.log("\n=== c) POST /api/v1/transaction/register ===");

const sessionId = `test-${Date.now()}`;
const amount = 100; // grosze = 1,00 PLN
const currency = "PLN";

// Wzór ze specyfikacji P24 (TransactionRequestBody1.sign):
//   SHA-384( {"sessionId":str,"merchantId":int,"amount":int,"currency":str,"crc":str} )
// JSON w dokładnie tej kolejności, bez escapowania "/" i znaków Unicode
// (odpowiednik PHP JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES).
// JSON.stringify domyślnie nie escapuje ani "/", ani znaków spoza ASCII.
const sign = sha384(JSON.stringify({ sessionId, merchantId, amount, currency, crc: crcKey }));

const registerPayload = {
  merchantId,
  posId,
  sessionId,
  amount,
  currency,
  description: "Test sandbox",
  email: "test@example.com",
  country: "PL",
  language: "pl",
  urlReturn: "http://localhost:3000/platnosc/status",
  sign,
};

console.log(`  sessionId: ${sessionId}, amount: ${amount} gr, currency: ${currency}`);

const regRes = await p24Fetch(`${baseUrl}/api/v1/transaction/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: authorization },
  body: JSON.stringify(registerPayload),
});
const regBody = await readBody(regRes);

console.log(`  Status HTTP: ${regRes.status}`);
const token = regBody.json?.data?.token;
if (!regRes.ok || !token) {
  let msg = explainHttpError("transaction/register", regRes, regBody);
  if (regRes.status === 400 && /sign/i.test(regBody.text)) {
    msg += "\n   Podpowiedź: P24 odrzuca sign - sprawdź, czy P24_CRC_KEY jest z panelu sandbox.";
  }
  fail(msg);
}
console.log("  ✅ Transakcja zarejestrowana.");

// ---------------------------------------------------------------------------
// d) Link do płatności
// ---------------------------------------------------------------------------

console.log("\n=== d) Link do płatności ===");
console.log(`  ${baseUrl}/trnRequest/${token}`);
console.log("\nOtwórz link w przeglądarce i opłać testowo (sandbox).");
