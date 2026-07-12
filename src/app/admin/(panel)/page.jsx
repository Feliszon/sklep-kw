import Link from "next/link";
import { getAllProducts, getCategories } from "@/lib/shop-store";

const LOW_STOCK_THRESHOLD = 2;

export default function AdminDashboardPage() {
  const products = getAllProducts();
  const categories = getCategories();

  const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0);
  const outOfStock = [];
  const lowStock = [];

  for (const product of products) {
    for (const variant of product.variants) {
      const label = [product.name, [variant.color, variant.size].filter(Boolean).join(" / ")]
        .filter(Boolean)
        .join(" — ");
      if (variant.stock === 0) {
        outOfStock.push({ id: `${product.id}-${variant.id}`, productId: product.id, label });
      } else if (variant.stock <= LOW_STOCK_THRESHOLD) {
        lowStock.push({
          id: `${product.id}-${variant.id}`,
          productId: product.id,
          label,
          stock: variant.stock,
        });
      }
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Produkty" value={products.length} href="/admin/produkty" />
        <StatCard label="Kategorie" value={categories.length} href="/admin/kategorie" />
        <StatCard label="Warianty" value={totalVariants} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Brak na stanie" emptyLabel="Wszystko dostępne 🎉" items={outOfStock} />
        <Panel
          title={`Niski stan (≤ ${LOW_STOCK_THRESHOLD} szt.)`}
          emptyLabel="Brak zagrożonych wariantów."
          items={lowStock}
          renderExtra={(item) => (
            <span className="font-[family-name:var(--font-mono)] text-xs text-neutral-500">
              {item.stock} szt.
            </span>
          )}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, href }) {
  const content = (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-black">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold text-black">
        {value}
      </p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function Panel({ title, emptyLabel, items, renderExtra }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wide text-black">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2">
              <Link
                href={`/admin/produkty/${item.productId}`}
                className="text-sm text-neutral-700 transition hover:text-black hover:underline"
              >
                {item.label}
              </Link>
              {renderExtra?.(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
