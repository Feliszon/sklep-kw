import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/shop-store";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/produkty"
          className="mb-2 inline-block text-xs font-semibold uppercase tracking-wide text-neutral-500 hover:text-black"
        >
          ← Wróć do listy
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-black">
          Nowy produkt
        </h1>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <ProductForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
