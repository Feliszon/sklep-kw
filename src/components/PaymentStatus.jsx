"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchPaymentReturnStatus } from "@/lib/payments";

export default function PaymentStatus() {
  const searchParams = useSearchParams();
  const session = searchParams.get("session");
  const [state, setState] = useState({ loading: !!session, error: null, data: null });

  useEffect(() => {
    if (!session) return;
    fetchPaymentReturnStatus(session)
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((err) => setState({ loading: false, error: err.message, data: null }));
  }, [session]);

  return (
    <main className="fade-in mx-auto max-w-xl px-4 py-28 text-center">
      <h1 className="mb-4 text-2xl font-semibold uppercase tracking-wide text-black">Status płatności</h1>

      {!session && <p className="text-red-600">Brak identyfikatora sesji płatności w adresie URL.</p>}
      {session && state.loading && <p className="text-neutral-600">Sprawdzanie statusu płatności…</p>}
      {state.error && <p className="text-red-600">{state.error}</p>}

      {state.data && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="mb-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide text-neutral-500">
            Sesja: {state.data.session}
          </p>
          <p className="text-black">{state.data.message}</p>
        </div>
      )}

      <Link
        href="/sklep"
        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#8DC63F] hover:underline"
      >
        Wróć do sklepu
      </Link>
    </main>
  );
}
