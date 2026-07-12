"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCategoryAction } from "./actions";

export default function AddCategoryForm() {
  const [state, formAction, pending] = useActionState(addCategoryAction, null);
  const formRef = useRef(null);

  useEffect(() => {
    if (state && !state.error) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-start gap-3">
      <div className="flex flex-col gap-1">
        <input
          name="name"
          required
          placeholder="Nazwa nowej kategorii"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[#8DC63F] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#7ab332] disabled:opacity-60"
      >
        Dodaj
      </button>
    </form>
  );
}
