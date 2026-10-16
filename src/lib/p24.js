import "server-only";
import crypto from "crypto";
import { safeEqual } from "./auth.js";

/**
 * Klient REST API Przelewy24 (https://docs.przelewy24.pl/).
 * Przeniesiony z functions/src/p24Client.js - działa teraz w API routes Next.js.
 */

const SANDBOX_BASE_URL = "https://sandbox.przelewy24.pl";
const PRODUCTION_BASE_URL = "https://secure.przelewy24.pl";

export function getP24Config() {
  const isProduction = (process.env.P24_ENV || "sandbox").toLowerCase() === "production";
  return {
    isProduction,
    baseUrl: isProduction ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL,
    merchantId: Number(process.env.P24_MERCHANT_ID),
    posId: Number(process.env.P24_POS_ID || process.env.P24_MERCHANT_ID),
    apiKey: process.env.P24_API_KEY || "",
    crcKey: process.env.P24_CRC_KEY || "",
  };
}

export function isP24Configured() {
  const c = getP24Config();
  return Boolean(c.merchantId && c.apiKey && c.crcKey);
}

function assertConfigured(config) {
  if (!config.merchantId || !config.apiKey || !config.crcKey) {
    throw new Error("Brak konfiguracji P24 - ustaw P24_MERCHANT_ID, P24_API_KEY i P24_CRC_KEY.");
  }
}

function sha384(input) {
  return crypto.createHash("sha384").update(input, "utf8").digest("hex");
}

function authHeader(posId, apiKey) {
  return `Basic ${Buffer.from(`${posId}:${apiKey}`).toString("base64")}`;
}

/** Rejestruje transakcję i zwraca URL, na który przekierowujemy klienta. */
export async function registerTransaction(payload) {
  const config = getP24Config();
  assertConfigured(config);

  const sign = sha384(
    JSON.stringify({
      sessionId: payload.sessionId,
      merchantId: config.merchantId,
      amount: payload.amount,
      currency: payload.currency,
      crc: config.crcKey,
    })
  );

  const res = await fetch(`${config.baseUrl}/api/v1/transaction/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(config.posId, config.apiKey),
    },
    body: JSON.stringify({ merchantId: config.merchantId, posId: config.posId, ...payload, sign }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.data?.token) {
    throw new Error(`Rejestracja transakcji P24 nie powiodła się (HTTP ${res.status}): ${JSON.stringify(json)}`);
  }
  return `${config.baseUrl}/trnRequest/${json.data.token}`;
}

/** PUT /transaction/verify - wymagane potwierdzenie odebranej płatności. */
export async function verifyTransaction({ sessionId, orderId, amount, currency }) {
  const config = getP24Config();
  assertConfigured(config);

  const sign = sha384(JSON.stringify({ sessionId, orderId, amount, currency, crc: config.crcKey }));

  const res = await fetch(`${config.baseUrl}/api/v1/transaction/verify`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(config.posId, config.apiKey),
    },
    body: JSON.stringify({
      merchantId: config.merchantId,
      posId: config.posId,
      sessionId,
      amount,
      currency,
      orderId,
      sign,
    }),
  });

  const json = await res.json().catch(() => null);
  return res.ok && json?.data?.status === "success";
}

/** Weryfikuje podpis powiadomienia (webhook) od P24. */
export function isNotificationSignatureValid(n) {
  const config = getP24Config();
  assertConfigured(config);

  const expected = sha384(
    JSON.stringify({
      merchantId: n.merchantId,
      posId: n.posId,
      sessionId: n.sessionId,
      amount: n.amount,
      originAmount: n.originAmount,
      currency: n.currency,
      orderId: n.orderId,
      methodId: n.methodId,
      statement: n.statement,
      crc: config.crcKey,
    })
  );
  return typeof n.sign === "string" && safeEqual(expected, n.sign);
}

/** Lista dostępnych metod płatności. amount w groszach. */
export async function getPaymentMethods({ amount, currency = "PLN", lang = "pl" } = {}) {
  const config = getP24Config();
  assertConfigured(config);

  const params = new URLSearchParams({ currency });
  if (amount) params.set("amount", String(amount));

  const res = await fetch(`${config.baseUrl}/api/v1/payment/methods/${lang}?${params}`, {
    headers: { Authorization: authHeader(config.posId, config.apiKey) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Pobranie metod płatności P24 nie powiodło się (HTTP ${res.status}).`);
  }
  return (json?.data || [])
    .filter((m) => m.status !== false)
    .map((m) => ({ id: m.id, name: m.name, imgUrl: m.imgUrl || m.mobileImgUrl || null }));
}
