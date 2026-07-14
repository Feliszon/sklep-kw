"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { createPayment, fetchPaymentMethods } from "@/lib/payments";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Checkout() {
  const { items, totalPrice, totalItems } = useCart();

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [methods, setMethods] = useState([]);
  const [methodsError, setMethodsError] = useState(null);
  const [methodsLoading, setMethodsLoading] = useState(totalPrice > 0);
  const [selectedMethod, setSelectedMethod] = useState("cash"); // "cash" | "all" | numeric P24 method id
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [cashConfirmed, setCashConfirmed] = useState(false);

  useEffect(() => {
    if (totalPrice <= 0) return;
    fetchPaymentMethods(totalPrice)
      .then((data) => setMethods(data.methods || []))
      .catch((err) => setMethodsError(err.message))
      .finally(() => setMethodsLoading(false));
  }, [totalPrice]);

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    if (!form.name.trim()) return "Podaj imię i nazwisko.";
    if (!EMAIL_RE.test(form.email.trim())) return "Podaj poprawny adres e-mail.";
    if (totalPrice <= 0) return "Koszyk jest pusty.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (selectedMethod === "cash") {
      // Odbiór osobisty z płatnością gotówką - bez integracji P24.
      // TODO: po dodaniu Firestore zapisz tu zamówienie (status: "oczekuje na odbiór").
      setCashConfirmed(true);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: totalPrice,
        description: `Zamówienie sklep KW (${totalItems} szt.)`,
        email: form.email.trim(),
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
      };
      if (selectedMethod !== "all") {
        payload.method = Number(selectedMethod);
      }
      const { url } = await createPayment(payload);
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (items.length === 0 && !cashConfirmed) {
    return (
      <main className="fade-in mx-auto max-w-xl px-4 py-28 text-center">
        <h1 className="mb-3 text-2xl font-semibold uppercase tracking-wide text-black">Koszyk jest pusty</h1>
        <Link href="/sklep" className="text-[#8DC63F] hover:underline">
          Przejdź do sklepu
        </Link>
      </main>
    );
  }

  if (cashConfirmed) {
    return (
      <main className="fade-in mx-auto max-w-xl px-4 py-28 text-center">
        <h1 className="mb-4 text-2xl font-semibold uppercase tracking-wide text-black">Zamówienie przyjęte</h1>
        <p className="text-neutral-600">
          Wybrano płatność gotówką przy odbiorze osobistym. Skontaktujemy się w sprawie odbioru zamówienia.
        </p>
        <Link href="/sklep" className="mt-6 inline-block text-[#8DC63F] hover:underline">
          Wróć do sklepu
        </Link>
      </main>
    );
  }

  return (
    <main className="fade-in mx-auto max-w-2xl px-4 py-14">
      <h1 className="mb-8 text-2xl font-semibold uppercase tracking-wide text-black">Zamówienie</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-black">Dane do zamówienia</h2>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Imię i nazwisko"
              value={form.name}
              onChange={updateField("name")}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="email"
              placeholder="E-mail"
              value={form.email}
              onChange={updateField("email")}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="tel"
              placeholder="Telefon (opcjonalnie)"
              value={form.phone}
              onChange={updateField("phone")}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-black">Sposób płatności</h2>

          <label className="mb-2 flex items-center gap-3 rounded-md border border-neutral-200 p-3 text-sm hover:border-neutral-300">
            <input
              type="radio"
              name="method"
              value="cash"
              checked={selectedMethod === "cash"}
              onChange={() => setSelectedMethod("cash")}
            />
            Gotówka – odbiór osobisty
          </label>

          {methodsLoading && <p className="text-sm text-neutral-500">Wczytywanie metod płatności P24…</p>}
          {methodsError && (
            <p className="text-sm text-red-600">
              Nie udało się wczytać metod płatności online ({methodsError}). Dostępna jest płatność gotówką.
            </p>
          )}

          {!methodsLoading && !methodsError && methods.length > 0 && (
            <>
              <label className="mb-2 flex items-center gap-3 rounded-md border border-neutral-200 p-3 text-sm hover:border-neutral-300">
                <input
                  type="radio"
                  name="method"
                  value="all"
                  checked={selectedMethod === "all"}
                  onChange={() => setSelectedMethod("all")}
                />
                Przelewy24 – wybiorę metodę na stronie płatności
              </label>

              {methods.map((m) => (
                <label
                  key={m.id}
                  className="mb-2 flex items-center gap-3 rounded-md border border-neutral-200 p-3 text-sm hover:border-neutral-300"
                >
                  <input
                    type="radio"
                    name="method"
                    value={m.id}
                    checked={String(selectedMethod) === String(m.id)}
                    onChange={() => setSelectedMethod(String(m.id))}
                  />
                  {m.imgUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.imgUrl} alt="" className="h-5 w-auto" />
                  )}
                  {m.name}
                </label>
              ))}
            </>
          )}
        </section>

        <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
          <span className="text-lg font-semibold uppercase tracking-wide text-black">
            Razem <span className="font-[family-name:var(--font-mono)]">{totalPrice} zł</span>
          </span>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-[#8DC63F] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#7ab332] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Przetwarzanie…" : selectedMethod === "cash" ? "Złóż zamówienie" : "Przejdź do płatności"}
          </button>
        </div>

        {error && <p className="text-right text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
