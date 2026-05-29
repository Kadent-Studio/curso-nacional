"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/db";
import { requireRole } from "@/src/lib/auth";
import { storeUpload } from "@/src/lib/uploads";

export type EventActionState =
  | { ok: false; error: string }
  | { ok: true; message?: string; id?: string }
  | undefined;

function fail(err: unknown): { ok: false; error: string } {
  if (err instanceof Error) {
    if (err.message === "UNAUTHENTICATED") return { ok: false, error: "Sesión expirada." };
    if (err.message === "FORBIDDEN") return { ok: false, error: "Solo administradores." };
  }
  return { ok: false, error: "No se pudo completar la acción." };
}

const eventSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]+$/i, "Slug solo letras, números y guiones").min(2).max(80),
  title: z.string().trim().min(2).max(180),
  summary: z.string().trim().min(2).max(400),
  description: z.string().trim().min(2).max(4000),
  type: z.enum(["COURSE", "THEATER"]),
  modality: z.enum(["IN_PERSON", "ONLINE", "HYBRID"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  reservationTtlMin: z.coerce.number().int().min(5).max(60 * 24 * 30),
  featured: z.coerce.boolean().optional().default(false),
  imagePath: z.string().trim().max(400).optional().or(z.literal("")),
});

export async function createEventAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  try {
    await requireRole("ADMIN");
    const raw = Object.fromEntries(formData.entries());
    const featured = formData.get("featured") === "on" || formData.get("featured") === "true";
    const parsed = eventSchema.safeParse({ ...raw, featured });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos no válidos." };

    const exists = await prisma.event.findUnique({ where: { slug: parsed.data.slug.toLowerCase() } });
    if (exists) return { ok: false, error: "Ya existe un curso con ese slug." };

    const created = await prisma.event.create({
      data: {
        slug: parsed.data.slug.toLowerCase(),
        title: parsed.data.title,
        summary: parsed.data.summary,
        description: parsed.data.description,
        type: parsed.data.type,
        modality: parsed.data.modality,
        status: parsed.data.status,
        location: parsed.data.location || null,
        reservationTtlMin: parsed.data.reservationTtlMin,
        featured: parsed.data.featured,
        imagePath: parsed.data.imagePath || null,
      },
    });
    revalidatePath("/admin/eventos");
    redirect(`/admin/eventos/${created.id}`);
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
    return fail(err);
  }
}

export async function updateEventAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  try {
    await requireRole("ADMIN");
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "ID requerido." };
    const featured = formData.get("featured") === "on" || formData.get("featured") === "true";
    const parsed = eventSchema.safeParse({ ...Object.fromEntries(formData.entries()), featured });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos no válidos." };

    const clash = await prisma.event.findFirst({
      where: { slug: parsed.data.slug.toLowerCase(), NOT: { id } },
      select: { id: true },
    });
    if (clash) return { ok: false, error: "Ese slug ya está en uso por otro curso." };

    await prisma.event.update({
      where: { id },
      data: {
        slug: parsed.data.slug.toLowerCase(),
        title: parsed.data.title,
        summary: parsed.data.summary,
        description: parsed.data.description,
        type: parsed.data.type,
        modality: parsed.data.modality,
        status: parsed.data.status,
        location: parsed.data.location || null,
        reservationTtlMin: parsed.data.reservationTtlMin,
        featured: parsed.data.featured,
        imagePath: parsed.data.imagePath || null,
      },
    });
    revalidatePath("/admin/eventos");
    revalidatePath(`/admin/eventos/${id}`);
    return { ok: true, message: "Cambios guardados.", id };
  } catch (err) {
    return fail(err);
  }
}

const occurrenceSchema = z.object({
  eventId: z.string().min(1),
  startsAt: z.string().min(1),
  capacity: z.coerce.number().int().min(1).max(10000),
});

export async function addOccurrenceAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  try {
    await requireRole("ADMIN");
    const parsed = occurrenceSchema.safeParse({
      eventId: formData.get("eventId"),
      startsAt: formData.get("startsAt"),
      capacity: formData.get("capacity"),
    });
    if (!parsed.success) return { ok: false, error: "Datos no válidos." };
    await prisma.eventOccurrence.create({
      data: {
        eventId: parsed.data.eventId,
        startsAt: new Date(parsed.data.startsAt),
        capacity: parsed.data.capacity,
      },
    });
    revalidatePath(`/admin/eventos/${parsed.data.eventId}`);
    return { ok: true, message: "Fecha añadida." };
  } catch (err) {
    return fail(err);
  }
}

