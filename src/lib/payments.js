const FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_FUNCTIONS_URL || "http://127.0.0.1:5001/demo-project/europe-west1";

async function parseJsonOrThrow(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Błąd żądania (HTTP ${res.status}).`);
  }
  return data;
}

export async function createPayment(payload) {
  const res = await fetch(`${FUNCTIONS_BASE_URL}/createPayment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res);
}

export async function fetchPaymentMethods(amountPln) {
  const params = new URLSearchParams({ amount: String(amountPln) });
  const res = await fetch(`${FUNCTIONS_BASE_URL}/getPaymentMethods?${params.toString()}`);
  return parseJsonOrThrow(res);
}

export async function fetchPaymentReturnStatus(session) {
  const params = new URLSearchParams({ session });
  const res = await fetch(`${FUNCTIONS_BASE_URL}/paymentReturn?${params.toString()}`);
  return parseJsonOrThrow(res);
}
