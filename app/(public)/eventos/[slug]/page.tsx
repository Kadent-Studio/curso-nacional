import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { getEventBySlug, getCurrentExchangeRate, getActivePaymentMethods } from "@/src/lib/public-data";
import { ReservationForm } from "@/src/components/reservation-form";
import { formatDateTime, formatDaysUntil, formatUsd } from "@/src/lib/format";

type Params = Promise<{ slug: string }>;

const TYPE_LABEL = { COURSE: "Curso", THEATER: "Taller presencial" } as const;
const MODALITY_LABEL = { IN_PERSON: "Presencial · Caracas", ONLINE: "Por WhatsApp", HYBRID: "Híbrido" } as const;

export default async function EventDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [event, rateRow, paymentMethods] = await Promise.all([
    getEventBySlug(slug),
    getCurrentExchangeRate(),
    getActivePaymentMethods(),
  ]);

  if (!event || event.status !== "PUBLISHED") {
    notFound();
  }

  const exchangeRate = rateRow ? Number(rateRow.bsPerUsd) : null;

  return (
    <article>
      <section className="border-b border-ink/10 py-14 md:py-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-mute">
            <Link href="/eventos" className="editorial-link">Programa</Link>
            <span>·</span>
            <span>{TYPE_LABEL[event.type]}</span>
            <span>·</span>
            <span>{MODALITY_LABEL[event.modality]}</span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <h1 className="font-display text-[2.6rem] leading-[0.98] text-ink md:text-[5rem]">
                {event.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
                {event.summary}
              </p>
            </div>
            {event.imagePath && (
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-ink bg-paper-deep shadow-[10px_10px_0_var(--ink)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={event.imagePath} alt={event.title} className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 py-12 md:py-16">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-6 md:grid-cols-[1.3fr_1fr] md:px-10">
          <div>
            <span className="program-tag">Sobre el curso</span>
            <div className="dropcap mt-5 max-w-2xl text-base leading-relaxed text-ink-soft whitespace-pre-line">
              {event.description}
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 border-t border-ink/15 pt-8 md:grid-cols-2">
              <div>
                <p className="eyebrow mb-2">Próximas fechas</p>
                <ul className="space-y-2 font-display text-lg">
                  {event.occurrences.length === 0 && (
                    <li className="text-mute">Por anunciar</li>
                  )}
                  {event.occurrences.map((o) => (
                    <li key={o.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span>{formatDateTime(o.startsAt)}</span>
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-deep">
                        {formatDaysUntil(o.startsAt)}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mute">
                        {o.available === 0
                          ? "agotada"
                          : `${o.available} ${o.available === 1 ? "cupo" : "cupos"}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-2">Tarifas</p>
                <ul className="space-y-2 font-display text-lg">
                  {event.priceVariants.map((v) => (
                    <li key={v.id} className="flex items-baseline justify-between gap-4">
                      <span>{v.name}</span>
                      <span className="text-brand">{formatUsd(Number(v.priceUsd))}</span>
                    </li>
                  ))}
                </ul>
                {exchangeRate && (
                  <p className="mt-3 text-xs text-mute">
                    Tasa Bs./USD actual: {exchangeRate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>

            {event.location && (
              <div className="mt-10">
                <p className="eyebrow mb-2">Lugar</p>
                <p className="font-display text-xl text-ink">{event.location}</p>
              </div>
            )}

            <div className="mt-12 border-t border-ink/15 pt-8">
              <p className="eyebrow mb-3">Métodos de pago aceptados</p>
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {paymentMethods.map((p) => (
                  <li key={p.id} className="border border-ink/20 bg-paper-deep p-4">
                    <p className="font-display text-lg">{p.label}</p>
                    <p className="mt-1 text-xs text-mute whitespace-pre-line">{p.instructions}</p>
                  </li>
                ))}
                {paymentMethods.length === 0 && (
                  <li className="text-sm text-mute">Configura los métodos de pago desde el admin.</li>
                )}
              </ul>
            </div>
          </div>

          <aside className="md:sticky md:top-28 md:self-start">
            <ReservationForm
              eventId={event.id}
              occurrences={event.occurrences.map((o) => ({
                id: o.id,
                startsAt: o.startsAt.toISOString(),
                capacity: o.capacity,
                available: o.available,
              }))}
              priceVariants={event.priceVariants.map((v) => ({
                id: v.id,
                name: v.name,
                priceUsd: Number(v.priceUsd),
              }))}
              exchangeRate={exchangeRate}
            />
          </aside>
        </div>
      </section>
    </article>
  );
}