export async function removeOccurrenceAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  try {
    await requireRole("ADMIN");
    const id = String(formData.get("occurrenceId") ?? "");
    if (!id) return { ok: false, error: "ID requerido." };
    const inUse = await prisma.reservationItem.count({ where: { occurrenceId: id } });
    if (inUse > 0) return { ok: false, error: "No se puede eliminar: ya tiene inscripciones." };
    const occ = await prisma.eventOccurrence.delete({ where: { id } });
    revalidatePath(`/admin/eventos/${occ.eventId}`);
    return { ok: true, message: "Fecha eliminada." };
  } catch (err) {
    return fail(err);
  }
}

const variantSchema = z.object({
  eventId: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  priceUsd: z.coerce.number().min(0).max(100000),
  sortOrder: z.coerce.number().int().min(0).max(1000).optional().default(0),
});

export async function addVariantAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  try {
    await requireRole("ADMIN");
    const parsed = variantSchema.safeParse({
      eventId: formData.get("eventId"),
      name: formData.get("name"),
      priceUsd: formData.get("priceUsd"),
      sortOrder: formData.get("sortOrder") ?? 0,
    });
    if (!parsed.success) return { ok: false, error: "Datos no válidos." };
    await prisma.priceVariant.create({
      data: {
        eventId: parsed.data.eventId,
        name: parsed.data.name,
        priceUsd: new Prisma.Decimal(parsed.data.priceUsd),
        sortOrder: parsed.data.sortOrder,
      },
    });
    revalidatePath(`/admin/eventos/${parsed.data.eventId}`);
    return { ok: true, message: "Tarifa añadida." };
  } catch (err) {
    return fail(err);
  }
}

export async function removeVariantAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  try {
    await requireRole("ADMIN");
    const id = String(formData.get("variantId") ?? "");
    if (!id) return { ok: false, error: "ID requerido." };
    const inUse = await prisma.reservationItem.count({ where: { priceVariantId: id } });
    if (inUse > 0) return { ok: false, error: "No se puede eliminar: ya tiene inscripciones." };
    const v = await prisma.priceVariant.delete({ where: { id } });
    revalidatePath(`/admin/eventos/${v.eventId}`);
    return { ok: true, message: "Tarifa eliminada." };
  } catch (err) {
    return fail(err);
  }
}

export async function uploadEventImageAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  try {
    await requireRole("ADMIN");
    const eventId = String(formData.get("eventId") ?? "");
    if (!eventId) return { ok: false, error: "ID requerido." };
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Selecciona una imagen (jpg, png, webp)." };
    }
    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
    if (!event) return { ok: false, error: "Curso no encontrado." };

    const stored = await storeUpload({ kind: "EVENT_IMAGE", file });
    await prisma.event.update({ where: { id: eventId }, data: { imagePath: stored.path } });

    revalidatePath("/admin/eventos");
    revalidatePath(`/admin/eventos/${eventId}`);
    revalidatePath("/eventos");
    revalidatePath("/");
    return { ok: true, message: "Imagen subida." };
  } catch (err) {
    if (err instanceof Error && err.message) {
      if (err.message === "FORBIDDEN") return { ok: false, error: "Solo administradores." };
      if (
        err.message === "Formato no permitido" ||
        err.message === "El archivo supera 8 MB" ||
        err.message === "Archivo vacío"
      ) {
        return { ok: false, error: err.message };
      }
    }
    return fail(err);
  }
}

export async function removeEventImageAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  try {
    await requireRole("ADMIN");
    const eventId = String(formData.get("eventId") ?? "");
    if (!eventId) return { ok: false, error: "ID requerido." };
    await prisma.event.update({ where: { id: eventId }, data: { imagePath: null } });
    revalidatePath("/admin/eventos");
    revalidatePath(`/admin/eventos/${eventId}`);
    revalidatePath("/eventos");
    revalidatePath("/");
    return { ok: true, message: "Imagen quitada." };
  } catch (err) {
    return fail(err);
  }
}

export async function archiveEventAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  try {
    await requireRole("ADMIN");
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "ID requerido." };
    await prisma.event.update({ where: { id }, data: { status: "ARCHIVED" } });
    revalidatePath("/admin/eventos");
    revalidatePath(`/admin/eventos/${id}`);
    return { ok: true, message: "Curso archivado." };
  } catch (err) {
    return fail(err);
  }
}
