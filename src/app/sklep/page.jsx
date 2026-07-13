import ProductCard from "@/components/ProductCard";
import HeroSpotlight from "@/components/HeroSpotlight";
import RevealOnScroll from "@/components/RevealOnScroll";
import SearchBar from "@/components/SearchBar";
import { getCategories, getAllProducts } from "@/lib/shop-store";

export const dynamic = "force-dynamic";

export default async function SklepPage({ searchParams }) {
  const categories = await getCategories();
  const products = await getAllProducts();
  const query = (await searchParams).q || "";

  const filteredProducts = query.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  return (
    <main>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-neutral-800 bg-[#14140F]">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]"
          viewBox="0 0 1000 320"
          preserveAspectRatio="none"
        >
          <path d="M0 240 Q 150 150 300 240 T 600 240 T 1000 240" stroke="#8DC63F" strokeWidth="1.5" fill="none" />
          <path d="M0 270 Q 150 200 300 270 T 600 270 T 1000 270" stroke="white" strokeWidth="1" fill="none" />
          <path d="M0 205 Q 150 95 300 205 T 600 205 T 1000 205" stroke="white" strokeWidth="1" fill="none" />
          <path d="M0 290 Q 150 245 300 290 T 600 290 T 1000 290" stroke="white" strokeWidth="1" fill="none" />
          <path d="M0 165 Q 150 40 300 165 T 600 165 T 1000 165" stroke="white" strokeWidth="0.75" fill="none" />
        </svg>
        <HeroSpotlight />
        <div className="fade-in relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.35em] text-[#8DC63F]">
            Klub Wysokogórski Poznań
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold uppercase leading-[0.95] tracking-wide text-white sm:text-6xl">
            Sklep
            <br />
            klubowy
          </h1>
          <p className="mt-5 max-w-md text-neutral-400">
            Koszulki, torby i akcesoria z logo klubu — dla tych, którzy czują się
            najlepiej na szlaku i na ściance.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <SearchBar />

        {query && (
          <div className="mb-8">
            <p className="text-sm text-neutral-600">
              Wyniki wyszukiwania dla: <span className="font-semibold">"{query}"</span>
              {filteredProducts.length === 0 && <span> — nic nie znaleziono</span>}
              {filteredProducts.length > 0 && <span> — {filteredProducts.length} produktów</span>}
            </p>
          </div>
        )}

        {filteredProducts.length === 0 && query ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
            <p className="text-neutral-600">Nie znaleziono produktów pasujących do Twojego wyszukiwania.</p>
          </div>
        ) : (
          <div>
            {query ? (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              categories.map((category, i) => (
                <RevealOnScroll key={category} className={i > 0 ? "mt-16" : ""}>
                  <div className="mb-6 flex items-baseline gap-4">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#8DC63F" }} />
                    <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-black">
                      {category}
                    </h2>
                    <span className="h-px flex-1 bg-neutral-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                    {products
                      .filter((p) => p.category === category)
                      .map((product, j) => (
                        <div
                          key={product.id}
                          className="fade-in"
                          style={{ animationDelay: `${j * 60}ms` }}
                        >
                          <ProductCard product={product} />
                        </div>
                      ))}
                  </div>
                </RevealOnScroll>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
