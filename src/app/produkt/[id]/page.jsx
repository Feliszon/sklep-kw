import { notFound } from "next/navigation";
import Link from "next/link";
import VariantPicker from "@/components/VariantPicker";
import ProductImage from "@/components/ProductImage";
import { getProductById, products } from "@/data/products";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/sklep"
        className="mb-6 inline-block text-xs font-semibold uppercase tracking-wide text-neutral-500 hover:text-black"
      >
        ← Wróć do sklepu
      </Link>
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-200">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {product.category}
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold uppercase tracking-wide text-black">
            {product.name}
          </h1>
          <p className="text-neutral-600">{product.description}</p>

          <div className="mt-2 border-t border-neutral-200 pt-6">
            <VariantPicker product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}
