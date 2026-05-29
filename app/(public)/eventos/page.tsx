import Link from "next/link";
import { getUpcomingEvents } from "@/src/lib/public-data";
import { EventCard } from "@/src/components/event-card";
import { SectionHeading } from "@/src/components/section-heading";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cursos y talleres — Curso Nacional",
  description: "Próximos cursos por WhatsApp y talleres presenciales en Caracas. Inscripción con cupo limitado.",
};

export default async function EventosPage() {
  const events = await getUpcomingEvents(50);
  const presenciales = events.filter((e) => e.modality === "IN_PERSON");
  const online = events.filter((e) => e.modality !== "IN_PERSON");

  return (
    <div>
      <section className="border-b border-ink/10 pb-16 pt-2 md:pb-24 md:pt-4">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <SectionHeading
            number="—"
            eyebrow="Programa"
            title="Próximos cursos y talleres."
            intro="Cohortes pequeñas, cupos limitados. La inscripción queda pendiente hasta validar el pago."
          />
        </div>
      </section>

      {events.length === 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-[1080px] px-6 text-center md:px-10">
            <p className="font-display text-3xl">Aún no hay programación cargada.</p>
            <p className="mt-3 text-sm text-mute">
              Configura la base de datos y corre el seed para ver cursos aquí.
            </p>
          </div>
        </section>
      )}

      {presenciales.length > 0 && (
        <Group title="Presenciales · Caracas" subtitle="Te lo dictamos en sala. Cohorte y devolución directa." events={presenciales} />
      )}

      {online.length > 0 && (
        <Group title="Online · por WhatsApp" subtitle="Grupo privado, entregas diarias y materiales descargables." events={online} />
      )}

      <section className="border-t border-ink/10 bg-paper-deep py-14">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center gap-4 px-6 text-center md:px-10">
          <p className="font-display text-2xl text-ink">
            ¿Tienes el código de una inscripción?
          </p>
          <p className="text-sm text-mute">Consulta su estado y sube el comprobante de pago.</p>
          <Link href="/reservas" className="btn-ghost">Ver mi inscripción</Link>
        </div>
      </section>
    </div>
  );
}

function Group({ title, subtitle, events }: { title: string; subtitle: string; events: Awaited<ReturnType<typeof getUpcomingEvents>> }) {
  return (
    <section className="border-b border-ink/10 py-16 md:py-20">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl leading-none text-ink md:text-5xl">
              {title}
            </h2>
            <p className="mt-2 text-sm text-mute">{subtitle}</p>
          </div>
          <span className="font-display text-base font-bold uppercase tracking-[0.18em] text-brand">
            {events.length} {events.length === 1 ? "curso" : "cursos"}
          </span>
        </div>
        <hr className="rule-thin my-8" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e, i) => <EventCard key={e.slug} event={e} index={i} />)}
        </div>
      </div>
    </section>
  );
}
