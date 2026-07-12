import { getCategoryUsage } from "@/lib/shop-store";
import AddCategoryForm from "./AddCategoryForm";
import CategoryRow from "./CategoryRow";

export default function AdminCategoriesPage() {
  const categories = getCategoryUsage();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-black">
        Kategorie
      </h1>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Nowa kategoria
        </p>
        <AddCategoryForm />
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Nazwa</th>
              <th className="px-4 py-3">Produkty</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {categories.map(({ name, count }) => (
              <CategoryRow key={name} name={name} count={count} />
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                  Brak kategorii.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
