import Link from "next/link";
import { Logo } from "@/src/components/logo";

const NAV = [
  { href: "/eventos", label: "Cursos" },
  { href: "/#serie", label: "La serie" },
  { href: "/#documental", label: "Documental" },
  { href: "/#sobre", label: "Quién" },
  { href: "/#faq", label: "Preguntas" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-ink/15 bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/75 sticky top-0 z-30">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Logo size="md" />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="editorial-link text-[0.74rem] uppercase tracking-[0.2em] font-semibold text-ink-soft hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/reservas"
            className="hidden text-[0.7rem] uppercase tracking-[0.22em] font-semibold text-mute hover:text-ink md:inline"
          >
            Mi inscripción
          </Link>
          <Link href="/eventos" className="btn-primary">
            Inscribirme
          </Link>
        </div>
      </div>
    </header>
  );
}
