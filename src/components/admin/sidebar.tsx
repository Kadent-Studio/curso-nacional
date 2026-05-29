"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useFormStatus } from "react-dom";
import { Logo } from "@/src/components/logo";
import { Spinner } from "@/src/components/admin/skeleton";
import { signOutAction } from "@/src/actions/admin/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/reservas", label: "Inscripciones" },
  { href: "/admin/eventos", label: "Cursos" },
  { href: "/admin/configuracion", label: "Configuración", adminOnly: true },
];

function NavLinkPending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Spinner size={12} className="text-current opacity-70" />;
}

function NavLink({
  href,
  label,
  active,
  layoutId,
}: {
  href: string;
  label: string;
  active: boolean;
  layoutId: string;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={`relative flex items-center justify-between rounded-sm px-3 py-2 text-sm font-medium tracking-tight transition-colors ${
        active ? "text-paper" : "text-ink-soft hover:text-ink"
      }`}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 -z-0 rounded-sm bg-ink"
          transition={{ type: "spring", duration: 0.4, bounce: 0.18 }}
        />
      )}
      <span className="relative z-10">{label}</span>
      <span className="relative z-10">
        <NavLinkPending />
      </span>
    </Link>
  );
}

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 border border-ink px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-60"
    >
      {pending && <Spinner size={12} />}
      {pending ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}

export function AdminSidebar({
  name,
  role,
  instanceId = "desktop",
}: {
  name: string;
  role: "ADMIN" | "OPERATOR";
  instanceId?: string;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const items = NAV.filter((i) => !i.adminOnly || role === "ADMIN");
  const layoutId = `admin-nav-active-${instanceId}`;

  // If reduced motion, render simpler version without layoutId pill animation
  if (reduce) {
    return (
      <aside className="flex h-dvh w-[260px] shrink-0 flex-col border-r border-ink/15 bg-paper-deep">
        <div className="border-b border-ink/15 px-6 py-5">
          <Link href="/admin" className="block"><Logo size="md" /></Link>
          <p className="eyebrow mt-3">Panel · {role === "ADMIN" ? "Admin" : "Operador"}</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-sm px-3 py-2 text-sm font-medium ${
                      active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <SidebarFooter name={name} />
      </aside>
    );
  }

  return (
    <aside className="flex h-dvh w-[260px] shrink-0 flex-col border-r border-ink/15 bg-paper-deep">
      <div className="border-b border-ink/15 px-6 py-5">
        <Link href="/admin" className="block"><Logo size="md" /></Link>
        <p className="eyebrow mt-3">Panel · {role === "ADMIN" ? "Admin" : "Operador"}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((item, i) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, transform: "translateX(-6px)" }}
                animate={{ opacity: 1, transform: "translateX(0px)" }}
                transition={{ delay: i * 0.04, duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
              >
                <NavLink href={item.href} label={item.label} active={active} layoutId={layoutId} />
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <SidebarFooter name={name} />
    </aside>
  );
}

function SidebarFooter({ name }: { name: string }) {
  return (
    <div className="border-t border-ink/15 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mute">Sesión</p>
      <p className="font-display mt-1 text-base text-ink">{name}</p>
      <form action={signOutAction} className="mt-3">
        <LogoutButton />
      </form>
      <Link
        href="/"
        className="mt-2 block text-center text-xs uppercase tracking-[0.2em] text-mute hover:text-ink"
      >
        Ver sitio público →
      </Link>
    </div>
  );
}
