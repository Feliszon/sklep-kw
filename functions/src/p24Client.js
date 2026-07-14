/**
 * Klient REST API Przelewy24 (https://docs.przelewy24.pl/).
 *
 * UWAGA: pola i endpointy odpowiadają REST API P24 w wersji v1 według wiedzy
 * użytej do napisania tego kodu. Przed pierwszym prawdziwym wdrożeniem (nawet
 * sandboxowym) zweryfikuj nazwy pól i endpointów w aktualnej dokumentacji
 * docs.przelewy24.pl - P24 sporadycznie zmienia szczegóły API.
 */

const crypto = require("crypto");
const { getConfig } = require("./config");

function sha384(input) {
  return crypto.createHash("sha384").update(input, "utf8").digest("hex");
}

function authHeader(posId, apiKey) {
  return `Basic ${Buffer.from(`${posId}:${apiKey}`).toString("base64")}`;
}

function assertConfigured(config) {
  if (!config.merchantId || !config.apiKey || !config.crcKey) {
    throw new Error(
      "Brak konfiguracji P24 - ustaw P24_MERCHANT_ID, P24_API_KEY i P24_CRC_KEY w functions/.env"
    );
  }
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Rejestruje transakcję (POST /api/v1/transaction/register) i zwraca token
 * potrzebny do zbudowania adresu przekierowania na stronę płatności P24.
 */
async function registerTransaction(payload) {
  const config = getConfig();
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

  const body = {
    merchantId: config.merchantId,
    posId: config.posId,
    ...payload,
    sign,
  };

  const res = await fetch(`${config.baseUrl}/api/v1/transaction/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(config.posId, config.apiKey),
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.data?.token) {
    throw new Error(`Rejestracja transakcji P24 nie powiodła się (HTTP ${res.status}): ${JSON.stringify(json)}`);
  }

  return json.data.token;
}

function buildPaymentUrl(token) {
  const config = getConfig();
  return `${config.baseUrl}/trnRequest/${token}`;
}

/**
 * Wywołuje PUT /api/v1/transaction/verify - wymagane przez P24 potwierdzenie
 * odebranej transakcji. orderId pochodzi z powiadomienia webhooka.
 */
async function verifyTransaction({ sessionId, orderId, amount, currency }) {
  const config = getConfig();
  assertConfigured(config);

  const sign = sha384(
    JSON.stringify({ sessionId, orderId, amount, currency, crc: config.crcKey })
  );

  const body = {
    merchantId: config.merchantId,
    posId: config.posId,
    sessionId,
    amount,
    currency,
    orderId,
    sign,
  };

  const res = await fetch(`${config.baseUrl}/api/v1/transaction/verify`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(config.posId, config.apiKey),
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  return { verified: res.ok && json?.data?.status === "success", raw: json };
}

/**
 * Weryfikuje podpis powiadomienia (webhook) od P24 zgodnie ze wzorem:
 * sha384({merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement, crc}).
 */
function isNotificationSignatureValid(notification) {
  const config = getConfig();
  assertConfigured(config);

  const expected = sha384(
    JSON.stringify({
      merchantId: notification.merchantId,
      posId: notification.posId,
      sessionId: notification.sessionId,
      amount: notification.amount,
      originAmount: notification.originAmount,
      currency: notification.currency,
      orderId: notification.orderId,
      methodId: notification.methodId,
      statement: notification.statement,
      crc: config.crcKey,
    })
  );

  return typeof notification.sign === "string" && safeEqual(expected, notification.sign);
}

/**
 * Pobiera listę dostępnych metod płatności (GET /api/v1/payment/methods/{lang}).
 * amount w groszach.
 */
async function getPaymentMethods({ amount, currency = "PLN", lang = "pl" } = {}) {
  const config = getConfig();
  assertConfigured(config);

  const params = new URLSearchParams({ currency });
  if (amount) params.set("amount", String(amount));

  const res = await fetch(`${config.baseUrl}/api/v1/payment/methods/${lang}?${params.toString()}`, {
    headers: { Authorization: authHeader(config.posId, config.apiKey) },
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Pobranie metod płatności P24 nie powiodło się (HTTP ${res.status}): ${JSON.stringify(json)}`);
  }

  return json.data;
}

module.exports = {
  registerTransaction,
  buildPaymentUrl,
  verifyTransaction,
  isNotificationSignatureValid,
  getPaymentMethods,
};
