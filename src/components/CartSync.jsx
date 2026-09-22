"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { getCurrentVariants } from "@/lib/cart-actions";

// Po wejściu do koszyka/kasy porównuje koszyk z aktualnymi cenami i stanami
// w sklepie i pokazuje, co się zmieniło od dodania produktów.
export default function CartSync({ className = "" }) {
  const { items, applyServerData } = useCart();
  const [changes, setChanges] = useState([]);
  const keys = items.map((i) => `${i.productId}:${i.variantId}`).join(",");

  useEffect(() => {
    if (!keys) return;
    let cancelled = false;
    getCurrentVariants(keys.split(","))
      .then((current) => {
        if (cancelled) return;
        const found = applyServerData(current);
        if (found.length > 0) setChanges((prev) => [...prev, ...found]);
      })
      .catch((err) => console.error("Nie udało się odświeżyć koszyka:", err));
    return () => {
      cancelled = true;
    };
    // applyServerData jest tworzone na nowo przy każdym renderze - synchronizujemy tylko przy zmianie pozycji.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys]);

  if (changes.length === 0) return null;

  return (
    <div className={`mx-auto px-4 pt-8 ${className}`}>
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="mb-1 font-semibold">Koszyk został zaktualizowany:</p>
        <ul className="list-disc space-y-0.5 pl-5">
          {changes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
