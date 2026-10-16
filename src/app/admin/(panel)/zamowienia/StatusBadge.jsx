import { ORDER_STATUS, statusLabel } from "@/lib/order-status";

const TONES = {
  neutral: "bg-neutral-100 text-neutral-700",
  action: "bg-[#8DC63F]/20 text-[#3f6314]",
  done: "bg-sky-100 text-sky-800",
  muted: "bg-neutral-100 text-neutral-400",
  error: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  const tone = TONES[ORDER_STATUS[status]?.tone] || TONES.neutral;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {statusLabel(status)}
    </span>
  );
}
