"use client";

import { useActionState } from "react";
import {
  setExchangeRateAction,
  updatePaymentMethodAction,
  type ConfigState,
} from "@/src/actions/admin/config";
import { Spinner } from "@/src/components/admin/skeleton";

const initial: ConfigState = undefined;

function Msg({ state }: { state: ConfigState }) {
  if (!state) return null;
  if (!state.ok) return <p className="toast-in border border-brand-deep bg-brand/15 px-3 py-2 text-sm text-ink">{state.error}</p>;
  return <p className="toast-in border border-ink bg-paper-deep px-3 py-2 text-sm text-ink">{state.message ?? "Listo."}</p>;
}

export function ExchangeRateForm({ current }: { current: number | null }) {
  const [state, action, pending] = useActionState(setExchangeRateAction, initial);
  return (
    <form action={action} className="space-y-4">
      <label>
        <span className="label-text">Bs. por USD</span>
        <input
          type="number"
          step="0.0001"
          min="0.0001"
          name="bsPerUsd"
          defaultValue={current ?? ""}
          required
        />
      </label>
      <p className="text-xs text-mute">
        Crea una nueva tasa activa y desactiva la anterior. Las inscripciones existentes
        conservan la tasa con la que fueron creadas.
      </p>
      <Msg state={state} />
      <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
        {pending ? <><Spinner size={14} /> Guardando…</> : <>Actualizar tasa →</>}
      </button>
    </form>
  );
}

type Method = {
  id: string;
  kind: "BS" | "USDT";
  label: string;
  instructions: string;
  active: boolean;
};

export function PaymentMethodForm({ method }: { method: Method }) {
  const [state, action, pending] = useActionState(updatePaymentMethodAction, initial);
  return (
    <form action={action} className="space-y-4 border border-ink/15 bg-paper p-5">
      <input type="hidden" name="id" value={method.id} />
      <div className="flex items-center justify-between">
        <p className="program-tag">{method.kind}</p>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" name="active" defaultChecked={method.active} className="h-4 w-4 accent-[var(--brand)] w-auto" />
          <span className="text-ink">Activo</span>
        </label>
      </div>
      <label>
        <span className="label-text">Etiqueta</span>
        <input type="text" name="label" defaultValue={method.label} required maxLength={120} />
      </label>
      <label>
        <span className="label-text">Instrucciones</span>
        <textarea name="instructions" rows={6} defaultValue={method.instructions} required maxLength={2000} />
      </label>
      <Msg state={state} />
      <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
        {pending ? <><Spinner size={14} /> Guardando…</> : <>Guardar →</>}
      </button>
    </form>
  );
}
