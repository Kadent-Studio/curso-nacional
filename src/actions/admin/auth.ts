"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/src/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().email("Email no válido"),
  password: z.string().min(1, "Contraseña requerida"),
  next: z.string().optional(),
});

function safeNext(value: string | undefined): string {
  if (!value) return "/admin";
  if (!value.startsWith("/") || value.startsWith("//")) return "/admin";
  return value;
}

export type LoginState = { ok: false; error: string } | { ok: true } | undefined;

export async function signInAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  try {
    const user = await signIn(parsed.data.email, parsed.data.password);
    if (!user) return { ok: false, error: "Credenciales no válidas." };
  } catch {
    return { ok: false, error: "No pudimos iniciar sesión. Intenta de nuevo." };
  }
  redirect(safeNext(parsed.data.next));
}

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect("/admin/login");
}
