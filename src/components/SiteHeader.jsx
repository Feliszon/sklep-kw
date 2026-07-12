"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const KW_GREEN = "#8DC63F";

function NavLink({ href, children }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`relative px-1 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
        active ? "text-black" : "text-neutral-500 hover:text-black"
      }`}
    >
      {children}
      {active && (
        <span
          className="absolute -bottom-[1px] left-0 right-0 h-[3px] rounded-full"
          style={{ backgroundColor: KW_GREEN }}
        />
      )}
    </Link>
  );
}

export default function SiteHeader() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-[#EDEDE8]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/sklep" className="flex items-center gap-3">
          <Image
            src="/logo-kw.png"
            alt="KW Poznań"
            width={42}
            height={42}
            className="rounded-full ring-1 ring-black/5"
          />
          <span className="flex flex-col leading-none">
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              Klub Wysokogórski
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold uppercase tracking-wide text-black">
              Sklep w Poznaniu
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink href="/sklep">Sklep</NavLink>
          <Link
            href="/koszyk"
            className="group flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-black transition-all hover:border-black hover:shadow-sm"
          >
            Koszyk
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-[family-name:var(--font-mono)] text-xs font-bold text-white transition-transform group-hover:scale-110"
              style={{ backgroundColor: KW_GREEN }}
            >
              {totalItems}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
