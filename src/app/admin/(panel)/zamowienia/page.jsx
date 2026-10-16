import Link from "next/link";
import { listOrders, expireStaleOrders } from "@/lib/orders";
import { ORDER_STATUS } from "@/lib/order-status";
import { formatPrice } from "@/lib/shipping";
import StatusBadge from "./StatusBadge";

const FILTERS = [
  { id: "todo", label: "Do realizacji", statuses: ["paid", "cash_pending", "payment_error"] },
  { id: "awaiting_payment", label: "Nieopłacone", statuses: ["awaiting_payment"] },
  { id: "done", label: "Wysłane / zrealizowane", statuses: ["shipped", "completed"] },
  { id: "cancelled", label: "Anulowane", statuses: ["cancelled"] },
  { id: "all", label: "Wszystkie", statuses: Object.keys(ORDER_STATUS) },
];

function formatDate(ts) {
  return new Date(ts).toLocaleString("pl-PL", { timeZone: "Europe/Warsaw", dateStyle: "short", timeStyle: "short" });
}

export default async function AdminOrdersPage({ searchParams }) {
  const { filtr } = await searchParams;
  const filter = FILTERS.find((f) => f.id === filtr) || FILTERS[0];

  await expireStaleOrders().catch((err) => console.error(err));
  const all = await listOrders();
  const orders = all.filter((o) => filter.statuses.includes(o.status));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-wide text-black">
        Zamówienia
      </h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = all.filter((o) => f.statuses.includes(o.status)).length;
          const active = f.id === filter.id;
          return (
            <Link
              key={f.id}
              href={`/admin/zamowienia?filtr=${f.id}`}
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                active ? "border-black bg-black text-white" : "border-neutral-300 text-neutral-600 hover:border-black"
              }`}
            >
              {f.label} ({count})
            </Link>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">Brak zamówień w tej kategorii.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Numer</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Klient</th>
                <th className="px-4 py-3">Dostawa</th>
                <th className="px-4 py-3">Kwota</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs">
                    <Link href={`/admin/zamowienia/${o.id}`} className="font-semibold text-black hover:underline">
                      {o.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">{o.customer?.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{o.shipping?.label}</td>
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)]">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
