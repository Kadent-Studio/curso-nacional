import Link from "next/link";
import { Logo } from "@/src/components/logo";
import { formatDate, formatDaysUntil, formatUsd } from "@/src/lib/format";

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

function CardPlaceholder({ event }: { event: EventCardData }) {
  // Variantes deterministas según slug para que la grilla no sea monótona
  const variants = ["mustard", "ink", "cream"] as const;
  const hash = Array.from(event.slug).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const variant = variants[hash % variants.length];

  const palette = {
    mustard: {
      bg: "bg-brand",
      text: "text-ink",
      sub: "text-ink/70",
      vignette:
        "bg-[radial-gradient(ellipse_at_25%_15%,rgba(255,255,255,0.28),transparent_55%),radial-gradient(ellipse_at_75%_85%,rgba(11,11,11,0.18),transparent_55%)]",
    },
    ink: {
      bg: "bg-ink",
      text: "text-paper",
      sub: "text-paper/70",
      vignette:
        "bg-[radial-gradient(ellipse_at_30%_20%,rgba(210,160,43,0.30),transparent_55%),radial-gradient(ellipse_at_80%_85%,rgba(255,255,255,0.08),transparent_55%)]",
    },
    cream: {
      bg: "bg-paper-deep",
      text: "text-ink",
      sub: "text-ink/70",
      vignette:
        "bg-[radial-gradient(ellipse_at_25%_20%,rgba(210,160,43,0.30),transparent_55%),radial-gradient(ellipse_at_75%_85%,rgba(11,11,11,0.12),transparent_55%)]",
    },
  }[variant];

  return (
    <div className={`relative h-full w-full overflow-hidden ${palette.bg}`} aria-hidden="true">
      <div className={`absolute inset-0 ${palette.vignette}`} />
      {/* diagonal stripes texture */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 14px)",
          color: variant === "ink" ? "#fff" : "#000",
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <div className={`flex items-center justify-between text-[0.6rem] font-bold uppercase tracking-[0.3em] ${palette.sub}`}>
          <span>{TYPE_LABEL[event.type]}</span>
          <span>{MODALITY_LABEL[event.modality]}</span>
        </div>
        <div className="flex items-end justify-between gap-3">
          {variant === "ink" ? (
            <Logo size="md" />
          ) : (
            <div className={`font-display text-3xl font-extrabold tracking-tight ${palette.text}`}>
              CN
            </div>
          )}
          <span className={`font-flourish text-base italic ${palette.sub}`}>
            Curso Nacional
          </span>
        </div>
      </div>
    </div>
  );
}

export function EventCard({ event, index = 0 }: { event: EventCardData; index?: number }) {
  const rotate = index % 2 === 0 ? "md:-rotate-[0.35deg]" : "md:rotate-[0.25deg]";
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className={`ticket block p-6 md:p-7 ${rotate}`}
    >
      <div className="-mx-6 -mt-6 mb-6 aspect-[16/10] overflow-hidden border-b border-ink md:-mx-7 md:-mt-7">
        {event.imagePath ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={event.imagePath}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-[400ms] ease-[var(--ease-out-strong)]"
            loading="lazy"
          />
        ) : (
          <CardPlaceholder event={event} />
        )}
      </div>
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
          {event.nextDate && (
            <p className="mt-1 inline-block border border-ink/30 bg-paper-deep px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ink">
              {formatDaysUntil(event.nextDate)}
            </p>
          )}
          {event.location && (
            <p className="mt-1 text-xs text-mute">{event.location}</p>
          )}
        </div>
        <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-brand">Inscribirme →</span>
      </div>
    </Link>
  );
}
