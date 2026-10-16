// Wywołania API sklepu z przeglądarki (checkout i strona statusu płatności).

async function parseJsonOrThrow(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.error || `Błąd żądania (HTTP ${res.status}).`);
    error.prices = data?.prices;
    throw error;
  }
  return data;
}

export async function placeOrder(payload) {
  const res = await fetch("/api/zamowienia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res);
}

export async function fetchPaymentMethods(amountPln) {
  const params = new URLSearchParams({ amount: String(amountPln) });
  return parseJsonOrThrow(await fetch(`/api/p24/metody?${params}`));
}

export async function fetchOrderStatus(orderId) {
  return parseJsonOrThrow(await fetch(`/api/zamowienia/${encodeURIComponent(orderId)}`, { cache: "no-store" }));
}
