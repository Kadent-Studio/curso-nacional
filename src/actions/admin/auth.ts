"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/src/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().email("Email no válido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export type LoginState = { ok: false; error: string } | { ok: true } | undefined;

export async function signInAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
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
  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect("/admin/login");
}
