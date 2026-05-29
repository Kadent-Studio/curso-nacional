"use client";

import { useActionState } from "react";
import {
  addVariantAction,
  removeVariantAction,
  type EventActionState,
} from "@/src/actions/admin/events";
import { Spinner } from "@/src/components/admin/skeleton";

type Variant = {
  id: string;
  name: string;
  priceUsd: number;
  sortOrder: number;
  active: boolean;
  hasReservations: boolean;
};

const initial: EventActionState = undefined;

export function VariantManager({ eventId, variants }: { eventId: string; variants: Variant[] }) {
  const [addState, addAction, addPending] = useActionState(addVariantAction, initial);
  const [rmState, rmAction, rmPending] = useActionState(removeVariantAction, initial);

  return (
    <div className="space-y-5">
      <ul className="divide-y divide-ink/10 border border-ink/15 bg-paper">
        {variants.length === 0 && (
          <li className="p-4 text-sm text-mute">Sin tarifas.</li>
        )}
        {variants.map((v) => (
          <li key={v.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <p className="font-display text-base">{v.name}</p>
              <p className="text-xs text-mute">
                ${v.priceUsd.toFixed(2)} · orden {v.sortOrder}{v.hasReservations ? " · con inscripciones" : ""}
              </p>
            </div>
            {!v.hasReservations && (
              <form action={rmAction}>
                <input type="hidden" name="variantId" value={v.id} />
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

      <form action={addAction} className="grid grid-cols-1 gap-3 border border-ink/15 bg-paper p-4 md:grid-cols-[1.5fr_120px_90px_auto]">
        <input type="hidden" name="eventId" value={eventId} />
        <label>
          <span className="label-text">Nombre</span>
          <input type="text" name="name" required maxLength={80} placeholder="General, Pronto-pago..." />
        </label>
        <label>
          <span className="label-text">Precio USD</span>
          <input type="number" name="priceUsd" min={0} step={0.01} required defaultValue={0} />
        </label>
        <label>
          <span className="label-text">Orden</span>
          <input type="number" name="sortOrder" min={0} max={999} defaultValue={1} />
        </label>
        <button type="submit" disabled={addPending} className="btn-ghost self-end">
          {addPending ? <><Spinner size={12} /> Añadiendo…</> : "Añadir tarifa"}
        </button>
        {addState && !addState.ok && (
          <p className="toast-in md:col-span-4 text-xs text-brand-deep">{addState.error}</p>
        )}
      </form>
    </div>
  );
}
