import { NextResponse } from "next/server";
import { getPaymentMethods, isP24Configured } from "@/lib/p24";

export async function GET(request) {
  if (!isP24Configured()) {
    return NextResponse.json({ error: "Płatności online są chwilowo niedostępne." }, { status: 503 });
  }
  const amount = Number(new URL(request.url).searchParams.get("amount"));
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Nieprawidłowa kwota." }, { status: 400 });
  }
  try {
    const methods = await getPaymentMethods({ amount: Math.round(amount * 100) });
    return NextResponse.json({ methods });
  } catch (err) {
    console.error(err.message);
    return NextResponse.json({ error: "Nie udało się pobrać metod płatności." }, { status: 502 });
  }
}
