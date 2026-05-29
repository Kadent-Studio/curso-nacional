"use client";

import { useActionState } from "react";

import {
  checkInReservationAction,
  type ActionState,
} from "@/src/actions/admin/reservations";
import { Spinner } from "@/src/components/admin/skeleton";

const initial: ActionState = undefined;

export function CheckInButton({ reservationId }: { reservationId: string }) {
  const [state, action, pending] = useActionState(checkInReservationAction, initial);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="reservationId" value={reservationId} />
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full justify-center"
      >
        {pending ? (
          <>
            <Spinner size={14} /> Marcando…
          </>
        ) : (
          "Marcar entrada (+1)"
        )}
      </button>
      {state && !state.ok && (
        <p className="border border-oxblood/60 bg-oxblood/10 px-3 py-2 text-xs text-ink">
          {state.error}
        </p>
      )}
      {state && state.ok && (
        <p className="border border-ink bg-paper-deep px-3 py-2 text-xs text-ink">
          {state.message ?? "Listo."}
        </p>
      )}
    </form>
  );
}
