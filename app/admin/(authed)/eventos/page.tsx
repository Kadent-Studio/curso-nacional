import Link from "next/link";
import { requireUser } from "@/src/lib/auth";
import { listAdminEvents } from "@/src/lib/admin-data";

export const dynamic = "force-dynamic";

export const metadata = { title: "Cursos — Curso Nacional Admin" };

const STATUS_LABEL = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
} as const;

const TYPE_LABEL = { COURSE: "Curso", THEATER: "Taller" } as const;
const MODALITY_LABEL = { IN_PERSON: "Presencial", ONLINE: "WhatsApp", HYBRID: "Híbrido" } as const;

export default async function EventsListPage() {
  const user = await requireUser();
  const events = await listAdminEvents();
  const canCreate = user.role === "ADMIN";

  return (
    <div>
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="program-tag">Programa</span>
          <h1 className="font-display mt-1 text-4xl leading-[1] md:text-5xl">Cursos</h1>
        </div>
        {canCreate && (
          <Link href="/admin/eventos/nuevo" className="btn-primary">Crear curso →</Link>
        )}
      </header>

      <div className="mt-8 overflow-x-auto border border-ink/15 bg-paper">
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-[0.7rem] font-bold uppercase tracking-[0.18em] text-mute">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Modalidad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Fechas</th>
              <th className="px-4 py-3 text-right">Inscritos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {events.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-mute">Sin cursos cargados.</td></tr>
            )}
            {events.map((e, i) => (
              <tr
                key={e.id}
                className="row-reveal transition-colors hover:bg-paper-deep/40"
                style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}
              >
                <td className="px-4 py-3">
                  <Link href={`/admin/eventos/${e.id}`} className="font-display font-bold editorial-link">{e.title}</Link>
                  <p className="text-xs text-mute">/{e.slug}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{TYPE_LABEL[e.type]}</td>
                <td className="px-4 py-3 text-ink-soft">{MODALITY_LABEL[e.modality]}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-mute">
                    {STATUS_LABEL[e.status]}
                  </span>
                  {e.featured && <span className="ml-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-deep">★ Destacado</span>}
                </td>
                <td className="px-4 py-3 text-right text-ink-soft">{e._count.occurrences}</td>
                <td className="px-4 py-3 text-right font-display font-bold">{e._count.reservations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
