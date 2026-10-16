import "server-only";
import crypto from "crypto";
import { getDb } from "./firebase-db.js";
import { mutateStore } from "./shop-store.js";
import { getShippingMethod } from "./shipping.js";
import { ADMIN_TRANSITIONS } from "./order-status.js";

const ORDERS_PATH = "orders";
// P24 daje klientowi 15 minut (timeLimit), po 30 minutach zwalniamy rezerwację.
const PAYMENT_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_QTY_PER_LINE = 50;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL_RE = /^\d{2}-\d{3}$/;
const LOCKER_RE = /^[A-Z0-9-]{4,15}$/;

export class OrderError extends Error {
  constructor(message, details) {
    super(message);
    this.details = details;
  }
}

const toGrosze = (pln) => Math.round(Number(pln) * 100);
const clean = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function orderRef(id) {
  return getDb().ref(`${ORDERS_PATH}/${id}`);
}

function makeOrderNumber(now) {
  const d = new Date(now);
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `KW-${ymd}-${suffix}`;
}

function validateInput(input) {
  const customer = {
    name: clean(input?.customer?.name, 120),
    email: clean(input?.customer?.email, 200),
    phone: clean(input?.customer?.phone, 20),
  };
  if (!customer.name) throw new OrderError("Podaj imię i nazwisko.");
  if (!EMAIL_RE.test(customer.email)) throw new OrderError("Podaj poprawny adres e-mail.");

  const shipping = getShippingMethod(input?.shippingMethodId);
  if (!shipping) throw new OrderError("Wybierz sposób dostawy.");

  const paymentMethod = input?.paymentMethod === "cash" ? "cash" : "p24";
  if (paymentMethod === "cash" && !shipping.allowsCash) {
    throw new OrderError("Płatność gotówką jest dostępna tylko przy odbiorze osobistym.");
  }

  let delivery = null;
  if (shipping.requires !== "none" && !/^\+?[\d\s-]{9,15}$/.test(customer.phone)) {
    throw new OrderError("Podaj numer telefonu - jest potrzebny do dostawy.");
  }
  if (shipping.requires === "locker") {
    const lockerCode = clean(input?.lockerCode, 15).toUpperCase();
    if (!LOCKER_RE.test(lockerCode)) throw new OrderError("Podaj poprawny kod paczkomatu (np. POZ08M).");
    delivery = { lockerCode };
  }
  if (shipping.requires === "address") {
    const address = {
      street: clean(input?.address?.street, 150),
      postalCode: clean(input?.address?.postalCode, 6),
      city: clean(input?.address?.city, 80),
    };
    if (!address.street || !address.city) throw new OrderError("Podaj pełny adres dostawy.");
    if (!POSTAL_RE.test(address.postalCode)) throw new OrderError("Podaj kod pocztowy w formacie 00-000.");
    delivery = address;
  }

  if (input?.acceptTerms !== true) {
    throw new OrderError("Musisz zaakceptować regulamin sklepu.");
  }

  const rawItems = Array.isArray(input?.items) ? input.items : [];
  const merged = new Map();
  for (const item of rawItems) {
    const qty = Number(item?.qty);
    if (typeof item?.productId !== "string" || typeof item?.variantId !== "string") continue;
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      throw new OrderError("Nieprawidłowa ilość produktu w koszyku.");
    }
    const key = `${item.productId}::${item.variantId}`;
    merged.set(key, { productId: item.productId, variantId: item.variantId, qty: (merged.get(key)?.qty || 0) + qty });
  }
  if (merged.size === 0) throw new OrderError("Koszyk jest pusty.");

  return {
    customer,
    shipping,
    paymentMethod,
    delivery,
    items: [...merged.values()],
    notes: clean(input?.notes, 500),
  };
}

function variantLabel(variant) {
  return [variant.color, variant.size].filter(Boolean).join(" / ");
}

/** Zdejmuje towar z magazynu i zwraca linie zamówienia z cenami z bazy (nie z przeglądarki). */
async function reserveStock(items) {
  return mutateStore((store) => {
    const lines = [];
    for (const item of items) {
      const product = store.products.find((p) => p.id === item.productId);
      const variant = product?.variants.find((v) => v.id === item.variantId);
      if (!product || !variant) {
        throw new OrderError("Któryś z produktów w koszyku nie jest już dostępny. Usuń go i spróbuj ponownie.");
      }
      const label = [product.name, variantLabel(variant)].filter(Boolean).join(" - ");
      if (variant.stock < item.qty) {
        throw new OrderError(
          variant.stock > 0
            ? `Produkt „${label}” jest dostępny tylko w ${variant.stock} szt.`
            : `Produkt „${label}” został wyprzedany.`
        );
      }
      variant.stock -= item.qty;
      lines.push({
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        variantLabel: variantLabel(variant),
        unitPrice: variant.price,
        qty: item.qty,
      });
    }
    return lines;
  });
}

async function changeStock(lines, direction) {
  await mutateStore((store) => {
    for (const line of lines) {
      const product = store.products.find((p) => p.id === line.productId);
      const variant = product?.variants.find((v) => v.id === line.variantId);
      if (variant) variant.stock = Math.max(0, variant.stock + direction * line.qty);
    }
  });
}

