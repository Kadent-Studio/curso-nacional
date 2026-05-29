"use client";

import { useActionState, useRef, useState } from "react";
import {
  uploadEventImageAction,
  removeEventImageAction,
  type EventActionState,
} from "@/src/actions/admin/events";
import { Spinner } from "@/src/components/admin/skeleton";

const initial: EventActionState = undefined;

export function EventImageUploader({
  eventId,
  currentPath,
}: {
  eventId: string;
  currentPath: string | null;
}) {
  const [uploadState, uploadAction, uploading] = useActionState(uploadEventImageAction, initial);
  const [rmState, rmAction, removing] = useActionState(removeEventImageAction, initial);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setLocalPreview(null);
      return;
    }
    setLocalPreview(URL.createObjectURL(f));
  }

  const showState = uploadState ?? rmState;
  const previewSrc = localPreview ?? currentPath;

  return (
    <div className="space-y-4 border border-ink/15 bg-paper p-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Imagen del curso</p>
        {currentPath && !uploading && !removing && (
          <form action={rmAction}>
            <input type="hidden" name="eventId" value={eventId} />
            <button
              type="submit"
              className="text-xs font-bold uppercase tracking-[0.18em] text-mute hover:text-brand-deep"
            >
              Quitar
            </button>
          </form>
        )}
      </div>

      {previewSrc ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden border border-ink/20 bg-paper-deep">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewSrc} alt="Vista previa" className="h-full w-full object-cover" />
          {localPreview && (
            <span className="absolute right-2 top-2 stamp bg-paper text-[0.6rem]">Sin guardar</span>
          )}
        </div>
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center border border-dashed border-ink/25 bg-paper-deep text-xs text-mute">
          Sin imagen
        </div>
      )}

      <form action={uploadAction} className="space-y-3">
        <input type="hidden" name="eventId" value={eventId} />
        <input
          ref={fileInputRef}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={onPickFile}
          className="block w-full cursor-pointer border border-ink/40 bg-paper-deep px-3 py-3 text-sm file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-2 file:text-paper hover:file:bg-brand-deep"
        />
        <p className="text-[0.7rem] text-mute">jpg, png o webp · máx. 8 MB · proporción recomendada 4:5 o 16:10</p>

        {showState && !showState.ok && (
          <p className="toast-in border border-brand-deep bg-brand/15 px-3 py-2 text-xs text-ink">
            {showState.error}
          </p>
        )}
        {showState?.ok && showState.message && (
          <p className="toast-in border border-ink bg-paper-deep px-3 py-2 text-xs text-ink">
            {showState.message}
          </p>
        )}

        <button type="submit" disabled={uploading} className="btn-primary w-full justify-center">
          {uploading ? <><Spinner size={14} /> Subiendo…</> : <>Subir imagen →</>}
        </button>
      </form>
    </div>
  );
}
