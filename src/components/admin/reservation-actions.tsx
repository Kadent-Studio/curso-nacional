"use client";

import { useActionState } from "react";
import {
  confirmReservationAction,
  rejectReservationAction,
  cancelReservationAction,
  extendReservationAction,
  type ActionState,
} from "@/src/actions/admin/reservations";
import { Spinner } from "@/src/components/admin/skeleton";

type Props = {
  reservationId: string;
  status:
    | "PENDING_PAYMENT"
    | "PAYMENT_REVIEW"
    | "CONFIRMED"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED";
  isAdmin: boolean;
};

const initial: ActionState = undefined;

function StateMsg({ state }: { state: ActionState }) {
  if (!state) return null;
  if (!state.ok) {
    return <p className="toast-in border border-brand-deep bg-brand/10 px-3 py-2 text-xs text-ink">{state.error}</p>;
  }
  return <p className="toast-in border border-ink bg-paper-deep px-3 py-2 text-xs text-ink">{state.message ?? "Listo."}</p>;
}

export function ReservationActions({ reservationId, status, isAdmin }: Props) {
  const canClose = status === "PENDING_PAYMENT" || status === "PAYMENT_REVIEW";
  const canConfirm = canClose;
  const canExtend = isAdmin && (status === "PENDING_PAYMENT" || status === "EXPIRED");

  const [confirmState, confirmAct, confirmP] = useActionState(confirmReservationAction, initial);
  const [rejectState, rejectAct, rejectP] = useActionState(rejectReservationAction, initial);
  const [cancelState, cancelAct, cancelP] = useActionState(cancelReservationAction, initial);
  const [extState, extAct, extP] = useActionState(extendReservationAction, initial);

  return (
    <div className="space-y-6">
      {canConfirm && (
        <form action={confirmAct} className="space-y-3 border border-ink bg-paper p-5">
          <input type="hidden" name="reservationId" value={reservationId} />
          <p className="eyebrow">Confirmar pago</p>
          <label>
            <span className="label-text">Nota interna (opcional)</span>
            <textarea name="internalNote" rows={2} maxLength={500} />
          </label>
          <StateMsg state={confirmState} />
          <button type="submit" disabled={confirmP} className="btn-primary w-full justify-center">
            {confirmP ? <><Spinner size={14} /> Confirmando…</> : <>Confirmar inscripción →</>}
          </button>
        </form>
      )}

      {canClose && (
        <form action={rejectAct} className="space-y-3 border border-ink/40 bg-paper p-5">
          <input type="hidden" name="reservationId" value={reservationId} />
          <p className="eyebrow">Rechazar pago</p>
          <label>
            <span className="label-text">Motivo (opcional)</span>
            <textarea name="internalNote" rows={2} maxLength={500} placeholder="Ej: comprobante no coincide con el monto." />
          </label>
          <StateMsg state={rejectState} />
          <button type="submit" disabled={rejectP} className="btn-ghost w-full justify-center">
            {rejectP ? <><Spinner size={14} /> Rechazando…</> : "Rechazar"}
          </button>
        </form>
      )}

      {(status === "PENDING_PAYMENT" || status === "PAYMENT_REVIEW") && (
        <form action={cancelAct} className="space-y-3 border border-ink/40 bg-paper p-5">
          <input type="hidden" name="reservationId" value={reservationId} />
          <p className="eyebrow">Cancelar inscripción</p>
          <label>
            <span className="label-text">Motivo (opcional)</span>
            <textarea name="internalNote" rows={2} maxLength={500} />
          </label>
          <StateMsg state={cancelState} />
          <button type="submit" disabled={cancelP} className="btn-ghost w-full justify-center">
            {cancelP ? <><Spinner size={14} /> Cancelando…</> : "Cancelar"}
          </button>
        </form>
      )}

      {canExtend && (
        <form action={extAct} className="space-y-3 border border-ink/40 bg-paper p-5">
          <input type="hidden" name="reservationId" value={reservationId} />
          <p className="eyebrow">Extender plazo</p>
          <label>
            <span className="label-text">Minutos adicionales</span>
            <input type="number" name="minutes" min={1} max={10080} defaultValue={60} required />
          </label>
          <StateMsg state={extState} />
          <button type="submit" disabled={extP} className="btn-ghost w-full justify-center">
            {extP ? <><Spinner size={14} /> Aplicando…</> : "Extender"}
          </button>
          <p className="text-[0.7rem] text-mute">Solo administradores. Reactiva inscripciones expiradas.</p>
        </form>
      )}

      {!canClose && !canExtend && (
        <p className="border border-dashed border-ink/30 bg-paper p-5 text-sm text-mute">
          No hay acciones disponibles para este estado.
        </p>
      )}
    </div>
  );
}
