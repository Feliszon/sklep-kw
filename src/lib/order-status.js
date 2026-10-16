// Statusy zamówień - współdzielone przez panel admina, stronę statusu i maile.
export const ORDER_STATUS = {
  awaiting_payment: { label: "Oczekuje na płatność", tone: "neutral" },
  paid: { label: "Opłacone - do realizacji", tone: "action" },
  cash_pending: { label: "Płatność przy odbiorze - do przygotowania", tone: "action" },
  shipped: { label: "Wysłane", tone: "done" },
  completed: { label: "Zrealizowane", tone: "done" },
  cancelled: { label: "Anulowane", tone: "muted" },
  payment_error: { label: "Błąd płatności - sprawdź w panelu P24", tone: "error" },
};

export function statusLabel(status) {
  return ORDER_STATUS[status]?.label || status;
}

// Przejścia dostępne w panelu admina.
export const ADMIN_TRANSITIONS = {
  awaiting_payment: ["cancelled"],
  paid: ["shipped", "completed", "cancelled"],
  cash_pending: ["completed", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
  payment_error: ["paid", "cancelled"],
};
