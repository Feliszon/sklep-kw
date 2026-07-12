"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function VariantPicker({ product }) {
  const { addItem } = useCart();
  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color))],
    [product.variants]
  );

  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const sizesForColor = product.variants.filter((v) => v.color === selectedColor);
  const [selectedSize, setSelectedSize] = useState(sizesForColor[0]?.size);

  const variant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const showColorPicker = colors.length > 1;
  const showSizePicker = new Set(product.variants.map((v) => v.size)).size > 1;

  function handleColorChange(color) {
    setSelectedColor(color);
    const firstAvailable = product.variants.find((v) => v.color === color);
    setSelectedSize(firstAvailable?.size);
    setQty(1);
  }

  function handleAdd() {
    if (!variant || variant.stock === 0) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variantLabel: [variant.color, variant.size].filter(Boolean).join(" / "),
      price: variant.price,
      image: product.images?.[0] || "",
      qty,
      maxStock: variant.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col gap-5">
      {showColorPicker && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Kolor</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorChange(color)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                  selectedColor === color
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-black"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {showSizePicker && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Rozmiar</p>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={v.stock === 0}
                onClick={() => {
                  setSelectedSize(v.size);
                  setQty(1);
                }}
                className={`min-w-[3rem] rounded-md border px-3 py-1.5 text-sm font-medium transition-all ${
                  selectedSize === v.size
                    ? "border-black bg-black text-white"
                    : v.stock === 0
                    ? "cursor-not-allowed border-neutral-200 bg-white text-neutral-300 line-through"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-black"
                }`}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-5">
        <span className="font-[family-name:var(--font-mono)] text-3xl font-semibold text-black">
          {variant ? `${variant.price} zł` : "—"}
        </span>
        <span
          className={`font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide ${
            variant && variant.stock > 0 ? "text-[#5c7a2e]" : "text-red-600"
          }`}
        >
          {variant
            ? variant.stock > 0
              ? `Dostępnych: ${variant.stock} szt.`
              : "Brak na stanie"
            : "Wybierz wariant"}
        </span>
      </div>

      {variant && variant.stock > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500" htmlFor="qty">
            Ilość
          </label>
          <select
            id="qty"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm"
          >
            {Array.from({ length: Math.min(variant.stock, 10) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={!variant || variant.stock === 0}
        className={`group/btn relative flex items-center justify-center gap-2 overflow-hidden rounded-md px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none ${
          added ? "bg-black" : "bg-[#8DC63F] hover:bg-[#7ab332]"
        }`}
        style={
          !added && variant && variant.stock > 0
            ? { boxShadow: "0 10px 25px -8px rgba(141,198,63,0.45)" }
            : undefined
        }
      >
        {added ? (
          <>
            <span className="inline-block animate-[fadeInUp_0.3s_ease-out]">✓</span>
            Dodano do koszyka
          </>
        ) : (
          <>
            Dodaj do koszyka
            <span className="transition-transform group-hover/btn:translate-x-1">→</span>
          </>
        )}
      </button>
    </div>
  );
}
