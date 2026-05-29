import Link from "next/link";
import { Logo } from "@/src/components/logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-[1280px] px-6 py-14 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Logo size="lg" variant="paper" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/70">
              Una escuela para gente que se cansó de esperar el futuro.
              Cursos por WhatsApp, talleres en sala, guías y una serie de
              economía explicada con los pies en la tierra.
            </p>
            <p className="font-flourish italic mt-5 text-2xl text-gold-soft">«Mi futuro es hoy.»</p>
          </div>
          <div>
            <p className="eyebrow !text-paper/60 mb-3">Aprende</p>
            <ul className="space-y-2 text-sm text-paper/80">
              <li><Link href="/eventos" className="editorial-link">Cursos por WhatsApp</Link></li>
              <li><Link href="/eventos" className="editorial-link">Talleres presenciales</Link></li>
              <li><Link href="/#serie" className="editorial-link">Serie de economía</Link></li>
              <li><Link href="/#guias" className="editorial-link">Guías impresas</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow !text-paper/60 mb-3">Inscripciones</p>
            <ul className="space-y-2 text-sm text-paper/80">
              <li><Link href="/eventos" className="editorial-link">Próximos cursos</Link></li>
              <li><Link href="/reservas" className="editorial-link">Estado de mi inscripción</Link></li>
              <li><Link href="/#faq" className="editorial-link">Preguntas frecuentes</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow !text-paper/60 mb-3">Sígueme</p>
            <ul className="space-y-2 text-sm text-paper/80">
              <li>Instagram · @cursonacional</li>
              <li>TikTok · @cursonacional</li>
              <li>YouTube · Curso Nacional</li>
              <li>WhatsApp · +58 414-000-0000</li>
            </ul>
          </div>
        </div>
        <hr className="my-10 border-paper/15" />
        <div className="flex flex-col gap-3 text-xs text-paper/55 md:flex-row md:items-center md:justify-between">
          <p>© {year} Curso Nacional. Todos los derechos reservados.</p>
          <p>Hecho en Caracas, dictado para toda Latinoamérica.</p>
        </div>
      </div>
    </footer>
  );
}
