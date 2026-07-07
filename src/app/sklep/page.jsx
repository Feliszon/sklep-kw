import ProductCard from "@/components/ProductCard";
import { getCategories, products } from "@/data/products";

export default function SklepPage() {
  const categories = getCategories();

  return (
    <main>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-neutral-200 bg-black">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
        >
          <path d="M0 220 Q 150 140 300 220 T 600 220 T 1000 220" stroke="#8DC63F" strokeWidth="1.5" fill="none" />
          <path d="M0 250 Q 150 180 300 250 T 600 250 T 1000 250" stroke="white" strokeWidth="1" fill="none" />
          <path d="M0 190 Q 150 90 300 190 T 600 190 T 1000 190" stroke="white" strokeWidth="1" fill="none" />
          <path d="M0 270 Q 150 220 300 270 T 600 270 T 1000 270" stroke="white" strokeWidth="1" fill="none" />
        </svg>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#8DC63F]">
            Klub Wysokogórski Poznań
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-wide text-white sm:text-5xl">
            Sklep klubowy
          </h1>
          <p className="mt-3 max-w-md text-neutral-300">
            Koszulki, torby i akcesoria z logo klubu — dla tych, którzy czują się
            najlepiej na szlaku i na ściance.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {categories.map((category) => (
          <section key={category} className="mb-14">
            <div className="mb-5 flex items-baseline gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-black">
                {category}
              </h2>
              <span className="h-px flex-1 bg-neutral-200" />
            </div>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {products
                .filter((p) => p.category === category)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
