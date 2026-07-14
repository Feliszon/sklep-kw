const logger = require("firebase-functions/logger");
const { isNotificationSignatureValid, verifyTransaction } = require("./p24Client");
const { processWebhookResult } = require("./processWebhookResult");

const REQUIRED_FIELDS = ["merchantId", "posId", "sessionId", "amount", "currency", "orderId", "sign"];

/**
 * POST /paymentWebhook - odbiera powiadomienia (notification) od P24.
 * Na tym etapie TYLKO loguje wynik (patrz processWebhookResult.js).
 * Nigdy nie loguje ani nie przechowuje danych karty/BLIK - P24 ich tu nie wysyła,
 * powiadomienie zawiera wyłącznie identyfikatory transakcji i kwotę.
 */
module.exports = async function paymentWebhook(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  const notification = req.body || {};
  const missing = REQUIRED_FIELDS.filter((field) => notification[field] === undefined);
  if (missing.length > 0) {
    logger.warn("P24 webhook: brak wymaganych pól w powiadomieniu", { missing });
    res.status(400).send("Bad request");
    return;
  }

  let signatureValid = false;
  try {
    signatureValid = isNotificationSignatureValid(notification);
  } catch (err) {
    logger.error("P24 webhook: błąd podczas weryfikacji podpisu", { message: err.message });
  }

  if (!signatureValid) {
    // Podpis się nie zgadza - nie traktujemy tego powiadomienia jako zaufanego
    // i celowo NIE logujemy go jako wyniku płatności.
    logger.warn("P24 webhook: nieprawidłowy podpis (sign) - powiadomienie odrzucone", {
      sessionId: notification.sessionId,
      orderId: notification.orderId,
    });
    res.status(400).send("Invalid signature");
    return;
  }

  let verified = false;
  try {
    const result = await verifyTransaction({
      sessionId: notification.sessionId,
      orderId: notification.orderId,
      amount: notification.amount,
      currency: notification.currency,
    });
    verified = result.verified;
  } catch (err) {
    logger.error("P24 webhook: błąd wywołania Transaction/verify", { message: err.message });
  }

  await processWebhookResult({ notification, verified });

  // P24 oczekuje szybkiej odpowiedzi 200 - w przeciwnym razie ponawia powiadomienie.
  res.status(200).send("OK");
};
