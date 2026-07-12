import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logout } from "../actions";
import { isValidSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/auth";

const KW_GREEN = "#8DC63F";

export default async function AdminPanelLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F2F2ED]">
      <header className="border-b border-neutral-300 bg-[#14140F]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <span className="font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wide text-white">
              Panel administratora
            </span>
            <nav className="flex items-center gap-5">
              <Link
                href="/admin"
                className="text-sm font-semibold uppercase tracking-wide text-neutral-400 transition hover:text-white"
              >
                Start
              </Link>
              <Link
                href="/admin/produkty"
                className="text-sm font-semibold uppercase tracking-wide text-neutral-400 transition hover:text-white"
              >
                Produkty
              </Link>
              <Link
                href="/admin/kategorie"
                className="text-sm font-semibold uppercase tracking-wide text-neutral-400 transition hover:text-white"
              >
                Kategorie
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/sklep"
              className="text-sm font-semibold uppercase tracking-wide text-neutral-400 transition hover:text-white"
            >
              Zobacz sklep →
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-[color:var(--kw-green)] hover:text-[color:var(--kw-green)]"
                style={{ "--kw-green": KW_GREEN }}
              >
                Wyloguj
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
