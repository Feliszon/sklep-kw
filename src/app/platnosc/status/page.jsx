import { Suspense } from "react";
import PaymentStatus from "@/components/PaymentStatus";

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<main className="px-4 py-28 text-center text-neutral-600">Ładowanie…</main>}>
      <PaymentStatus />
    </Suspense>
  );
}
