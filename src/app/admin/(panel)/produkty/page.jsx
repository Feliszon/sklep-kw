import Link from "next/link";
import { getAllProducts } from "@/lib/shop-store";
import DeleteButton from "./DeleteButton";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-black">
          Produkty
        </h1>
        <Link
          href="/admin/produkty/nowy"
          className="rounded-md bg-[#8DC63F] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#7ab332]"
        >
          + Dodaj produkt
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Nazwa</th>
              <th className="px-4 py-3">Kategoria</th>
              <th className="px-4 py-3">Cena</th>
              <th className="px-4 py-3">Stan</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((product) => {
              const prices = product.variants.map((v) => v.price);
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              const priceLabel = min === max ? `${min} zł` : `${min}–${max} zł`;
              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

              return (
                <tr key={product.id} className="transition hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-black">{product.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{product.category}</td>
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-neutral-700">
                    {priceLabel}
                  </td>
                  <td className="px-4 py-3">
                    <span className={totalStock === 0 ? "text-red-600" : "text-neutral-700"}>
                      {totalStock} szt.
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/produkty/${product.id}`}
                        className="text-xs font-semibold uppercase tracking-wide text-neutral-600 hover:text-black hover:underline"
                      >
                        Edytuj
                      </Link>
                      <DeleteButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  Brak produktów. Dodaj pierwszy przyciskiem powyżej.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

