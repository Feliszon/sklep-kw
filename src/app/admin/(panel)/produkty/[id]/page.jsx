import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductById, getCategories } from "@/lib/shop-store";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return notFound();

  const categories = getCategories();

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
          Edytuj: {product.name}
        </h1>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <ProductForm mode="edit" product={product} categories={categories} />
      </div>
    </div>
  );
}
