"use client";

import { useActionState } from "react";
import {
  uploadReceiptAction,
  type UploadReceiptState,
} from "@/src/actions/reservations";

const initial: UploadReceiptState | undefined = undefined;

export function ReceiptUpload({ reservationId, hasReceipt }: { reservationId: string; hasReceipt: boolean }) {
  const [state, action, pending] = useActionState(uploadReceiptAction, initial);

  return (
    <form action={action} className="space-y-3 border border-ink bg-paper p-5">
      <input type="hidden" name="reservationId" value={reservationId} />
      <div>
        <span className="label-text">Comprobante de pago</span>
        <input
          type="file"
          name="receipt"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
          className="block w-full cursor-pointer border border-ink/40 bg-paper-deep px-3 py-3 text-sm file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-2 file:text-paper hover:file:bg-oxblood"
        />
        <p className="mt-1 text-xs text-mute">jpg, png, webp o pdf · máx. 8 MB</p>
      </div>
      {state && !state.ok && (
        <p className="text-sm text-oxblood">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-sm text-ink">Comprobante recibido. Pasamos a revisar.</p>
      )}
      <button type="submit" className="btn-primary w-full justify-center" disabled={pending}>
        {pending ? "Subiendo…" : hasReceipt ? "Reemplazar comprobante" : "Subir comprobante"}
      </button>
    </form>
  );
}
