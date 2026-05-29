"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/src/components/logo";
import { AdminSidebar } from "@/src/components/admin/sidebar";

export function AdminShell({
  name,
  role,
  children,
}: {
  name: string;
  role: "ADMIN" | "OPERATOR";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex min-h-dvh bg-paper">
      <div className="hidden md:flex">
        <AdminSidebar name={name} role={role} instanceId="desktop" />
      </div>

      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out-strong)" }}
        onClick={() => setOpen(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navegación del panel"
        className="fixed inset-y-0 left-0 z-50 w-[260px] max-w-[85vw] md:hidden"
        style={{
          transform: open ? "translateX(0%)" : "translateX(-100%)",
          transition: "transform 320ms var(--ease-drawer)",
          willChange: "transform",
        }}
      >
        <AdminSidebar name={name} role={role} instanceId="mobile" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/15 bg-paper/85 px-4 py-3 backdrop-blur-md md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-sm border border-ink/20 text-ink transition-transform active:scale-[0.97]"
          >
            <MenuIcon />
          </button>
          <Link href="/admin" className="block">
            <Logo size="sm" />
          </Link>
          <span className="h-10 w-10" aria-hidden />
        </header>

        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
