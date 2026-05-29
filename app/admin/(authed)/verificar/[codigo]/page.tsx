import Link from "next/link";
import { notFound } from "next/navigation";

import { getReservationByCode } from "@/src/lib/public-data";
import { getCurrentUser } from "@/src/lib/auth";
import { formatDateTime } from "@/src/lib/format";
import { CheckInButton } from "@/src/components/check-in-button";

export const dynamic = "force-dynamic";

type Params = Promise<{ codigo: string }>;

const STATUS_LABEL = {
  PENDING_PAYMENT: "Esperando pago",
  PAYMENT_REVIEW: "En revisión",
  CONFIRMED: "Confirmada",
  REJECTED: "Rechazada",
  EXPIRED: "Expirada",
  CANCELLED: "Cancelada",
} as const;

export default async function VerifyPage({ params }: { params: Params }) {
  const { codigo } = await params;
  const admin = await getCurrentUser();
  const reservation = await getReservationByCode(decodeURIComponent(codigo));
  if (!reservation) notFound();
  const totalQty = reservation.items.reduce((acc, it) => acc + it.quantity, 0);
  const isConfirmed = reservation.status === "CONFIRMED";
  const remaining = Math.max(0, totalQty - reservation.checkInsCount);
  const fullyUsed = reservation.checkInsCount >= totalQty;
  const occurrence = reservation.items[0]?.occurrence;

  const valid = isConfirmed && !fullyUsed;

  return (
    <div className="border-b border-ink/10 py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-6 md:px-10">
        <span className="program-tag">Verificación de boleto</span>
        <h1 className="font-display mt-2 text-5xl font-extrabold leading-[1]">
          {reservation.code}
        </h1>
        <p className="mt-2 text-ink-soft">{reservation.event.title}</p>

        <div
          className={`mt-8 border-2 p-6 ${
            valid
              ? "border-brand bg-brand/10"
              : isConfirmed && fullyUsed
                ? "border-ink bg-paper-edge"
                : "border-oxblood/60 bg-oxblood/10"
          }`}
        >
          <p className="eyebrow mb-2">Estado</p>
          <p className="font-display text-3xl font-bold">
            {valid
              ? "BOLETO VÁLIDO"
              : isConfirmed && fullyUsed
                ? "YA UTILIZADO"
                : STATUS_LABEL[reservation.status].toUpperCase()}
          </p>
          {isConfirmed && (
            <p className="mt-3 text-sm text-ink-soft">
              Usado <strong>{reservation.checkInsCount}</strong> de{" "}
              <strong>{totalQty}</strong>
              {reservation.lastCheckInAt && (
                <> · último ingreso {formatDateTime(reservation.lastCheckInAt)}</>
              )}
            </p>
          )}
        </div>

        <dl className="mt-8 space-y-4 text-sm">
          <div className="flex justify-between border-b border-ink/10 pb-2">
            <dt className="text-mute uppercase tracking-[0.18em] text-xs">Asistente</dt>
            <dd className="text-ink">
              {reservation.buyerFirstName} {reservation.buyerLastName}
            </dd>
          </div>
          {occurrence && (
            <div className="flex justify-between border-b border-ink/10 pb-2">
              <dt className="text-mute uppercase tracking-[0.18em] text-xs">Fecha</dt>
              <dd className="text-ink text-right">{formatDateTime(occurrence.startsAt)}</dd>
            </div>
          )}
          {reservation.event.location && (
            <div className="flex justify-between border-b border-ink/10 pb-2">
              <dt className="text-mute uppercase tracking-[0.18em] text-xs">Lugar</dt>
              <dd className="text-ink text-right">{reservation.event.location}</dd>
            </div>
          )}
          <div className="flex justify-between border-b border-ink/10 pb-2">
            <dt className="text-mute uppercase tracking-[0.18em] text-xs">Cupos</dt>
            <dd className="text-ink">{totalQty}</dd>
          </div>
        </dl>

        {isConfirmed && !fullyUsed && (
          <div className="mt-8 border border-ink bg-paper p-5">
            <p className="eyebrow mb-2">Acción de control</p>
            <p className="text-sm text-ink-soft">
              Quedan <strong>{remaining}</strong> ingreso{remaining === 1 ? "" : "s"} por marcar.
            </p>
            <div className="mt-3">
              <CheckInButton reservationId={reservation.id} />
            </div>
          </div>
        )}

        {admin && (
          <p className="mt-8 text-xs text-mute">
            Conectado como <strong>{admin.name}</strong> ({admin.email}).
          </p>
        )}

        <Link
          href="/admin/reservas"
          className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-mute hover:text-ink"
        >
          ← Ir al panel de inscripciones
        </Link>
      </div>
    </div>
  );
}
