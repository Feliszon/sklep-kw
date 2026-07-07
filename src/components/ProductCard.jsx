"use client";

import Link from "next/link";

export default function ProductCard({ product }) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceLabel = minPrice === maxPrice ? `${minPrice} zł` : `od ${minPrice} zł`;

  return (
    <Link
      href={`/produkt/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-black hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        {totalStock === 0 && (
          <span className="absolute right-2 top-2 rounded bg-black px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            Wyprzedane
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
          {product.category}
        </span>
        <h3 className="font-[family-name:var(--font-display)] font-semibold uppercase tracking-wide text-black">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-bold text-black">{priceLabel}</span>
          <span className="text-xs text-neutral-500">
            {totalStock > 0 ? `${totalStock} szt.` : "Brak"}
          </span>
        </div>
      </div>
    </Link>
  );
}
