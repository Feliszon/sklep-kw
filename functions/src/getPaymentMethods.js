const logger = require("firebase-functions/logger");
const { getPaymentMethods: fetchP24Methods } = require("./p24Client");
const { isValidAmount, toGrosze } = require("./validate");

/**
 * GET /getPaymentMethods?amount=<PLN> - zwraca listę metod płatności aktualnie
 * dostępnych w P24 dla danej kwoty (karta, BLIK, przelewy, raty, portfele itd.),
 * żeby frontend mógł je wszystkie wyświetlić do wyboru przed przekierowaniem.
 */
module.exports = async function getPaymentMethods(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Metoda niedozwolona, użyj GET." });
    return;
  }

  const amount = req.query.amount;
  if (!isValidAmount(amount)) {
    res.status(400).json({ error: "Nieprawidłowa kwota." });
    return;
  }

  try {
    const methods = await fetchP24Methods({ amount: toGrosze(amount), currency: "PLN", lang: "pl" });
    res.status(200).json({ methods });
  } catch (err) {
    logger.error("Nie udało się pobrać metod płatności z P24", { message: err.message });
    res.status(502).json({ error: "Nie udało się pobrać dostępnych metod płatności." });
  }
};
