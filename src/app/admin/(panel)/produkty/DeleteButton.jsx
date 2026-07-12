"use client";

import { deleteProductAction } from "./actions";

export default function DeleteButton({ productId, productName }) {
  const action = deleteProductAction.bind(null, productId);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Usunąć produkt „${productName}”? Tej operacji nie da się cofnąć.`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:underline"
      >
        Usuń
      </button>
    </form>
  );
}