export async function createOrder(input) {
  const data = validateInput(input);
  await expireStaleOrders().catch((err) => console.error("Wygaszanie zamówień nie powiodło się:", err));

  const lines = await reserveStock(data.items);
  const itemsTotalGr = lines.reduce((sum, l) => sum + toGrosze(l.unitPrice) * l.qty, 0);
  const shippingGr = toGrosze(data.shipping.price);
  const totalGr = itemsTotalGr + shippingGr;

  if (input?.expectedTotal !== undefined && toGrosze(input.expectedTotal) !== totalGr) {
    await changeStock(lines, +1);
    throw new OrderError("Ceny produktów zmieniły się - zaktualizowaliśmy koszyk. Sprawdź kwotę i złóż zamówienie ponownie.", {
      prices: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, price: l.unitPrice })),
    });
  }

  const now = Date.now();
  const order = {
    id: crypto.randomUUID(),
    number: makeOrderNumber(now),
    createdAt: now,
    updatedAt: now,
    status: data.paymentMethod === "cash" ? "cash_pending" : "awaiting_payment",
    paymentMethod: data.paymentMethod,
    customer: data.customer,
    shipping: { id: data.shipping.id, label: data.shipping.label, price: data.shipping.price },
    delivery: data.delivery,
    lines,
    itemsTotal: itemsTotalGr / 100,
    total: totalGr / 100,
    notes: data.notes,
    termsAcceptedAt: now,
    stockReserved: true,
  };

  try {
    await orderRef(order.id).set(order);
  } catch (err) {
    await changeStock(lines, +1);
    throw err;
  }
  return order;
}

export async function getOrder(id) {
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id)) return null;
  const snapshot = await orderRef(id).get();
  return snapshot.exists() ? snapshot.val() : null;
}

export async function listOrders(limit = 300) {
  const snapshot = await getDb().ref(ORDERS_PATH).orderByChild("createdAt").limitToLast(limit).get();
  const orders = [];
  snapshot.forEach((child) => {
    orders.push(child.val());
  });
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

export async function patchOrder(id, patch) {
  await orderRef(id).update({ ...patch, updatedAt: Date.now() });
}

/**
 * Atomowo zmienia status zamówienia, jeśli obecny status jest na liście `from`.
 * Zwraca { order, previous } albo null, gdy przejście jest niedozwolone.
 */
async function transitionOrder(id, from, to, extra = {}) {
  let previous = null;
  const { committed, snapshot } = await orderRef(id).transaction((current) => {
    previous = null;
    if (current === null) return null;
    if (!from.includes(current.status)) return;
    previous = current.status;
    return { ...current, ...extra, status: to, updatedAt: Date.now() };
  });
  if (!committed || !previous) return null;
  return { order: snapshot.val(), previous };
}

/** Zamówienia nieopłacone po czasie - anulujemy i zwracamy towar na stan. */
export async function expireStaleOrders() {
  const snapshot = await getDb().ref(ORDERS_PATH).orderByChild("status").equalTo("awaiting_payment").get();
  const cutoff = Date.now() - PAYMENT_TIMEOUT_MS;
  const stale = [];
  snapshot.forEach((child) => {
    const order = child.val();
    if (order.createdAt < cutoff) stale.push(order.id);
  });
  for (const id of stale) {
    const result = await transitionOrder(id, ["awaiting_payment"], "cancelled", {
      stockReserved: false,
      cancelReason: "Brak płatności w wyznaczonym czasie",
    });
    if (result) await changeStock(result.order.lines, +1);
  }
}

/** Wywoływane z webhooka P24 po poprawnej weryfikacji. */
export async function markOrderPaid(id, p24) {
  const result = await transitionOrder(id, ["awaiting_payment", "cancelled", "payment_error"], "paid", {
    p24OrderId: p24.orderId,
    p24MethodId: p24.methodId ?? null,
    paidAt: Date.now(),
    stockReserved: true,
  });
  if (!result) return null;
  if (result.previous === "cancelled") {
    // Płatność doszła po wygaśnięciu rezerwacji - zdejmujemy towar ponownie.
    await changeStock(result.order.lines, -1);
    await patchOrder(id, { adminNote: "Płatność dotarła po wygaśnięciu rezerwacji - sprawdź stan magazynu." });
  }
  return result.order;
}

export async function markOrderPaymentError(id, reason) {
  return transitionOrder(id, ["awaiting_payment"], "payment_error", { paymentErrorReason: reason });
}

/** Zmiana statusu z panelu admina. Anulowanie zwraca towar na stan. */
export async function adminSetOrderStatus(id, status, { trackingNumber } = {}) {
  const allowedFrom = Object.entries(ADMIN_TRANSITIONS)
    .filter(([, targets]) => targets.includes(status))
    .map(([from]) => from);
  if (allowedFrom.length === 0) throw new Error("Niedozwolona zmiana statusu.");

  const extra = {};
  if (status === "shipped") {
    extra.shippedAt = Date.now();
    extra.trackingNumber = clean(trackingNumber, 60) || null;
  }
  if (status === "completed") extra.completedAt = Date.now();
  if (status === "cancelled") extra.stockReserved = false;

  const result = await transitionOrder(id, allowedFrom, status, extra);
  if (!result) throw new Error("Nie można zmienić statusu tego zamówienia (mógł się w międzyczasie zmienić).");

  if (status === "cancelled" && result.order.lines) {
    await changeStock(result.order.lines, +1);
  }
  return result.order;
}
