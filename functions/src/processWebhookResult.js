const logger = require("firebase-functions/logger");

/**
 * Punkt rozszerzenia: cała logika "co zrobić z wynikiem webhooka" żyje tutaj,
 * żeby dodanie zapisu do Firestore w kolejnym etapie wymagało zmiany tylko
 * w tym jednym miejscu.
 */
async function processWebhookResult({ notification, verified }) {
  const status = verified ? "success" : "failed";

  logger.info("P24 payment result", {
    status,
    orderId: notification.orderId,
    sessionId: notification.sessionId,
    amount: notification.amount,
    currency: notification.currency,
    methodId: notification.methodId,
  });

  // TODO: zapis do Firestore (kolejny etap), np.:
  // const { getFirestore, FieldValue } = require("firebase-admin/firestore");
  // await getFirestore().collection("orders").doc(notification.sessionId).set(
  //   {
  //     status,
  //     orderId: notification.orderId,
  //     amount: notification.amount,
  //     currency: notification.currency,
  //     methodId: notification.methodId,
  //     updatedAt: FieldValue.serverTimestamp(),
  //   },
  //   { merge: true }
  // );

  return { status };
}

module.exports = { processWebhookResult };
