"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser, requireRole } from "@/src/lib/auth";
import {
  confirmReservation,
  rejectReservation,
  cancelReservation,
  extendExpiration,
  checkInReservation,
} from "@/src/lib/reservations";

const idNote = z.object({
  reservationId: z.string().min(1),
  internalNote: z.string().trim().max(500).optional(),
});

export type ActionState = { ok: false; error: string } | { ok: true; message?: string } | undefined;

function fail(err: unknown): { ok: false; error: string } {
  if (err instanceof Error) {
    if (err.message === "UNAUTHENTICATED") return { ok: false, error: "Sesión expirada." };
    if (err.message === "FORBIDDEN") return { ok: false, error: "Acción solo para administradores." };
    if (err.message === "RESERVATION_NOT_FOUND") return { ok: false, error: "Inscripción no encontrada." };
    if (err.message === "RESERVATION_NOT_CONFIRMED") return { ok: false, error: "El boleto no está confirmado." };
    if (err.message === "TICKET_FULLY_USED") return { ok: false, error: "Este boleto ya se utilizó por completo." };
  }
  return { ok: false, error: "No se pudo completar la acción." };
}

export async function confirmReservationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireUser();
    const parsed = idNote.safeParse({
      reservationId: formData.get("reservationId"),
      internalNote: formData.get("internalNote") || undefined,
    });
    if (!parsed.success) return { ok: false, error: "Datos no válidos." };
    await confirmReservation(parsed.data.reservationId, parsed.data.internalNote);
    revalidatePath("/admin");
    revalidatePath("/admin/reservas");
    revalidatePath(`/admin/reservas/${parsed.data.reservationId}`);
    return { ok: true, message: "Inscripción confirmada." };
  } catch (err) {
    return fail(err);
  }
}

export async function rejectReservationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireUser();
    const parsed = idNote.safeParse({
      reservationId: formData.get("reservationId"),
      internalNote: formData.get("internalNote") || undefined,
    });
    if (!parsed.success) return { ok: false, error: "Datos no válidos." };
    await rejectReservation(parsed.data.reservationId, parsed.data.internalNote);
    revalidatePath("/admin");
    revalidatePath("/admin/reservas");
    revalidatePath(`/admin/reservas/${parsed.data.reservationId}`);
    return { ok: true, message: "Inscripción rechazada." };
  } catch (err) {
    return fail(err);
  }
}

export async function cancelReservationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireUser();
    const parsed = idNote.safeParse({
      reservationId: formData.get("reservationId"),
      internalNote: formData.get("internalNote") || undefined,
    });
    if (!parsed.success) return { ok: false, error: "Datos no válidos." };
    await cancelReservation(parsed.data.reservationId, parsed.data.internalNote);
    revalidatePath("/admin");
    revalidatePath("/admin/reservas");
    revalidatePath(`/admin/reservas/${parsed.data.reservationId}`);
    return { ok: true, message: "Inscripción cancelada." };
  } catch (err) {
    return fail(err);
  }
}

const checkInSchema = z.object({
  reservationId: z.string().min(1),
});

export async function checkInReservationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireUser();
    const parsed = checkInSchema.safeParse({
      reservationId: formData.get("reservationId"),
    });
    if (!parsed.success) return { ok: false, error: "Datos no válidos." };
    await checkInReservation(parsed.data.reservationId);
    revalidatePath(`/admin/verificar/${parsed.data.reservationId}`);
    revalidatePath("/admin/reservas");
    revalidatePath(`/admin/reservas/${parsed.data.reservationId}`);
    return { ok: true, message: "Entrada registrada." };
  } catch (err) {
    return fail(err);
  }
}

const extendSchema = z.object({
  reservationId: z.string().min(1),
  minutes: z.coerce.number().int().min(1).max(60 * 24 * 7),
});

export async function extendReservationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const parsed = extendSchema.safeParse({
      reservationId: formData.get("reservationId"),
      minutes: formData.get("minutes"),
    });
    if (!parsed.success) return { ok: false, error: "Minutos no válidos." };
    await extendExpiration(parsed.data.reservationId, parsed.data.minutes);
    revalidatePath("/admin/reservas");
    revalidatePath(`/admin/reservas/${parsed.data.reservationId}`);
    return { ok: true, message: `Plazo extendido ${parsed.data.minutes} min.` };
  } catch (err) {
    return fail(err);
  }
}
