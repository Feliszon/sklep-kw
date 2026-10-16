import { NextResponse } from "next/server";
import { createOrder, OrderError, adminSetOrderStatus } from "@/lib/orders";
import { registerTransaction, isP24Configured } from "@/lib/p24";
import { sendOrderConfirmedEmails } from "@/lib/mailer";
import { SITE_URL } from "@/lib/site";

function siteUrl() {
  return SITE_URL;
}

export async function POST(request) {
  const input = await request.json().catch(() => null);
  if (!input) {
    return NextResponse.json({ error: "Nieprawidłowe dane zamówienia." }, { status: 400 });
  }

  if (input.paymentMethod !== "cash" && !isP24Configured()) {
    return NextResponse.json(
      { error: "Płatności online są chwilowo niedostępne. Wybierz odbiór osobisty z płatnością gotówką lub spróbuj później." },
      { status: 503 }
    );
  }

  let order;
  try {
    order = await createOrder(input);
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message, ...err.details }, { status: 400 });
    }
    console.error("Błąd tworzenia zamówienia:", err);
    return NextResponse.json({ error: "Nie udało się złożyć zamówienia. Spróbuj ponownie." }, { status: 500 });
  }

  if (order.paymentMethod === "cash") {
    await sendOrderConfirmedEmails(order);
    return NextResponse.json({ orderId: order.id });
  }

  try {
    const url = await registerTransaction({
      sessionId: order.id,
      amount: Math.round(order.total * 100),
      currency: "PLN",
      description: `Zamówienie ${order.number} - Sklep KW Poznań`,
      email: order.customer.email,
      client: order.customer.name,
      phone: order.customer.phone || undefined,
      country: "PL",
      language: "pl",
      method: Number.isInteger(input.p24MethodId) ? input.p24MethodId : undefined,
      urlReturn: `${siteUrl()}/platnosc/status?order=${order.id}`,
      urlStatus: `${siteUrl()}/api/p24/webhook`,
      timeLimit: 15,
      regulationAccept: false,
      encoding: "UTF-8",
    });
    return NextResponse.json({ orderId: order.id, url });
  } catch (err) {
    console.error("Rejestracja płatności P24 nie powiodła się:", err.message);
    await adminSetOrderStatus(order.id, "cancelled").catch(() => {});
    return NextResponse.json(
      { error: "Nie udało się połączyć z systemem płatności. Spróbuj ponownie za chwilę." },
      { status: 502 }
    );
  }
}
