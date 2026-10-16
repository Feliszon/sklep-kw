import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";
import { statusLabel } from "@/lib/order-status";

// Publiczny status zamówienia dla strony powrotu z płatności.
// Identyfikator to losowy UUID; zwracamy tylko dane bez informacji osobowych.
export async function GET(_request, { params }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Nie znaleziono zamówienia." }, { status: 404 });
  }
  return NextResponse.json({
    number: order.number,
    status: order.status,
    statusLabel: statusLabel(order.status),
    paymentMethod: order.paymentMethod,
    total: order.total,
  });
}
