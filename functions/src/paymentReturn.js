const logger = require("firebase-functions/logger");

/**
 * GET /paymentReturn?session=... - obsługuje powrót klienta z P24.
 *
 * P24 NIE przekazuje statusu płatności w adresie powrotnym - to tylko
 * przekierowanie UX, autorytatywne potwierdzenie przychodzi wyłącznie przez
 * paymentWebhook. Dlatego na tym etapie (bez Firestore) zwracamy "pending".
 */
module.exports = async function paymentReturn(req, res) {
  const session = req.query.session;

  if (!session || typeof session !== "string") {
    res.status(400).json({ error: "Brak identyfikatora sesji (session) w adresie powrotnym." });
    return;
  }

  logger.info("Powrót klienta z płatności P24", { session });

  // TODO: po dodaniu Firestore - odczytaj tu status zapisany przez
  // processWebhookResult dla tego sessionId i zwróć "success" / "failed"
  // zamiast stałego "pending".
  res.status(200).json({
    session,
    status: "pending",
    message:
      "Płatność została zainicjowana. Ostateczne potwierdzenie otrzymasz po przetworzeniu powiadomienia od P24.",
  });
};
