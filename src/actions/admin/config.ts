"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/db";
import { requireRole } from "@/src/lib/auth";

export type ConfigState = { ok: false; error: string } | { ok: true; message?: string } | undefined;

function fail(err: unknown): { ok: false; error: string } {
  if (err instanceof Error && err.message === "FORBIDDEN") return { ok: false, error: "Solo administradores." };
  return { ok: false, error: "No se pudo guardar." };
}

const rateSchema = z.object({
  bsPerUsd: z.coerce.number().min(0.0001).max(1_000_000),
});

export async function setExchangeRateAction(
  _prev: ConfigState,
  formData: FormData,
): Promise<ConfigState> {
  try {
    await requireRole("ADMIN");
    const parsed = rateSchema.safeParse({ bsPerUsd: formData.get("bsPerUsd") });
    if (!parsed.success) return { ok: false, error: "Tasa no válida." };
    await prisma.$transaction([
      prisma.exchangeRate.updateMany({ where: { active: true }, data: { active: false } }),
      prisma.exchangeRate.create({
        data: { bsPerUsd: new Prisma.Decimal(parsed.data.bsPerUsd), active: true },
      }),
    ]);
    revalidatePath("/admin/configuracion");
    return { ok: true, message: "Tasa actualizada." };
  } catch (err) {
    return fail(err);
  }
}

const methodSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(2).max(120),
  instructions: z.string().trim().min(2).max(2000),
  active: z.coerce.boolean().optional().default(false),
});

export async function updatePaymentMethodAction(
  _prev: ConfigState,
  formData: FormData,
): Promise<ConfigState> {
  try {
    await requireRole("ADMIN");
    const active = formData.get("active") === "on" || formData.get("active") === "true";
    const parsed = methodSchema.safeParse({ ...Object.fromEntries(formData.entries()), active });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
    await prisma.paymentMethod.update({
      where: { id: parsed.data.id },
      data: {
        label: parsed.data.label,
        instructions: parsed.data.instructions,
        active: parsed.data.active,
      },
    });
    revalidatePath("/admin/configuracion");
    return { ok: true, message: "Método actualizado." };
  } catch (err) {
    return fail(err);
  }
}
