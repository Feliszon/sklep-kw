"use client";

import { useActionState } from "react";
import { login } from "./actions";

const KW_GREEN = "#8DC63F";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#14140F] px-4">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-xl border border-white/10 bg-[#1c1c15] p-8 shadow-2xl"
      >
        <p className="mb-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-neutral-500">
          Klub Wysokogórski Poznań
        </p>
        <h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-wide text-white">
          Panel administratora
        </h1>

        <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Hasło
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mb-4 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-[#8DC63F]"
        />

        {state?.error && (
          <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: KW_GREEN }}
        >
          {pending ? "Logowanie…" : "Zaloguj się"}
        </button>
      </form>
    </main>
  );
}
