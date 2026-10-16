"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchOrderStatus } from "@/lib/payments";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shipping";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20; // ~1 min - webhook P24 zwykle przychodzi w kilka sekund

const MESSAGES = {
  awaiting_payment:
    "Czekamy na potwierdzenie płatności od Przelewy24. Jeśli płatność się nie powiodła, możesz wrócić do koszyka i spróbować ponownie.",
  paid: "Płatność przyjęta - dziękujemy! Potwierdzenie wysłaliśmy na Twój adres e-mail.",
  cash_pending:
    "Zamówienie przyjęte. Zapłacisz gotówką przy odbiorze - skontaktujemy się mailowo, aby ustalić termin. Potwierdzenie wysłaliśmy na Twój e-mail.",
  shipped: "Zamówienie zostało wysłane.",
  completed: "Zamówienie zostało zrealizowane.",
  cancelled: "Zamówienie zostało anulowane (np. płatność nie dotarła w wyznaczonym czasie).",
  payment_error: "Wystąpił problem z płatnością. Skontaktuj się z nami: klub@kw.poznan.pl.",
};

export default function PaymentStatus() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const { clearCart } = useCart();
  const [state, setState] = useState({ loading: !!orderId, error: null, data: null, gaveUp: false });

  useEffect(() => {
    if (!orderId) return;
    let polls = 0;
    let timer;
    let stopped = false;

    async function tick() {
      try {
        const data = await fetchOrderStatus(orderId);
        if (stopped) return;
        setState({ loading: false, error: null, data, gaveUp: false });
        if (["paid", "cash_pending", "shipped", "completed"].includes(data.status)) {
          clearCart();
          return;
        }
        if (data.status === "awaiting_payment") {
          polls += 1;
          if (polls < MAX_POLLS) timer = setTimeout(tick, POLL_INTERVAL_MS);
          else setState((s) => ({ ...s, gaveUp: true }));
        }
      } catch (err) {
        if (!stopped) setState({ loading: false, error: err.message, data: null, gaveUp: false });
      }
    }

    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const { data } = state;
  const success = data && ["paid", "cash_pending", "shipped", "completed"].includes(data.status);

  return (
    <main className="fade-in mx-auto max-w-xl px-4 py-28 text-center">
      <h1 className="mb-4 text-2xl font-semibold uppercase tracking-wide text-black">
        {success ? "Dziękujemy za zamówienie" : "Status zamówienia"}
      </h1>

      {!orderId && <p className="text-red-600">Brak numeru zamówienia w adresie strony.</p>}
      {orderId && state.loading && <p className="text-neutral-600">Sprawdzanie statusu…</p>}
      {state.error && <p className="text-red-600">{state.error}</p>}

      {data && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="mb-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide text-neutral-500">
            Zamówienie {data.number} · {formatPrice(data.total)}
          </p>
          <p className="text-black">{MESSAGES[data.status] || data.statusLabel}</p>
          {data.status === "awaiting_payment" && !state.gaveUp && (
            <p className="mt-3 text-xs text-neutral-500">Strona odświeży się automatycznie…</p>
          )}
          {state.gaveUp && (
            <p className="mt-3 text-xs text-neutral-500">
              Potwierdzenie jeszcze nie dotarło. Jeśli pieniądze zostały pobrane, dostaniesz maila z potwierdzeniem - nie płać ponownie.
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-6">
        {data?.status === "awaiting_payment" || data?.status === "cancelled" ? (
          <Link href="/koszyk" className="text-sm font-semibold uppercase tracking-wide text-[#8DC63F] hover:underline">
            Wróć do koszyka
          </Link>
        ) : null}
        <Link href="/sklep" className="text-sm font-semibold uppercase tracking-wide text-[#8DC63F] hover:underline">
          Wróć do sklepu
        </Link>
      </div>
    </main>
  );
}
