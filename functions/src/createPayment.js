const crypto = require("crypto");
const logger = require("firebase-functions/logger");
const { getConfig } = require("./config");
const { registerTransaction, buildPaymentUrl } = require("./p24Client");
const { isValidEmail, isValidAmount, toGrosze } = require("./validate");

/**
 * POST /createPayment
 * Body: { amount (PLN), description, email, name, phone?, method? }
 * Nic nie zapisuje - tylko rejestruje transakcję w P24 i zwraca URL płatności.
 */
module.exports = async function createPayment(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metoda niedozwolona, użyj POST." });
    return;
  }

  const { amount, description, email, name, phone, method } = req.body || {};

  if (!isValidAmount(amount)) {
    res.status(400).json({ error: "Nieprawidłowa kwota zamówienia." });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ error: "Nieprawidłowy adres e-mail." });
    return;
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    res.status(400).json({ error: "Opis zamówienia jest wymagany." });
    return;
  }
  if (method !== undefined && !Number.isInteger(method)) {
    res.status(400).json({ error: "Nieprawidłowy identyfikator metody płatności." });
    return;
  }

  const config = getConfig();
  if (!config.merchantId || !config.apiKey || !config.crcKey) {
    logger.error("Brak konfiguracji P24 - ustaw P24_MERCHANT_ID/P24_API_KEY/P24_CRC_KEY w functions/.env");
    res.status(500).json({ error: "Płatności są chwilowo niedostępne (brak konfiguracji)." });
    return;
  }
  if (!config.webhookUrl) {
    logger.warn("P24_WEBHOOK_URL nie jest ustawiony - P24 nie będzie mógł dostarczyć powiadomienia o płatności.");
  }

  const sessionId = crypto.randomUUID();
  const amountGrosze = toGrosze(amount);

  try {
    const token = await registerTransaction({
      sessionId,
      amount: amountGrosze,
      currency: "PLN",
      description: description.trim().slice(0, 1024),
      email: email.trim(),
      client: (name || "").trim().slice(0, 255) || undefined,
      phone: (phone || "").trim().slice(0, 20) || undefined,
      country: "PL",
      language: "pl",
      method,
      urlReturn: `${config.frontendUrl}/platnosc/status?session=${sessionId}`,
      urlStatus: config.webhookUrl,
      timeLimit: 15,
      regulationAccept: true,
      encoding: "UTF-8",
    });

    res.status(200).json({ url: buildPaymentUrl(token), sessionId });
  } catch (err) {
    logger.error("Błąd rejestracji transakcji P24", { message: err.message });
    res.status(502).json({ error: "Nie udało się utworzyć płatności. Spróbuj ponownie później." });
  }
};
