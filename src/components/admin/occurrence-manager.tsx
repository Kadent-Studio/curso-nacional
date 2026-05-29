"use client";

import { useActionState } from "react";
import {
  addOccurrenceAction,
  removeOccurrenceAction,
  type EventActionState,
} from "@/src/actions/admin/events";
import { Spinner } from "@/src/components/admin/skeleton";

type Occurrence = {
  id: string;
  startsAt: string;
  capacity: number;
  status: string;
  hasReservations: boolean;
};

const initial: EventActionState = undefined;

export function OccurrenceManager({ eventId, occurrences }: { eventId: string; occurrences: Occurrence[] }) {
  const [addState, addAction, addPending] = useActionState(addOccurrenceAction, initial);
  const [rmState, rmAction, rmPending] = useActionState(removeOccurrenceAction, initial);

  return (
    <div className="space-y-5">
      <ul className="divide-y divide-ink/10 border border-ink/15 bg-paper">
        {occurrences.length === 0 && (
          <li className="p-4 text-sm text-mute">Sin fechas. Añade una abajo.</li>
        )}
        {occurrences.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <p className="font-display text-base">
                {new Date(o.startsAt).toLocaleString("es-VE", {
                  weekday: "short",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-xs text-mute">
                {o.capacity} cupos · {o.status}{o.hasReservations ? " · con inscripciones" : ""}
              </p>
            </div>
            {!o.hasReservations && (
              <form action={rmAction}>
                <input type="hidden" name="occurrenceId" value={o.id} />
                <button type="submit" disabled={rmPending} className="text-xs font-bold uppercase tracking-[0.18em] text-mute hover:text-brand-deep">
                  Eliminar
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      {rmState && !rmState.ok && (
        <p className="toast-in text-xs text-brand-deep">{rmState.error}</p>
      )}

      <form action={addAction} className="grid grid-cols-1 gap-3 border border-ink/15 bg-paper p-4 md:grid-cols-[1fr_120px_auto]">
        <input type="hidden" name="eventId" value={eventId} />
        <label>
          <span className="label-text">Fecha y hora</span>
          <input type="datetime-local" name="startsAt" required />
        </label>
        <label>
          <span className="label-text">Cupos</span>
          <input type="number" name="capacity" min={1} max={10000} defaultValue={30} required />
        </label>
        <button type="submit" disabled={addPending} className="btn-ghost self-end">
          {addPending ? <><Spinner size={12} /> Añadiendo…</> : "Añadir fecha"}
        </button>
        {addState && !addState.ok && (
          <p className="toast-in md:col-span-3 text-xs text-brand-deep">{addState.error}</p>
        )}
      </form>
    </div>
  );
}
