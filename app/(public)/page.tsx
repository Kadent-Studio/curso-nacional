import Link from "next/link";
import { getUpcomingEvents } from "@/src/lib/public-data";
import { whatsappLink } from "@/src/lib/contact";
import { EventCard } from "@/src/components/event-card";
import { Marquee } from "@/src/components/marquee";
import { SectionHeading } from "@/src/components/section-heading";
import { Reveal } from "@/src/components/reveal";
import { Stagger, StaggerItem } from "@/src/components/stagger";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await getUpcomingEvents(6);
  const presenciales = events.filter((e) => e.modality === "IN_PERSON");
  const online = events.filter((e) => e.modality !== "IN_PERSON");

  return (
    <>
      <Hero />
      <Marquee
        items={[
          "Inscripción abierta",
          "Próximo taller en Caracas",
          "Cupo limitado por aula",
          "Pago en Bs. o USDT",
          "Confirmación por WhatsApp",
          "Mi futuro es hoy",
        ]}
      />
      <UpcomingSection events={events} />
      <SerieSection />
      <PresencialesSection events={presenciales} online={online} />
      <DocumentalSection />
      <GuidesSection />
      <BioSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}

function Hero() {
  return (
    <section className="border-b border-ink/10">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:gap-16 md:px-10 md:py-24">
        <div className="rise flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="program-tag">Temporada 2026</span>
              <span className="h-px w-10 bg-ink/40" />
              <span className="eyebrow">Caracas · LatAm</span>
            </div>
            <h1 className="font-display mt-6 text-[3.6rem] leading-[0.92] text-ink md:text-[6rem]">
              Mi <span className="text-brand">futuro</span>
              <br />
              es <span className="font-flourish italic font-medium text-ink">hoy.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
              Una escuela para gente que quiere entender el dinero,
              vender en serio y dejar de esperar. Cursos por WhatsApp,
              talleres presenciales y una serie de economía sin paja —
              explicada como en la mesa de la cocina.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/eventos" className="btn-primary">
              Inscribirme al próximo curso
              <span aria-hidden>→</span>
            </Link>
            <a
              href={whatsappLink("Hola, quiero información de Curso Nacional")}
              target="_blank"
              rel="noreferrer"
              className="btn-wa"
            >
              Hablar por WhatsApp
            </a>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-mute">
            Cupos limitados · Pago en Bs. o USDT
          </p>
        </div>

        <div className="relative rise" style={{ animationDelay: "120ms" }}>
          <div className="relative aspect-[3/4] w-full overflow-hidden border border-ink bg-paper-deep shadow-[10px_10px_0_var(--ink)]">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_25%,rgba(214,40,40,0.55),transparent_55%),radial-gradient(ellipse_at_70%_85%,rgba(11,11,11,0.55),transparent_55%)]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-[10rem] font-extrabold leading-none text-paper/15">CN</span>
            </div>
            <div className="absolute left-6 top-6 stamp bg-paper">
              Edición 2026
            </div>
            <div className="absolute inset-x-6 bottom-6 flex items-end justify-between text-paper">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-paper/75">
                  Retrato · placeholder
                </p>
                <p className="font-display mt-1 text-2xl font-extrabold uppercase">
                  Vender. Exportar. Entender.
                </p>
              </div>
              <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-paper/80">CN · 2026</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rotate-[-3deg] border border-ink bg-paper px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] shadow-[3px_3px_0_var(--brand)] md:block">
            Programa de temporada
          </div>
        </div>
      </div>
    </section>
  );
}

function UpcomingSection({ events }: { events: Awaited<ReturnType<typeof getUpcomingEvents>> }) {
  return (
    <section id="cartelera" className="border-b border-ink/10 py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            number="I."
            eyebrow="Próximos cursos"
            title="Lo que viene en el aula"
            intro="Cursos cortos por WhatsApp y talleres presenciales en Caracas. La inscripción queda pendiente hasta validar el pago."
          />
          <Link href="/eventos" className="editorial-link self-start text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft md:self-end">
            Ver todos los cursos →
          </Link>
        </div>

        {events.length > 0 ? (
          <Stagger className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, i) => (
              <StaggerItem key={event.slug}>
                <EventCard event={event} index={i} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <EmptyState
            label="Sin programación cargada"
            help="Conecta la base de datos y corre el seed para ver cursos aquí."
          />
        )}
      </div>
    </section>
  );
}

