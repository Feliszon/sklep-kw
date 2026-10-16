"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { placeOrder, fetchPaymentMethods } from "@/lib/payments";
import { SHIPPING_METHODS, getShippingMethod, formatPrice } from "@/lib/shipping";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INPUT = "rounded-md border border-neutral-300 px-3 py-2 text-sm";
const OPTION =
  "mb-2 flex items-start gap-3 rounded-md border border-neutral-200 p-3 text-sm hover:border-neutral-300";

export default function Checkout() {
  const router = useRouter();
  const { items, totalPrice, clearCart, syncPrices } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    postalCode: "",
    city: "",
    lockerCode: "",
    notes: "",
  });
  const [shippingId, setShippingId] = useState("pickup");
  const [payment, setPayment] = useState("online"); // "online" | "cash"
  const [p24Method, setP24Method] = useState("all"); // "all" | id metody P24
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Metody P24 zależą od kwoty - pamiętamy, dla jakiej kwoty zostały pobrane.
  const [methodsState, setMethodsState] = useState({ amount: null, methods: [], error: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const shipping = getShippingMethod(shippingId);
  const total = Math.round((totalPrice + shipping.price) * 100) / 100;
  const cashAllowed = shipping.allowsCash;
  const effectivePayment = cashAllowed ? payment : "online";

  const methodsLoading = total > 0 && methodsState.amount !== total;
  const methods = methodsLoading ? [] : methodsState.methods;
  const methodsError = methodsLoading ? null : methodsState.error;

  useEffect(() => {
    if (total <= 0) return;
    let cancelled = false;
    fetchPaymentMethods(total)
      .then((data) => !cancelled && setMethodsState({ amount: total, methods: data.methods || [], error: null }))
      .catch((err) => !cancelled && setMethodsState({ amount: total, methods: [], error: err.message }));
    return () => {
      cancelled = true;
    };
  }, [total]);

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    if (!form.name.trim()) return "Podaj imię i nazwisko.";
    if (!EMAIL_RE.test(form.email.trim())) return "Podaj poprawny adres e-mail.";
    if (shipping.requires !== "none" && !form.phone.trim()) return "Podaj numer telefonu - jest potrzebny do dostawy.";
    if (shipping.requires === "locker" && !form.lockerCode.trim()) return "Podaj kod paczkomatu.";
    if (shipping.requires === "address") {
      if (!form.street.trim() || !form.city.trim()) return "Podaj pełny adres dostawy.";
      if (!/^\d{2}-\d{3}$/.test(form.postalCode.trim())) return "Podaj kod pocztowy w formacie 00-000.";
    }
    if (!acceptTerms) return "Zaakceptuj regulamin sklepu.";
    if (items.length === 0) return "Koszyk jest pusty.";
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

    setSubmitting(true);
    try {
      const result = await placeOrder({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty })),
        customer: { name: form.name, email: form.email, phone: form.phone },
        shippingMethodId: shipping.id,
        address: { street: form.street, postalCode: form.postalCode, city: form.city },
        lockerCode: form.lockerCode,
        notes: form.notes,
        paymentMethod: effectivePayment === "cash" ? "cash" : "p24",
        p24MethodId: p24Method === "all" ? undefined : Number(p24Method),
        acceptTerms,
        expectedTotal: total,
      });

      if (result.url) {
        // Koszyk czyścimy dopiero po potwierdzeniu płatności (strona statusu).
        window.location.assign(result.url);
        return;
      }
      clearCart();
      router.push(`/platnosc/status?order=${result.orderId}`);
    } catch (err) {
      if (err.prices) syncPrices(err.prices);
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="fade-in mx-auto max-w-xl px-4 py-28 text-center">
        <h1 className="mb-3 text-2xl font-semibold uppercase tracking-wide text-black">Koszyk jest pusty</h1>
        <Link href="/sklep" className="text-[#8DC63F] hover:underline">
          Przejdź do sklepu
        </Link>
      </main>
    );
  }

  return (
    <main className="fade-in mx-auto max-w-2xl px-4 py-14">
      <h1 className="mb-8 text-2xl font-semibold uppercase tracking-wide text-black">Zamówienie</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <Section title="Dane kontaktowe">
          <input type="text" placeholder="Imię i nazwisko" autoComplete="name" value={form.name} onChange={updateField("name")} className={INPUT} required />
          <input type="email" placeholder="E-mail" autoComplete="email" value={form.email} onChange={updateField("email")} className={INPUT} required />
          <input
            type="tel"
            placeholder={shipping.requires === "none" ? "Telefon (opcjonalnie)" : "Telefon"}
            autoComplete="tel"
            value={form.phone}
            onChange={updateField("phone")}
            className={INPUT}
          />
        </Section>

        <Section title="Dostawa">
          {SHIPPING_METHODS.map((m) => (
            <label key={m.id} className={OPTION}>
              <input type="radio" name="shipping" className="mt-1" checked={shippingId === m.id} onChange={() => setShippingId(m.id)} />
              <span className="flex-1">
                <span className="flex justify-between font-medium text-black">
                  {m.label}
                  <span className="font-[family-name:var(--font-mono)]">{m.price ? formatPrice(m.price) : "0 zł"}</span>
                </span>
                <span className="block text-xs text-neutral-500">{m.description}</span>
              </span>
            </label>
          ))}

          {shipping.requires === "locker" && (
            <div className="flex flex-col gap-1">
              <input placeholder="Kod paczkomatu, np. POZ08M" value={form.lockerCode} onChange={updateField("lockerCode")} className={`${INPUT} uppercase`} />
              <a href="https://inpost.pl/znajdz-paczkomat" target="_blank" rel="noopener noreferrer" className="text-xs text-[#5f8f22] hover:underline">
                Znajdź kod paczkomatu na mapie InPost →
              </a>
            </div>
          )}

          {shipping.requires === "address" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px_1fr]">
              <input placeholder="Ulica i numer" autoComplete="street-address" value={form.street} onChange={updateField("street")} className={`${INPUT} sm:col-span-3`} />
              <input placeholder="00-000" autoComplete="postal-code" value={form.postalCode} onChange={updateField("postalCode")} className={INPUT} />
              <input placeholder="Miejscowość" autoComplete="address-level2" value={form.city} onChange={updateField("city")} className={`${INPUT} sm:col-span-2`} />
            </div>
          )}
        </Section>

        <Section title="Płatność">
          {cashAllowed && (
            <label className={OPTION}>
              <input type="radio" name="payment" className="mt-1" checked={effectivePayment === "cash"} onChange={() => setPayment("cash")} />
              Gotówka przy odbiorze osobistym
            </label>
          )}

          <label className={OPTION}>
            <input
              type="radio"
              name="payment"
              className="mt-1"
              checked={effectivePayment === "online" && p24Method === "all"}
              onChange={() => {
                setPayment("online");
                setP24Method("all");
              }}
            />
            Płatność online Przelewy24 (BLIK, karta, przelew) - wybiorę na stronie płatności
          </label>

          {methodsLoading && <p className="text-sm text-neutral-500">Wczytywanie metod płatności…</p>}
          {methodsError && <p className="text-sm text-red-600">{methodsError}</p>}

          {!methodsLoading &&
            !methodsError &&
            methods.map((m) => (
              <label key={m.id} className={`${OPTION} items-center`}>
                <input
                  type="radio"
                  name="payment"
                  checked={effectivePayment === "online" && String(p24Method) === String(m.id)}
                  onChange={() => {
                    setPayment("online");
                    setP24Method(String(m.id));
                  }}
                />
                {m.imgUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.imgUrl} alt="" className="h-5 w-auto" />
                )}
                {m.name}
              </label>
            ))}
        </Section>

        <Section title="Uwagi do zamówienia (opcjonalnie)">
          <textarea rows={3} maxLength={500} value={form.notes} onChange={updateField("notes")} className={INPUT} />
        </Section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5 text-sm">
          <ul className="mb-3 flex flex-col gap-1">
            {items.map((i) => (
              <li key={`${i.productId}-${i.variantId}`} className="flex justify-between gap-4">
                <span>
                  {i.name}
                  {i.variantLabel ? ` (${i.variantLabel})` : ""} × {i.qty}
                </span>
                <span className="font-[family-name:var(--font-mono)]">{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-4 text-neutral-600">
              <span>Dostawa: {shipping.label}</span>
              <span className="font-[family-name:var(--font-mono)]">{formatPrice(shipping.price)}</span>
            </li>
          </ul>
          <div className="flex justify-between border-t border-neutral-200 pt-3 text-lg font-semibold uppercase tracking-wide text-black">
            <span>Razem</span>
            <span className="font-[family-name:var(--font-mono)]">{formatPrice(total)}</span>
          </div>
        </section>

        <label className="flex items-start gap-3 text-sm text-neutral-700">
          <input type="checkbox" className="mt-1" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
          <span>
            Akceptuję{" "}
            <Link href="/regulamin" target="_blank" className="text-[#5f8f22] underline">
              regulamin sklepu
            </Link>{" "}
            i zapoznałem/am się z{" "}
            <Link href="/polityka-prywatnosci" target="_blank" className="text-[#5f8f22] underline">
              polityką prywatności
            </Link>
            .
          </span>
        </label>

        <div className="flex flex-col items-end gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-[#8DC63F] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#7ab332] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Przetwarzanie…"
              : effectivePayment === "cash"
                ? "Zamawiam z obowiązkiem zapłaty"
                : "Zamawiam i płacę"}
          </button>
          {error && <p className="text-right text-sm text-red-600">{error}</p>}
        </div>
      </form>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-black">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
