"use client";

import { useActionState } from "react";
import { signInAction, type LoginState } from "@/src/actions/admin/auth";
import { Spinner } from "@/src/components/admin/skeleton";

const initial: LoginState = undefined;

export function LoginForm() {
  const [state, action, pending] = useActionState(signInAction, initial);
  return (
    <form action={action} className="space-y-5">
      <label>
        <span className="label-text">Email</span>
        <input type="email" name="email" required autoComplete="email" autoFocus />
      </label>
      <label>
        <span className="label-text">Contraseña</span>
        <input type="password" name="password" required autoComplete="current-password" />
      </label>
      {state && "error" in state && (
        <p className="toast-in border border-brand-deep bg-brand/15 px-3 py-2 text-sm text-ink">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
        {pending ? <><Spinner size={14} /> Entrando…</> : (<>Entrar al panel <span aria-hidden>→</span></>)}
      </button>
    </form>
  );
}
