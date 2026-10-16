export default function LegalPage({ title, updated, children }) {
  return (
    <main className="fade-in mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-[family-name:var(--font-display)] mb-2 text-3xl font-semibold uppercase tracking-wide text-black">
        {title}
      </h1>
      <p className="mb-10 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide text-neutral-500">
        Obowiązuje od {updated}
      </p>
      <div className="text-[15px] leading-relaxed text-neutral-800 [&_a]:text-[#5f8f22] [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-black [&_li]:mb-1.5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
    </main>
  );
}

export const SELLER = {
  name: "Klub Wysokogórski w Poznaniu",
  address: "ul. Składowa 11/10, 61-897 Poznań",
  nip: "778-12-01-670",
  regon: "001097823",
  krs: "0000081650",
  email: "klub@kw.poznan.pl",
  phone: "+48 602 344 311",
};
