"use client";

import { useActionState, useState } from "react";
import { setOrderStatusAction, saveAdminNoteAction } from "../actions";
import { statusLabel } from "@/lib/order-status";

const BUTTON_LABELS = {
  shipped: "Oznacz jako wysłane",
  completed: "Oznacz jako zrealizowane",
  cancelled: "Anuluj zamówienie",
  paid: "Oznacz jako opłacone",
};

const CONFIRM = {
  cancelled: "Anulować zamówienie? Towar wróci na stan. Jeśli klient zapłacił online, zwrot pieniędzy zrób w panelu Przelewy24.",
  paid: "Oznaczyć jako opłacone? Zrób to tylko, jeśli płatność widnieje w panelu Przelewy24.",
};

export default function OrderActions({ order, transitions }) {
  const [statusState, statusAction, statusPending] = useActionState(setOrderStatusAction, null);
  const [noteState, noteAction, notePending] = useActionState(saveAdminNoteAction, null);
  const [tracking, setTracking] = useState("");

  return (
    <div className="flex flex-col gap-5">
      {transitions.length === 0 ? (
        <p className="text-neutral-500">Status „{statusLabel(order.status)}” jest końcowy.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {transitions.includes("shipped") && (
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="Numer przesyłki (opcjonalnie - trafi do maila dla klienta)"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          )}
          <div className="flex flex-wrap gap-2">
            {transitions.map((status) => (
              <form
                key={status}
                action={statusAction}
                onSubmit={(e) => {
                  if (CONFIRM[status] && !window.confirm(CONFIRM[status])) e.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value={status} />
                {status === "shipped" && <input type="hidden" name="trackingNumber" value={tracking} />}
                <button
                  type="submit"
                  disabled={statusPending}
                  className={`rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wide transition disabled:opacity-50 ${
                    status === "cancelled"
                      ? "border border-red-300 text-red-700 hover:bg-red-50"
                      : "bg-[#8DC63F] text-white hover:bg-[#7ab332]"
                  }`}
                >
                  {BUTTON_LABELS[status] || status}
                </button>
              </form>
            ))}
          </div>
          {statusState?.error && <p className="text-sm text-red-600">{statusState.error}</p>}
        </div>
      )}

      <form action={noteAction} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={order.id} />
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500" htmlFor="adminNote">
          Notatka wewnętrzna
        </label>
        <textarea id="adminNote" name="adminNote" rows={3} defaultValue={order.adminNote} className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={notePending}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:border-black disabled:opacity-50"
          >
            Zapisz notatkę
          </button>
          {noteState?.saved && <span className="text-xs text-neutral-500">Zapisano</span>}
          {noteState?.error && <span className="text-xs text-red-600">{noteState.error}</span>}
        </div>
      </form>
    </div>
  );
}
