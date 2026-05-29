"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkBotId } from 'botid/server';
import { z } from "zod";
import { createReservation, attachReceipt } from "@/src/lib/reservations";
import { storeUpload } from "@/src/lib/uploads";
import { prisma } from "@/src/lib/db";

const phoneRegex = /^[+\d][\d\s-]{6,}$/;

const createSchema = z.object({
  eventId: z.string().min(1),
  occurrenceId: z.string().min(1),
  priceVariantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(10),
  paymentMethodKind: z.enum(["BS", "USDT"]),
  firstName: z.string().trim().min(1, "Nombre requerido").max(80),
  lastName: z.string().trim().min(1, "Apellido requerido").max(80),
  whatsapp: z
    .string()
    .trim()
    .min(7, "WhatsApp requerido")
    .max(30)
    .regex(phoneRegex, "Formato de WhatsApp no válido"),
  note: z.string().trim().max(500).optional(),
});

export type CreateReservationState =
  | { ok: false; error: string }
  | { ok: true };

const ERROR_MESSAGES: Record<string, string> = {
  EVENT_NOT_FOUND: "El evento ya no está disponible.",
  EVENT_NOT_AVAILABLE: "El evento no está abierto a reservas.",
  OCCURRENCE_NOT_FOUND: "La fecha seleccionada ya no existe.",
  OCCURRENCE_NOT_AVAILABLE: "La fecha seleccionada no está disponible.",
  PRICE_VARIANT_NOT_AVAILABLE: "La tarifa seleccionada no está disponible.",
  INVALID_QUANTITY: "Cantidad no válida.",
  OVERBOOKING_BLOCKED: "Ya no quedan cupos suficientes para esa fecha.",
  NO_ACTIVE_EXCHANGE_RATE:
    "No hay una tasa Bs./USD configurada. Intenta con USDT o avísanos por WhatsApp.",
  RESERVATION_NOT_FOUND: "No encontramos esa reserva.",
  RESERVATION_EXPIRED: "La reserva ya expiró. Vuelve a iniciar el proceso.",
  RESERVATION_CLOSED: "La reserva ya no está activa.",
};

function translateError(err: unknown): string {
  if (err instanceof Error && err.message in ERROR_MESSAGES) {
    return ERROR_MESSAGES[err.message];
  }
  return "Algo salió mal. Intenta de nuevo en unos minutos.";
}

export async function createReservationAction(
  _prevState: CreateReservationState | undefined,
  formData: FormData,
): Promise<CreateReservationState> {
  const botCheck = await checkBotId();

  if (botCheck.isBot) {
    return { ok: false, error: "No se pudo procesar tu reserva. Intenta de nuevo." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Datos no válidos." };
  }

  let code: string;
  try {
    const reservation = await createReservation({
      eventId: parsed.data.eventId,
      occurrenceId: parsed.data.occurrenceId,
      priceVariantId: parsed.data.priceVariantId,
      quantity: parsed.data.quantity,
      paymentMethodKind: parsed.data.paymentMethodKind,
      buyer: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        whatsapp: parsed.data.whatsapp,
        note: parsed.data.note,
      },
    });
    code = reservation.code;
  } catch (err) {
    return { ok: false, error: translateError(err) };
  }

  redirect(`/reservas/${code}?nuevo=1`);
}

const receiptSchema = z.object({
  reservationId: z.string().min(1),
});

export type UploadReceiptState =
  | { ok: false; error: string }
  | { ok: true };

export async function uploadReceiptAction(
  _prevState: UploadReceiptState | undefined,
  formData: FormData,
): Promise<UploadReceiptState> {
  const botCheck = await checkBotId();

  if (botCheck.isBot) {
    return { ok: false, error: "No se pudo procesar tu reserva. Intenta de nuevo." };
  }

  const parsed = receiptSchema.safeParse({
    reservationId: formData.get("reservationId"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Datos no válidos." };
  }

  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Adjunta un comprobante (jpg, png, webp o pdf)." };
  }

  let stored;
  try {
    stored = await storeUpload({ kind: "RECEIPT", file });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "No se pudo subir el archivo." };
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: parsed.data.reservationId },
    });
    if (!reservation) return { ok: false, error: ERROR_MESSAGES.RESERVATION_NOT_FOUND };

    await attachReceipt(reservation.id, stored.path);
    revalidatePath(`/reservas/${reservation.code}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: translateError(err) };
  }
}
