import Image from "next/image";
import Link from "next/link";
import { SELLER } from "@/lib/seller";

const KW_GREEN = "#8DC63F";

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="relative">
      {/* Górna część - kontakt na tle sylwetki gór */}
      <div className="relative overflow-hidden bg-neutral-100">
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-full w-full opacity-[0.35]"
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMax slice"
        >
          <path
            d="M0 300 L0 190 L120 110 L200 170 L300 60 L400 150 L480 90 L600 190 L680 120 L800 200 L900 80 L1000 170 L1080 130 L1200 210 L1200 300 Z"
            fill="#c9cbc0"
          />
          <path
            d="M0 300 L0 230 L150 180 L260 220 L360 150 L470 215 L560 180 L650 230 L760 165 L860 225 L960 190 L1080 235 L1200 200 L1200 300 Z"
            fill="#d8d9d0"
          />
        </svg>

        <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 px-4 py-16 sm:flex-row sm:items-center">
          <div>
            <h2
              className="font-[family-name:var(--font-display)] mb-4 text-sm font-bold uppercase tracking-[0.2em]"
              style={{ color: KW_GREEN }}
            >
              Kontakt
            </h2>
            <div className="space-y-1 text-sm text-neutral-700">
              <p className="font-semibold text-black">{SELLER.name}</p>
              <p>{SELLER.street}</p>
              <p>{SELLER.postalCity}</p>
              <p>
                e-mail:{" "}
                <a href={`mailto:${SELLER.email}`} className="font-medium hover:underline" style={{ color: KW_GREEN }}>
                  {SELLER.email}
                </a>
              </p>
              <p>
                Tel:{" "}
                <a href={SELLER.phoneHref} className="font-medium hover:underline" style={{ color: KW_GREEN }}>
                  {SELLER.phone}
                </a>
              </p>
            </div>
            <div className="mt-4 space-y-0.5 font-[family-name:var(--font-mono)] text-xs text-neutral-500">
              <p>NIP: {SELLER.nip}</p>
              <p>REGON: {SELLER.regon}</p>
              <p>KRS: {SELLER.krs}</p>
            </div>
            <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <Link href="/regulamin" className="font-medium text-black hover:underline">
                Regulamin
              </Link>
              <Link href="/polityka-prywatnosci" className="font-medium text-black hover:underline">
                Polityka prywatności
              </Link>
            </nav>
          </div>

          <Image
            src="/logo-kw.png"
            alt="KW Poznań"
            width={140}
            height={140}
            className="shrink-0 opacity-90"
          />
        </div>
      </div>

      {/* Dolny pasek - copyright + social media */}
      <div style={{ backgroundColor: KW_GREEN }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <p className="text-sm text-black/80">
            © Copyright – Klub Wysokogórski Poznań – sklep online
          </p>
          <div className="flex items-center gap-4 text-black/80">
            <a href="https://www.facebook.com/p/Klub-Wysokog%C3%B3rski-w-Poznaniu-100079341175294/?locale=pl_PL" aria-label="Facebook" className="transition hover:text-black">
              <FacebookIcon />
            </a>
            <a href="https://www.instagram.com/klubwysokogorskiwpoznaniu/" aria-label="Instagram" className="transition hover:text-black">
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
