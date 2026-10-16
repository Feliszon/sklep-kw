import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders";
import { ADMIN_TRANSITIONS } from "@/lib/order-status";
import { formatPrice } from "@/lib/shipping";
import StatusBadge from "../StatusBadge";
import OrderActions from "./OrderActions";

function formatDate(ts) {
  return ts
    ? new Date(ts).toLocaleString("pl-PL", { timeZone: "Europe/Warsaw", dateStyle: "medium", timeStyle: "short" })
    : "-";
}

export default async function AdminOrderPage({ params }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const lines = Array.isArray(order.lines) ? order.lines : Object.values(order.lines || {});

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/zamowienia" className="text-xs font-semibold uppercase tracking-wide text-neutral-500 hover:text-black">
        ← Wszystkie zamówienia
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-[family-name:var(--font-mono)] text-xl font-semibold text-black">{order.number}</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card title="Produkty">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-neutral-100">
                {lines.map((l) => (
                  <tr key={`${l.productId}-${l.variantId}`}>
                    <td className="py-2">
                      <Link href={`/admin/produkty/${l.productId}`} className="hover:underline">
                        {l.name}
                      </Link>
                      {l.variantLabel && <span className="text-neutral-500"> ({l.variantLabel})</span>}
                    </td>
                    <td className="py-2 text-center">{l.qty} szt.</td>
                    <td className="py-2 text-right font-[family-name:var(--font-mono)]">{formatPrice(l.unitPrice * l.qty)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 text-neutral-600">Dostawa: {order.shipping?.label}</td>
                  <td />
                  <td className="py-2 text-right font-[family-name:var(--font-mono)]">{formatPrice(order.shipping?.price || 0)}</td>
                </tr>
                <tr className="font-semibold">
                  <td className="py-2">Razem</td>
                  <td />
                  <td className="py-2 text-right font-[family-name:var(--font-mono)]">{formatPrice(order.total)}</td>
                </tr>
              </tbody>
            </table>
          </Card>

          <Card title="Akcje">
            <OrderActions order={{ id: order.id, status: order.status, adminNote: order.adminNote || "" }} transitions={ADMIN_TRANSITIONS[order.status] || []} />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Klient">
            <p className="font-semibold">{order.customer?.name}</p>
            <p>
              <a href={`mailto:${order.customer?.email}`} className="text-[#5f8f22] hover:underline">
                {order.customer?.email}
              </a>
            </p>
            {order.customer?.phone && (
              <p>
                <a href={`tel:${order.customer.phone}`} className="hover:underline">
                  {order.customer.phone}
                </a>
              </p>
            )}
          </Card>

          <Card title="Dostawa">
            <p className="font-semibold">{order.shipping?.label}</p>
            {order.delivery?.lockerCode && <p className="font-[family-name:var(--font-mono)]">{order.delivery.lockerCode}</p>}
            {order.delivery?.street && (
              <p>
                {order.delivery.street}
                <br />
                {order.delivery.postalCode} {order.delivery.city}
              </p>
            )}
            {order.trackingNumber && <p className="mt-2">Nr przesyłki: {order.trackingNumber}</p>}
          </Card>

          <Card title="Płatność">
            <p>{order.paymentMethod === "cash" ? "Gotówka przy odbiorze" : "Przelewy24"}</p>
            {order.p24OrderId && <p className="text-neutral-500">ID transakcji P24: {order.p24OrderId}</p>}
            {order.paymentErrorReason && <p className="text-red-600">{order.paymentErrorReason}</p>}
          </Card>

          <Card title="Historia">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-neutral-500">Złożone</dt>
              <dd>{formatDate(order.createdAt)}</dd>
              {order.paidAt && (
                <>
                  <dt className="text-neutral-500">Opłacone</dt>
                  <dd>{formatDate(order.paidAt)}</dd>
                </>
              )}
              {order.shippedAt && (
                <>
                  <dt className="text-neutral-500">Wysłane</dt>
                  <dd>{formatDate(order.shippedAt)}</dd>
                </>
              )}
              {order.completedAt && (
                <>
                  <dt className="text-neutral-500">Zrealizowane</dt>
                  <dd>{formatDate(order.completedAt)}</dd>
                </>
              )}
              {order.cancelReason && (
                <>
                  <dt className="text-neutral-500">Anulowane</dt>
                  <dd>{order.cancelReason}</dd>
                </>
              )}
            </dl>
          </Card>

          {order.notes && (
            <Card title="Uwagi klienta">
              <p className="whitespace-pre-wrap">{order.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 text-sm">
      <h2 className="mb-3 font-[family-name:var(--font-display)] text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h2>
      {children}
    </section>
  );
}
