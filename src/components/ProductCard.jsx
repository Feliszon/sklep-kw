"use client";

import { useRef } from "react";
import Link from "next/link";

export default function ProductCard({ product }) {
  const ref = useRef(null);
  const coverImage = product.images?.[0];
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceLabel = minPrice === maxPrice ? `${minPrice} zł` : `od ${minPrice} zł`;

  function handleMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${y * -6}deg) rotateY(${x * 8}deg) translateY(-6px)`;
    el.style.boxShadow = `${-x * 24}px ${20 - y * 10}px 40px -14px rgba(20,20,15,0.22)`;
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.boxShadow = "";
  }

  return (
    <Link
      ref={ref}
      href={`/produkt/${product.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-200 ease-out will-change-transform hover:border-black"
    >
      {/* metka jak przy odzieży */}
      <div className="absolute left-3 top-3 z-10 -rotate-6 rounded-sm border border-dashed border-black/25 bg-white/90 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-wide text-black/60 backdrop-blur-sm">
        {product.category}
      </div>

      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        {totalStock === 0 && (
          <span className="absolute right-3 top-3 rounded bg-black px-2 py-1 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-wide text-white">
            Wyprzedane
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-[family-name:var(--font-display)] leading-tight font-semibold uppercase tracking-wide text-black">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-[family-name:var(--font-mono)] text-base font-semibold text-black">
            {priceLabel}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-[11px] text-neutral-500">
            {totalStock > 0 ? `${totalStock} szt.` : "brak"}
          </span>
        </div>
      </div>
    </Link>
  );
}
