"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function KoszykPage() {
  const { items, updateQty, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-[family-name:var(--font-display)] mb-3 text-2xl font-semibold uppercase tracking-wide text-black">
          Koszyk jest pusty
        </h1>
        <p className="mb-6 text-neutral-600">Zajrzyj do sklepu i wybierz coś dla siebie.</p>
        <Link
          href="/sklep"
          className="inline-block rounded-md bg-[#8DC63F] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:bg-[#7ab332] hover:shadow-md"
        >
          Przejdź do sklepu
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-[family-name:var(--font-display)] mb-8 text-2xl font-semibold uppercase tracking-wide text-black">
        Twój koszyk
      </h1>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId}`}
            className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-black">{item.name}</p>
              <p className="text-sm text-neutral-500">{item.variantLabel}</p>
              <p className="text-sm font-bold text-black">{item.price} zł</p>
            </div>

            <select
              value={item.qty}
              onChange={(e) =>
                updateQty(item.productId, item.variantId, Number(e.target.value))
              }
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            >
              {Array.from({ length: Math.min(item.maxStock, 10) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => removeItem(item.productId, item.variantId)}
              className="text-sm font-medium text-red-600 transition hover:underline"
            >
              Usuń
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-6">
        <span className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-black">
          Razem: {totalPrice} zł
        </span>
        <button
          type="button"
          disabled
          title="Etap realizacji zamówienia dodamy w kolejnym kroku"
          className="cursor-not-allowed rounded-md bg-neutral-300 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-neutral-600"
        >
          Przejdź do zamówienia
        </button>
      </div>
      <p className="mt-3 text-right text-sm text-neutral-500">
        Wybór odbioru/wysyłki i płatności dodamy w następnym kroku.
      </p>
    </main>
  );
}
