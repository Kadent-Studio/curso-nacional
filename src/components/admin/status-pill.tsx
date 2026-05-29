import type { ReservationStatus } from "@prisma/client";

const LABEL: Record<ReservationStatus, string> = {
  PENDING_PAYMENT: "Esperando pago",
  PAYMENT_REVIEW: "En revisión",
  CONFIRMED: "Confirmada",
  REJECTED: "Rechazada",
  EXPIRED: "Expirada",
  CANCELLED: "Cancelada",
};

const TONE: Record<ReservationStatus, string> = {
  PENDING_PAYMENT: "bg-brand text-ink",
  PAYMENT_REVIEW: "bg-brand-deep text-paper",
  CONFIRMED: "bg-ink text-brand",
  REJECTED: "bg-ink/90 text-paper",
  EXPIRED: "bg-paper-edge text-ink-soft",
  CANCELLED: "bg-paper-edge text-ink-soft",
};

export function StatusPill({ status }: { status: ReservationStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] ${TONE[status]}`}>
      {LABEL[status]}
    </span>
  );
}
