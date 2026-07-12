"use client";

import { useActionState } from "react";
import { deleteProductAction } from "./actions";

export default function DeleteButton({ productId, productName }) {
  const [state, action, isPending] = useActionState(deleteProductAction, null);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Usunac produkt "${productName}"? Tej operacji nie da sie cofnac.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={productId} />
      <button
        type="submit"
        disabled={isPending}
        className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:underline disabled:opacity-50"
      >
        {isPending ? "Usuwanie..." : "Usun"}
      </button>
      {state?.error && <p className="text-xs text-red-600 mt-1">{state.error}</p>}
    </form>
  );
}
