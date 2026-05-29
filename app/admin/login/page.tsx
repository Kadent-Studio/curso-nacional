import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth";
import { Logo } from "@/src/components/logo";
import { LoginForm } from "@/src/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Entrar — Curso Nacional Admin" };

function safeNext(value: string | undefined): string {
  if (!value) return "/admin";
  if (!value.startsWith("/") || value.startsWith("//")) return "/admin";
  return value;
}

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const { next } = (await searchParams) as { next?: string };
  const target = safeNext(next);
  const user = await getCurrentUser();
  if (user) redirect(target);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="block">
          <Logo size="lg" />
        </Link>
        <div className="mt-10">
          <span className="program-tag">Panel interno</span>
          <h1 className="font-display mt-2 text-4xl leading-[1] md:text-5xl">Entra a operar.</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Acceso solo para usuarios cargados desde el seed. Si olvidaste la
            contraseña, pídela a quien administra el demo.
          </p>
        </div>

        <div className="mt-10 border border-ink bg-paper p-6 md:p-7 shadow-[8px_8px_0_var(--ink)]">
          <LoginForm next={target} />
        </div>

        <Link
          href="/"
          className="mt-8 inline-block text-xs uppercase tracking-[0.2em] text-mute hover:text-ink"
        >
          ← Volver al sitio público
        </Link>
      </div>
    </div>
  );
}
