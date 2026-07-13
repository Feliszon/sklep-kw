import ProductCard from "@/components/ProductCard";
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
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-wide text-black">
          Sklep klubowy
        </h1>
        <p className="mb-6 text-neutral-600">
          Koszulki, torby i akcesoria z logo klubu
        </p>

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