function SerieSection() {
  const modulos = [
    { n: "01", t: "Oferta y demanda", d: "Lo que te enseñaron mal y cómo se aplica al negocio real." },
    { n: "02", t: "Criptomonedas", d: "Qué es, qué no es y cómo se usa sin sufrir en el camino." },
    { n: "03", t: "Exportación", d: "Cómo sacas un producto de Venezuela al mundo, paso por paso." },
    { n: "04", t: "Economía emocional", d: "El dinero también es cabeza. Hábitos, miedo y disciplina." },
    { n: "05", t: "Capitalismo", d: "Las reglas de un juego en el que ya estás jugando, lo sepas o no." },
  ];
  return (
    <section id="serie" className="border-b border-ink/10 bg-ink py-20 text-paper md:py-28">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="program-tag !text-gold-soft">II.</span>
              <span className="eyebrow !text-paper/60">La serie</span>
            </div>
            <h2 className="font-display mt-3 text-[2.6rem] leading-[0.98] md:text-[4rem]">
              Una serie de economía
              <br />
              <span className="font-flourish italic font-medium text-gold-soft">explicada en cristiano.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-paper/75">
              Cinco entregas para entender cómo funciona el dinero en la
              vida real. Sin academicismos. Con ejemplos de calle, casos
              de gente que conocemos y tareas para aplicar de una.
            </p>
          </div>
          <Link href="/eventos" className="self-start border border-paper px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] hover:bg-paper hover:text-ink md:self-end">
            Inscribirme a la serie →
          </Link>
        </div>

        <Stagger as="ol" className="mt-14 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {modulos.map((m) => (
            <StaggerItem key={m.n} className="border-t border-paper/30 pt-5">
              <p className="font-display text-sm font-bold tracking-[0.2em] text-brand">MÓDULO {m.n}</p>
              <h3 className="font-display mt-2 text-2xl leading-tight md:text-3xl">{m.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/70">{m.d}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function PresencialesSection({
  events,
  online,
}: {
  events: Awaited<ReturnType<typeof getUpcomingEvents>>;
  online: Awaited<ReturnType<typeof getUpcomingEvents>>;
}) {
  return (
    <section id="cursos" className="border-b border-ink/10 bg-paper-deep py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.5fr]">
          <div className="md:sticky md:top-32 md:self-start">
            <SectionHeading
              number="III."
              eyebrow="Cómo se estudia"
              title="Dos formas de meterte."
              intro="Te metes al grupo de WhatsApp y estudias a tu ritmo, o te vienes presencial y te lo dictamos en sala con cohorte y devolución directa."
            />
            <ul className="mt-8 space-y-3 text-sm text-ink-soft">
              <li className="ornament-arrow">Curso por WhatsApp · entrega diaria</li>
              <li className="ornament-arrow">Taller presencial · Caracas</li>
              <li className="ornament-arrow">Grupo privado de alumnos</li>
              <li className="ornament-arrow">Material descargable + grabaciones</li>
            </ul>
          </div>

          <div className="space-y-10">
            <div>
              <p className="eyebrow mb-4">Presenciales · Caracas</p>
              {events.length > 0 ? (
                <Stagger className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {events.map((e, i) => (
                    <StaggerItem key={e.slug}>
                      <EventCard event={e} index={i} />
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : (
                <EmptyState label="Sin talleres presenciales" help="Pronto anunciamos próximas fechas." />
              )}
            </div>
            <div>
              <p className="eyebrow mb-4">Online · por WhatsApp</p>
              {online.length > 0 ? (
                <Stagger className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {online.map((e, i) => (
                    <StaggerItem key={e.slug}>
                      <EventCard event={e} index={i} />
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : (
                <EmptyState label="Sin cursos online" help="Próximamente se abren nuevas cohortes." />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DocumentalSection() {
  return (
    <section id="documental" className="border-b border-ink/10 py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.1fr] md:items-center">
          <Reveal className="relative" y={24}>
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-ink bg-ink shadow-[10px_10px_0_var(--brand)]">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,255,255,0.12),transparent_55%)]"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-paper">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-paper/60">Documental</span>
                <h3 className="font-display mt-3 px-6 text-3xl font-extrabold uppercase leading-tight md:text-5xl">
                  Nos vemos
                  <br />
                  en el aeropuerto
                </h3>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-paper/70">Estreno 29 · oct</p>
              </div>
              <div className="absolute bottom-4 left-4 stamp bg-paper">Próximamente</div>
            </div>
          </Reveal>
          <Reveal y={20} delay={0.08}>
            <SectionHeading
              number="IV."
              eyebrow="Documental"
              title="Un país que se va, y el que se queda."
              intro="La película que llevamos años preparando. Historias de quienes se fueron, quienes volvieron y quienes están eligiendo quedarse a construir."
            />
            <ul className="mt-8 space-y-3 text-sm text-ink-soft">
              <li className="ornament-arrow">Función de estreno con conversación al final</li>
              <li className="ornament-arrow">Funciones limitadas por sala</li>
              <li className="ornament-arrow">Entrada con código de reserva</li>
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/eventos" className="btn-primary">
                Reservar entrada →
              </Link>
              <a
                href={whatsappLink("Quiero información del documental")}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                Más información
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

type Guide = {
  t: string;
  d: string;
  price: string;
  cover: "mustard" | "ink" | "cream";
  tag: string;
};

function GuidesSection() {
  const guides: Guide[] = [
    {
      t: "Vender por Shein y Alibaba",
      d: "Lo esencial para empezar a importar y revender sin perder plata.",
      price: "$18",
      cover: "mustard",
      tag: "Vol. 01",
    },
    {
      t: "Criptomonedas para gente normal",
      d: "Wallet, P2P y la disciplina para no quemarte en el primer ciclo.",
      price: "$15",
      cover: "ink",
      tag: "Vol. 02",
    },
    {
      t: "Exportar desde Venezuela",
      d: "Trámites, costos y rutas reales. Con casos.",
      price: "$22",
      cover: "cream",
      tag: "Vol. 03",
    },
  ];
  return (
    <section id="guias" className="border-b border-ink/10 py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            number="V."
            eyebrow="Material impreso"
            title="Guías para tenerlas a mano."
            intro="Las mismas clases, pero impresas y subrayadas a propósito. Para leer en el bus, en la cola del banco o en la mesa de la cocina."
          />
          <a
            href={whatsappLink("Quiero pedir una guía impresa")}
            target="_blank"
            rel="noreferrer"
            className="btn-wa self-start md:self-end"
          >
            Pedir por WhatsApp →
          </a>
        </div>

        <Stagger className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {guides.map((g) => (
            <StaggerItem key={g.t}>
              <article className="group flex h-full flex-col border border-ink bg-paper shadow-[6px_6px_0_var(--ink)] transition-[transform,box-shadow] duration-[240ms] ease-[var(--ease-out-strong)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[10px_10px_0_var(--brand)]">
                <GuideCover variant={g.cover} title={g.t} tag={g.tag} />
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-mute">Guía impresa</p>
                  <h3 className="font-display mt-2 text-2xl leading-tight text-ink">{g.t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{g.d}</p>
                  <div className="mt-6 flex items-baseline justify-between border-t border-ink/15 pt-4">
                    <span className="font-display text-2xl font-extrabold text-ink">{g.price}</span>
                    <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-brand-deep">Pedir →</span>
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function BioSection() {
  return (
    <section id="sobre" className="border-b border-ink/10 py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.3fr]">
          <Reveal className="relative" y={20}>
            <div className="aspect-[4/5] w-full overflow-hidden border border-ink bg-paper-deep shadow-[8px_8px_0_var(--ink)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/about-img.avif"
                alt="Curso Nacional · quien está detrás"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal y={20} delay={0.08}>
            <SectionHeading
              number="VI."
              eyebrow="Quién está detrás"
              title="No es magia. Es entrenamiento."
            />
            <p className="dropcap mt-8 text-lg leading-relaxed text-ink-soft">
              Curso Nacional nació en 2020 de la mano de Gabriel Méndez
              —periodista y emprendedor venezolano— para enseñar lo que
              la academia no cuenta: cómo se monta, se promueve y se
              hace crecer un negocio dentro del país. Educación
              económica práctica, sin academicismos, para quien quiere
              construir algo propio.
            </p>
            <p className="mt-5 text-base leading-relaxed text-ink-soft">
              Llevamos clases presenciales a cines, teatros y
              universidades de toda Venezuela; talleres por WhatsApp y
              contenidos gratuitos por Instagram. Vemos emprendimiento,
              importaciones y publicidad digital con las herramientas
              que se usan hoy —Binance, Canva, Alibaba, Amazon, PayPal—.
              Todo aterrizado, todo aplicable.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-ink/20 pt-8">
              <Metric label="Estudiantes" value="3.2k+" />
              <Metric label="Cohortes dictadas" value="22" />
              <Metric label="Reseñas en Google" value="4.9" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function GuideCover({
  variant,
  title,
  tag,
}: {
  variant: "mustard" | "ink" | "cream";
  title: string;
  tag: string;
}) {
  const palette = {
    mustard: {
      bg: "bg-brand",
      text: "text-ink",
      sub: "text-ink/70",
      accent: "text-ink",
      vignette:
        "bg-[radial-gradient(ellipse_at_70%_85%,rgba(11,11,11,0.18),transparent_55%),radial-gradient(ellipse_at_20%_15%,rgba(255,255,255,0.25),transparent_55%)]",
    },
    ink: {
      bg: "bg-ink",
      text: "text-paper",
      sub: "text-paper/70",
      accent: "text-brand",
      vignette:
        "bg-[radial-gradient(ellipse_at_30%_20%,rgba(210,160,43,0.22),transparent_55%),radial-gradient(ellipse_at_75%_85%,rgba(255,255,255,0.08),transparent_55%)]",
    },
    cream: {
      bg: "bg-paper-deep",
      text: "text-ink",
      sub: "text-ink/70",
      accent: "text-brand-deep",
      vignette:
        "bg-[radial-gradient(ellipse_at_30%_20%,rgba(210,160,43,0.20),transparent_55%),radial-gradient(ellipse_at_75%_85%,rgba(11,11,11,0.10),transparent_55%)]",
    },
  }[variant];

  return (
    <div className={`relative aspect-[3/4] w-full overflow-hidden border-b border-ink ${palette.bg}`}>
      <div aria-hidden className={`absolute inset-0 ${palette.vignette}`} />
      {/* Spine line — book feel */}
      <div aria-hidden className={`absolute left-3 top-0 bottom-0 w-px ${variant === "ink" ? "bg-paper/15" : "bg-ink/15"}`} />
      <div className={`relative flex h-full flex-col justify-between p-5 ${palette.text}`}>
        <div className="flex items-center justify-between">
          <p className={`text-[0.65rem] font-bold uppercase tracking-[0.3em] ${palette.sub}`}>Curso Nacional</p>
          <p className={`font-flourish text-sm italic ${palette.accent}`}>{tag}</p>
        </div>
        <div>
          <p className={`text-[0.6rem] font-bold uppercase tracking-[0.32em] ${palette.sub}`}>Guía impresa</p>
          <h4 className="font-display mt-2 text-[1.65rem] leading-[0.95] md:text-[1.85rem]">
            {title}
          </h4>
          <div className={`mt-4 h-px w-12 ${variant === "ink" ? "bg-brand" : "bg-ink"}`} />
        </div>
      </div>
      <div className="absolute right-3 top-3 stamp bg-paper">Foto · placeholder</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-4xl font-extrabold text-brand md:text-5xl">{value}</p>
      <p className="eyebrow mt-2">{label}</p>
    </div>
  );
}

function TestimonialsSection() {
  const quotes = [
    {
      body: "El curso de Shein–Alibaba me cambió el negocio. Dejé de adivinar y empecé a planificar de verdad.",
      author: "Andreína R.",
      role: "Cohorte 2025 · Caracas",
    },
    {
      body: "Llevaba dos años queriendo entender cripto sin perderme. La serie me lo aterrizó en una semana.",
      author: "Daniel P.",
      role: "Estudiante online",
    },
    {
      body: "Vine al taller pensando que era otro motivacional. Me fui con un plan concreto y un grupo donde seguir.",
      author: "María Eugenia L.",
      role: "Emprendedora",
    },
  ];
  return (
    <section className="border-b border-ink/10 py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <SectionHeading
          number="VII."
          eyebrow="Reseñas reales"
          title="Lo que dicen quienes ya pasaron."
        />
        <Stagger className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {quotes.map((q, i) => (
            <StaggerItem key={i} className="relative border border-ink/20 bg-paper p-7">
              <span className="font-flourish absolute -top-7 left-5 text-7xl italic text-brand">&ldquo;</span>
              <blockquote className="font-display text-xl leading-snug text-ink">
                {q.body}
              </blockquote>
              <figcaption className="mt-6 border-t border-ink/15 pt-4 text-xs font-semibold uppercase tracking-[0.2em] text-mute">
                <span className="text-ink">{q.author}</span>
                <span className="mx-2">·</span>
                {q.role}
              </figcaption>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="mt-8 text-center text-xs uppercase tracking-[0.22em] text-mute">
          ★ 4.9 / 5 · más de 300 reseñas en Google
        </p>
      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    {
      q: "¿Cómo funciona la inscripción?",
      a: "Eliges el curso o taller, dejas tus datos y haces la pre-inscripción. El sistema te da un código y bloquea tu cupo unos minutos (talleres) o 24 horas (cursos) para que pagues. Subes el comprobante y nosotros confirmamos por WhatsApp.",
    },
    {
      q: "¿En qué moneda se paga?",
      a: "El precio base está en dólares. Puedes pagar en bolívares según la tasa vigente publicada, o en USDT por la red TRC-20. Las instrucciones aparecen al iniciar la inscripción.",
    },
    {
      q: "¿Qué pasa si no pago a tiempo?",
      a: "La inscripción expira y libera el cupo automáticamente. No se renueva: tendrías que inscribirte de nuevo si todavía quedan lugares.",
    },
    {
      q: "¿Cómo se dictan los cursos por WhatsApp?",
      a: "Te metemos a un grupo privado solo de la cohorte. Recibes clases en audio, texto y materiales descargables; las dudas se responden en el mismo grupo en horario asignado.",
    },
    {
      q: "¿Dan certificado?",
      a: "Sí. Al completar el curso recibes un certificado digital de Curso Nacional. No es un título universitario; es la evidencia de que cumpliste el programa.",
    },
    {
      q: "¿Puedo recuperar la inscripción o cambiar de fecha?",
      a: "Escríbenos por WhatsApp con tu código. Hacemos cambios manualmente caso por caso, hasta donde alcance el cupo del próximo grupo.",
    },
  ];
  return (
    <section id="faq" className="border-b border-ink/10 bg-paper-deep py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.4fr]">
          <SectionHeading
            number="VIII."
            eyebrow="Dudas"
            title="Preguntas frecuentes"
            intro="Lo que más nos preguntan antes de inscribirse. Si te queda algo en el aire, escríbenos por WhatsApp."
          />
          <div className="divide-y divide-ink/15">
            {faqs.map((f, i) => (
              <details key={i} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-start justify-between gap-6">
                  <h3 className="font-display text-xl leading-snug text-ink md:text-2xl">
                    {f.q}
                  </h3>
                  <span className="font-display mt-1 text-2xl font-bold text-brand transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-ink py-20 text-paper md:py-28">
      <Reveal className="mx-auto max-w-[1080px] px-6 text-center md:px-10" y={24}>
        <span className="program-tag !text-gold-soft">IX.</span>
        <h2 className="font-display mt-3 text-[3rem] leading-[0.98] md:text-[5rem]">
          Si lo vas a hacer,
          <br />
          <span className="font-flourish italic font-medium text-gold-soft">hazlo hoy.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-paper/85">
          Las próximas cohortes son pequeñas. Inscríbete ahora y paga
          con calma dentro del plazo. Si te lo piensas tres semanas, no
          va a haber cupo.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/eventos" className="bg-brand px-6 py-4 text-xs font-bold uppercase tracking-[0.22em] text-ink hover:bg-brand-deep hover:text-paper">
            Inscribirme ahora →
          </Link>
          <a
            href={whatsappLink("Hola, quiero información")}
            target="_blank"
            rel="noreferrer"
            className="border border-paper/70 px-6 py-4 text-xs font-bold uppercase tracking-[0.22em] text-paper hover:bg-paper hover:text-ink"
          >
            Hablar por WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  );
}

function EmptyState({ label, help }: { label: string; help: string }) {
  return (
    <div className="border border-dashed border-ink/30 p-10 text-center">
      <p className="font-display text-2xl text-ink">{label}</p>
      <p className="mt-2 text-sm text-mute">{help}</p>
    </div>
  );
}
