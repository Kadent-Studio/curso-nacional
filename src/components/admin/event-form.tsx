"use client";

import { useActionState } from "react";
import {
  createEventAction,
  updateEventAction,
  type EventActionState,
} from "@/src/actions/admin/events";
import { Spinner } from "@/src/components/admin/skeleton";

type EventInput = {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  type: "COURSE" | "THEATER";
  modality: "IN_PERSON" | "ONLINE" | "HYBRID";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  location: string;
  reservationTtlMin: number;
  featured: boolean;
  imagePath: string;
};

const initial: EventActionState = undefined;

export function EventForm({ event, mode }: { event: EventInput; mode: "create" | "edit" }) {
  const [state, action, pending] = useActionState(
    mode === "create" ? createEventAction : updateEventAction,
    initial,
  );

  return (
    <form action={action} className="space-y-5">
      {event.id && <input type="hidden" name="id" value={event.id} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="label-text">Título</span>
          <input type="text" name="title" defaultValue={event.title} required maxLength={180} />
        </label>
        <label>
          <span className="label-text">Slug</span>
          <input type="text" name="slug" defaultValue={event.slug} required pattern="[a-z0-9-]+" maxLength={80} />
        </label>
        <label>
          <span className="label-text">Estado</span>
          <select name="status" defaultValue={event.status}>
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Archivado</option>
          </select>
        </label>
        <label>
          <span className="label-text">Tipo</span>
          <select name="type" defaultValue={event.type}>
            <option value="COURSE">Curso</option>
            <option value="THEATER">Taller presencial</option>
          </select>
        </label>
        <label>
          <span className="label-text">Modalidad</span>
          <select name="modality" defaultValue={event.modality}>
            <option value="IN_PERSON">Presencial</option>
            <option value="ONLINE">Online (WhatsApp)</option>
            <option value="HYBRID">Híbrido</option>
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="label-text">Resumen</span>
          <textarea name="summary" rows={2} defaultValue={event.summary} required maxLength={400} />
        </label>
        <label className="md:col-span-2">
          <span className="label-text">Descripción</span>
          <textarea name="description" rows={6} defaultValue={event.description} required maxLength={4000} />
        </label>
        <label>
          <span className="label-text">Ubicación</span>
          <input type="text" name="location" defaultValue={event.location} maxLength={200} />
        </label>
        <label>
          <span className="label-text">Vencimiento de inscripción (min)</span>
          <input type="number" name="reservationTtlMin" defaultValue={event.reservationTtlMin} min={5} max={43200} required />
        </label>
        <input type="hidden" name="imagePath" value={event.imagePath} />
        <label className="flex items-center gap-2 md:col-span-2">
          <input type="checkbox" name="featured" defaultChecked={event.featured} className="h-4 w-4 accent-[var(--brand)] w-auto" />
          <span className="text-sm text-ink">Destacar en landing</span>
        </label>
      </div>

      {state && !state.ok && (
        <p className="toast-in border border-brand-deep bg-brand/15 px-3 py-2 text-sm text-ink">{state.error}</p>
      )}
      {state?.ok && state.message && (
        <p className="toast-in border border-ink bg-paper-deep px-3 py-2 text-sm text-ink">{state.message}</p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
        {pending ? <><Spinner size={14} /> Guardando…</> : (<>{mode === "create" ? "Crear curso" : "Guardar cambios"} →</>)}
      </button>
    </form>
  );
}
