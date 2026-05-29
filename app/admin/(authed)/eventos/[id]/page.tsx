import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, requireUser } from "@/src/lib/auth";
import { getEventAdmin } from "@/src/lib/admin-data";
import { prisma } from "@/src/lib/db";
import { EventForm } from "@/src/components/admin/event-form";
import { OccurrenceManager } from "@/src/components/admin/occurrence-manager";
import { VariantManager } from "@/src/components/admin/variant-manager";
import { EventImageUploader } from "@/src/components/admin/event-image-uploader";
import { archiveEventAction } from "@/src/actions/admin/events";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

const EMPTY_EVENT = {
  slug: "",
  title: "",
  summary: "",
  description: "",
  type: "COURSE" as const,
  modality: "ONLINE" as const,
  status: "DRAFT" as const,
  location: "",
  reservationTtlMin: 60 * 24,
  featured: false,
  imagePath: "",
};

export default async function EventEditPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await requireUser();

  if (id === "nuevo") {
    await requireRole("ADMIN");
    return (
      <div>
        <Link href="/admin/eventos" className="text-xs uppercase tracking-[0.2em] text-mute hover:text-ink">
          ← Volver a cursos
        </Link>
        <header className="mt-4">
          <span className="program-tag">Nuevo</span>
          <h1 className="font-display mt-1 text-4xl leading-[1] md:text-5xl">Crear curso</h1>
        </header>
        <div className="mt-8 border border-ink/15 bg-paper p-6 md:p-8">
          <EventForm event={EMPTY_EVENT} mode="create" />
        </div>
      </div>
    );
  }

  const event = await getEventAdmin(id);
  if (!event) notFound();

  // count reservation items per occurrence + variant
  const [occUsage, variantUsage] = await Promise.all([
    prisma.reservationItem.groupBy({
      by: ["occurrenceId"],
      where: { occurrenceId: { in: event.occurrences.map((o) => o.id) } },
      _count: { _all: true },
    }),
    prisma.reservationItem.groupBy({
      by: ["priceVariantId"],
      where: { priceVariantId: { in: event.priceVariants.map((v) => v.id) } },
      _count: { _all: true },
    }),
  ]);
  const occUsed = new Set(occUsage.map((g) => g.occurrenceId));
  const varUsed = new Set(variantUsage.map((g) => g.priceVariantId));

  const isAdmin = user.role === "ADMIN";

  return (
    <div>
      <Link href="/admin/eventos" className="text-xs uppercase tracking-[0.2em] text-mute hover:text-ink">
        ← Volver a cursos
      </Link>
      <header className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="program-tag">Editar curso</span>
          <h1 className="font-display mt-1 text-4xl leading-[1] md:text-5xl">{event.title}</h1>
          <p className="mt-2 text-xs text-mute">/{event.slug} · {event.status}</p>
        </div>
        {isAdmin && event.status !== "ARCHIVED" && (
          <form
            action={async (formData: FormData) => {
              "use server";
              await archiveEventAction(undefined, formData);
            }}
          >
            <input type="hidden" name="id" value={event.id} />
            <button type="submit" className="btn-ghost">Archivar</button>
          </form>
        )}
      </header>

      <hr className="rule-thin my-10" />

      {!isAdmin && (
        <p className="mb-8 border-l-2 border-brand pl-3 text-sm text-ink-soft">
          Como operador puedes ver el curso pero no editarlo. Pide cambios al admin.
        </p>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="eyebrow mb-4">Datos del curso</h2>
          <div className={`border border-ink/15 bg-paper p-6 md:p-7 ${!isAdmin ? "pointer-events-none opacity-70" : ""}`}>
            <EventForm
              mode="edit"
              event={{
                id: event.id,
                slug: event.slug,
                title: event.title,
                summary: event.summary,
                description: event.description,
                type: event.type,
                modality: event.modality,
                status: event.status,
                location: event.location ?? "",
                reservationTtlMin: event.reservationTtlMin,
                featured: event.featured,
                imagePath: event.imagePath ?? "",
              }}
            />
          </div>
        </section>

        <aside className="space-y-10">
          {isAdmin && (
            <section>
              <h2 className="eyebrow mb-4">Imagen</h2>
              <EventImageUploader eventId={event.id} currentPath={event.imagePath} />
            </section>
          )}
          <section>
            <h2 className="eyebrow mb-4">Fechas</h2>
            <div className={!isAdmin ? "pointer-events-none opacity-70" : ""}>
              <OccurrenceManager
                eventId={event.id}
                occurrences={event.occurrences.map((o) => ({
                  id: o.id,
                  startsAt: o.startsAt.toISOString(),
                  capacity: o.capacity,
                  status: o.status,
                  hasReservations: occUsed.has(o.id),
                }))}
              />
            </div>
          </section>
          <section>
            <h2 className="eyebrow mb-4">Tarifas</h2>
            <div className={!isAdmin ? "pointer-events-none opacity-70" : ""}>
              <VariantManager
                eventId={event.id}
                variants={event.priceVariants.map((v) => ({
                  id: v.id,
                  name: v.name,
                  priceUsd: Number(v.priceUsd),
                  sortOrder: v.sortOrder,
                  active: v.active,
                  hasReservations: varUsed.has(v.id),
                }))}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
