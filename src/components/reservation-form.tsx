"use client";

import { useActionState, useMemo, useState } from "react";
import {
  createReservationAction,
  type CreateReservationState,
} from "@/src/actions/reservations";

type Occurrence = {
  id: string;
  startsAt: string;
  capacity: number;
};

type PriceVariant = {
  id: string;
  name: string;
  priceUsd: number;
};

type Props = {
  eventId: string;
  occurrences: Occurrence[];
  priceVariants: PriceVariant[];
  exchangeRate: number | null;
};

const initialState: CreateReservationState | undefined = undefined;

export function ReservationForm({ eventId, occurrences, priceVariants, exchangeRate }: Props) {
  const [state, formAction, pending] = useActionState(createReservationAction, initialState);

  const [variantId, setVariantId] = useState(priceVariants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState<"BS" | "USDT">("USDT");

  const variant = useMemo(
    () => priceVariants.find((v) => v.id === variantId),
    [priceVariants, variantId],
  );
  const totalUsd = (variant?.priceUsd ?? 0) * quantity;
  const totalBs = exchangeRate ? totalUsd * exchangeRate : null;

  if (occurrences.length === 0 || priceVariants.length === 0) {
    return (
      <div className="border border-dashed border-ink/30 bg-paper p-6 text-sm text-mute">
        Aún no hay fechas o tarifas disponibles para este curso.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 border border-ink bg-paper p-6 md:p-7 shadow-[8px_8px_0_var(--ink)]">
      <div>
        <span className="program-tag">Inscripción</span>
        <h3 className="font-display mt-1 text-3xl leading-tight">Toma tu cupo en dos pasos</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Déjanos tus datos, recibes un código y pagas dentro del plazo.
          Subes el comprobante y confirmamos por WhatsApp.
        </p>
      </div>

      <input type="hidden" name="eventId" value={eventId} />

      <label>
        <span className="label-text">Fecha</span>
        <select name="occurrenceId" defaultValue={occurrences[0]?.id} required>
          {occurrences.map((o) => (
            <option key={o.id} value={o.id}>
              {new Date(o.startsAt).toLocaleString("es-VE", {
                weekday: "short",
                day: "2-digit",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <label>
          <span className="label-text">Tarifa</span>
          <select
            name="priceVariantId"
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            required
          >
            {priceVariants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — ${v.priceUsd.toFixed(2)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label-text">Cant.</span>
          <input
            type="number"
            name="quantity"
            min={1}
            max={20}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-24"
            required
          />
        </label>
      </div>

      <fieldset>
        <span className="label-text">Método de pago</span>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {(["USDT", "BS"] as const).map((m) => (
            <label
              key={m}
              className={`cursor-pointer border px-3 py-3 text-sm transition ${
                method === m ? "border-ink bg-ink text-paper" : "border-ink/40 bg-paper text-ink hover:border-ink"
              }`}
            >
              <input
                type="radio"
                name="paymentMethodKind"
                value={m}
                checked={method === m}
                onChange={() => setMethod(m)}
                className="sr-only"
              />
              <span className="block text-[0.65rem] font-bold uppercase tracking-[0.22em] opacity-70">
                {m === "USDT" ? "Cripto" : "Bolívares"}
              </span>
              <span className="font-display mt-1 block text-xl font-bold">{m}</span>
            </label>
          ))}
        </div>
        {method === "BS" && exchangeRate == null && (
          <p className="mt-2 text-xs text-brand">
            Aún no hay tasa Bs./USD configurada. Elige USDT o escríbenos.
          </p>
        )}
      </fieldset>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label>
          <span className="label-text">Nombre</span>
          <input type="text" name="firstName" required maxLength={80} />
        </label>
        <label>
          <span className="label-text">Apellido</span>
          <input type="text" name="lastName" required maxLength={80} />
        </label>
      </div>

      <label>
        <span className="label-text">WhatsApp</span>
        <input
          type="tel"
          name="whatsapp"
          placeholder="+58 414 000 0000"
          required
          maxLength={30}
        />
      </label>

      <label>
        <span className="label-text">Nota (opcional)</span>
        <textarea name="note" rows={2} maxLength={500} />
      </label>

      <div className="border-t border-ink/15 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Total</span>
          <span className="font-display text-3xl font-extrabold text-ink">
            ${totalUsd.toFixed(2)}
            <span className="ml-2 text-sm font-medium text-mute">USD</span>
          </span>
        </div>
        {method === "BS" && totalBs != null && (
          <p className="mt-1 text-right text-sm text-ink-soft">
            ≈ Bs. {totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} a la tasa actual
          </p>
        )}
      </div>

      {state && !state.ok && (
        <p className="border border-brand bg-brand/10 px-3 py-2 text-sm text-brand-deep">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full justify-center" disabled={pending}>
        {pending ? "Reservando…" : "Confirmar inscripción"}
        <span aria-hidden>→</span>
      </button>

      <p className="text-[0.72rem] leading-relaxed text-mute">
        La inscripción queda <em>pendiente</em> hasta validar el pago.
        Si no subes el comprobante a tiempo, expira y libera el cupo.
      </p>
    </form>
  );
}
