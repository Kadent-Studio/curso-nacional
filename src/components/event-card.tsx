import Link from "next/link";
import { formatDate, formatUsd } from "@/src/lib/format";

export type EventCardData = {
  slug: string;
  title: string;
  summary: string;
  type: "COURSE" | "THEATER";
  modality: "IN_PERSON" | "ONLINE" | "HYBRID";
  location?: string | null;
  imagePath?: string | null;
  nextDate?: Date | null;
  fromPriceUsd?: number | null;
};

const TYPE_LABEL: Record<EventCardData["type"], string> = {
  COURSE: "Curso",
  THEATER: "Taller presencial",
};

const MODALITY_LABEL: Record<EventCardData["modality"], string> = {
  IN_PERSON: "Presencial",
  ONLINE: "Por WhatsApp",
  HYBRID: "Híbrido",
};

export function EventCard({ event, index = 0 }: { event: EventCardData; index?: number }) {
  const rotate = index % 2 === 0 ? "md:-rotate-[0.35deg]" : "md:rotate-[0.25deg]";
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className={`ticket block p-6 md:p-7 ${rotate}`}
    >
      {event.imagePath && (
        <div className="-mx-6 -mt-6 mb-6 aspect-[16/10] overflow-hidden border-b border-ink md:-mx-7 md:-mt-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.imagePath}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-[400ms] ease-[var(--ease-out-strong)]"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex items-center justify-between text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-mute">
        <span>{TYPE_LABEL[event.type]} · {MODALITY_LABEL[event.modality]}</span>
        <span className="text-brand">
          {event.fromPriceUsd != null ? `desde ${formatUsd(event.fromPriceUsd)}` : ""}
        </span>
      </div>
      <h3 className="font-display mt-4 text-[1.75rem] leading-[1.05] text-ink md:text-[2rem]">
        {event.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft line-clamp-3">
        {event.summary}
      </p>
      <hr className="rule-thin my-5" />
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Próxima fecha</p>
          <p className="mt-1 font-display text-lg text-ink">
            {event.nextDate ? formatDate(event.nextDate) : "Por anunciar"}
          </p>
          {event.location && (
            <p className="mt-1 text-xs text-mute">{event.location}</p>
          )}
        </div>
        <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-brand">Inscribirme →</span>
      </div>
    </Link>
  );
}
