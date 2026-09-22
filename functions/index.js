const { onRequest } = require("firebase-functions/v2/https");

const createPaymentHandler = require("./src/createPayment");
const paymentWebhookHandler = require("./src/paymentWebhook");
const paymentReturnHandler = require("./src/paymentReturn");
const getPaymentMethodsHandler = require("./src/getPaymentMethods");

const REGION = "europe-west1";

// Wywoływana z przeglądarki klienta - potrzebuje CORS.
exports.createPayment = onRequest({ region: REGION, cors: true }, createPaymentHandler);

// Wywoływana przez serwery P24 - bez CORS.
exports.paymentWebhook = onRequest({ region: REGION }, paymentWebhookHandler);

// Wywoływana ze strony powrotu w przeglądarce klienta - potrzebuje CORS.
exports.paymentReturn = onRequest({ region: REGION, cors: true }, paymentReturnHandler);

// Wywoływana z przeglądarki klienta (checkout) - potrzebuje CORS.
exports.getPaymentMethods = onRequest({ region: REGION, cors: true }, getPaymentMethodsHandler);
