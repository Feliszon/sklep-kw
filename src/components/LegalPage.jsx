import { LEGAL_DRAFT } from "@/lib/seller";

export default function LegalPage({ title, updated, children }) {
  return (
    <main className="fade-in mx-auto max-w-3xl px-4 py-14">
      {LEGAL_DRAFT && (
        <p className="mb-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Projekt dokumentu – wymaga weryfikacji i uzupełnienia przez Klub przed uruchomieniem sprzedaży.
        </p>
      )}
      <h1 className="font-[family-name:var(--font-display)] mb-2 text-3xl font-semibold uppercase tracking-wide text-black">
        {title}
      </h1>
      <p className="mb-10 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide text-neutral-500">
        Obowiązuje od: {updated}
      </p>
      <div className="legal-content space-y-8 text-[15px] leading-relaxed text-neutral-700">{children}</div>
    </main>
  );
}

export function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] mb-3 text-lg font-semibold uppercase tracking-wide text-black">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

// Widoczny znacznik miejsca, które Klub musi uzupełnić.
export function Fill({ children }) {
  return <mark className="rounded bg-amber-100 px-1 text-amber-900">[UZUPEŁNIJ: {children}]</mark>;
}
