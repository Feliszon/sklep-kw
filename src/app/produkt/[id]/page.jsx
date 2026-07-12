import { notFound } from "next/navigation";
import Link from "next/link";
import VariantPicker from "@/components/VariantPicker";
import ProductGallery from "@/components/ProductGallery";
import { getProductById } from "@/lib/shop-store";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return notFound();

  return (
    <main className="fade-in mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/sklep"
        className="group mb-8 inline-flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide text-neutral-500 transition hover:text-black"
      >
        <span className="transition-transform group-hover:-translate-x-1">←</span>
        Wróć do sklepu
      </Link>
      <div className="grid gap-12 sm:grid-cols-2">
        <div>
          <ProductGallery images={product.images} alt={product.name} />
        </div>

        <div className="flex flex-col gap-4">
          <span className="inline-block w-fit -rotate-3 rounded-sm border border-dashed border-black/25 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wide text-black/60">
            {product.category}
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold uppercase leading-tight tracking-wide text-black">
            {product.name}
          </h1>
          <p className="text-neutral-600">{product.description}</p>

          <div className="mt-2">
            <VariantPicker product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}
