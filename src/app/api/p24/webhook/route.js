import { isNotificationSignatureValid, verifyTransaction, getP24Config } from "@/lib/p24";
import { getOrder, markOrderPaid, markOrderPaymentError } from "@/lib/orders";
import { sendOrderConfirmedEmails } from "@/lib/mailer";

const REQUIRED_FIELDS = ["merchantId", "posId", "sessionId", "amount", "currency", "orderId", "sign"];

async function readNotification(request) {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) return request.json();
  const form = await request.formData();
  const data = Object.fromEntries(form.entries());
  for (const key of ["merchantId", "posId", "amount", "originAmount", "orderId", "methodId"]) {
    if (data[key] !== undefined) data[key] = Number(data[key]);
  }
  return data;
}

/**
 * Powiadomienie od P24 o płatności (urlStatus). Jedyne autorytatywne źródło
 * informacji o tym, że zamówienie zostało opłacone.
 */
export async function POST(request) {
  const n = await readNotification(request).catch(() => null);
  if (!n || REQUIRED_FIELDS.some((f) => n[f] === undefined)) {
    return new Response("Bad request", { status: 400 });
  }

  if (!isNotificationSignatureValid(n)) {
    console.warn("P24 webhook: nieprawidłowy podpis", { sessionId: n.sessionId });
    return new Response("Invalid signature", { status: 400 });
  }

  const order = await getOrder(n.sessionId);
  if (!order) {
    console.error("P24 webhook: nieznane zamówienie", { sessionId: n.sessionId, orderId: n.orderId });
    return new Response("OK");
  }
  if (["paid", "shipped", "completed"].includes(order.status)) {
    return new Response("OK"); // powtórzone powiadomienie - już obsłużone
  }

  const config = getP24Config();
  const expectedAmount = Math.round(order.total * 100);
  if (Number(n.amount) !== expectedAmount || n.currency !== "PLN" || Number(n.merchantId) !== config.merchantId) {
    console.error("P24 webhook: kwota/waluta nie zgadza się z zamówieniem", {
      order: order.number,
      expectedAmount,
      amount: n.amount,
    });
    await markOrderPaymentError(order.id, `Niezgodna kwota: ${n.amount} gr zamiast ${expectedAmount} gr`);
    return new Response("OK");
  }

  const verified = await verifyTransaction({
    sessionId: n.sessionId,
    orderId: n.orderId,
    amount: n.amount,
    currency: n.currency,
  }).catch((err) => {
    console.error("P24 webhook: błąd verify", err.message);
    return false;
  });

  if (!verified) {
    // Zwracamy błąd, żeby P24 ponowił powiadomienie później.
    return new Response("Verification failed", { status: 500 });
  }

  const paidOrder = await markOrderPaid(order.id, { orderId: n.orderId, methodId: n.methodId });
  if (paidOrder) await sendOrderConfirmedEmails(paidOrder);

  return new Response("OK");
}
