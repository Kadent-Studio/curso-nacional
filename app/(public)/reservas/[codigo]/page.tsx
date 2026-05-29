import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { getReservationByCode, getActivePaymentMethods } from "@/src/lib/public-data";
import { ReceiptUpload } from "@/src/components/receipt-upload";
import { Countdown } from "@/src/components/countdown";
import { formatDateTime, formatDaysUntil, formatUsd, formatBs, formatUsdt } from "@/src/lib/format";
import { expireStale } from "@/src/lib/reservations";
import { whatsappLink } from "@/src/lib/contact";

type Params = Promise<{ codigo: string }>;
type SearchParams = Promise<{ nuevo?: string }>;

const STATUS_LABEL = {
  PENDING_PAYMENT: "Esperando pago",
  PAYMENT_REVIEW: "En revisión",
  CONFIRMED: "Confirmada",
  REJECTED: "Rechazada",
  EXPIRED: "Expirada",
  CANCELLED: "Cancelada",
} as const;

const STATUS_TONE: Record<keyof typeof STATUS_LABEL, string> = {
  PENDING_PAYMENT: "bg-brand text-ink",
  PAYMENT_REVIEW: "bg-brand-deep text-paper",
  CONFIRMED: "bg-ink text-brand",
  REJECTED: "bg-ink/90 text-paper border border-paper",
  EXPIRED: "bg-paper-edge text-ink-soft",
  CANCELLED: "bg-paper-edge text-ink-soft",
};

export default async function ReservationPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { codigo } = await params;
  const { nuevo } = await searchParams;

  await expireStale().catch(() => {});

  const reservation = await getReservationByCode(decodeURIComponent(codigo));
  if (!reservation) notFound();

  const methods = await getActivePaymentMethods();
  const method = methods.find((m) => m.kind === reservation.paymentMethodKind);

  const totalQty = reservation.items.reduce((acc, it) => acc + it.quantity, 0);
  const variantLabel =
    reservation.items.length === 1
      ? reservation.items[0].priceVariant.name
      : "varias tarifas";
  const ticketsLabel =
    totalQty === 1
      ? `1 entrada ${variantLabel}`
      : `${totalQty} entradas ${variantLabel}`;
  const whatsappHref = whatsappLink(
    `Hola, soy ${reservation.buyerFirstName}. Acabo de inscribirme (${reservation.code}) a "${reservation.event.title}" — ${ticketsLabel}. Te envío el comprobante.`,
  );

  const isOpen = reservation.status === "PENDING_PAYMENT" || reservation.status === "PAYMENT_REVIEW";
  const isAwaitingPayment = reservation.status === "PENDING_PAYMENT";

  return (
    <div className="border-b border-ink/10 py-12 md:py-20">
      <div className="mx-auto max-w-[1100px] px-6 md:px-10">
        {nuevo === "1" && (
          <div className="mb-8 border border-ink bg-paper-deep p-4">
            <p className="font-display text-xl font-bold">¡Listo! Tu cupo quedó tomado.</p>
            <p className="mt-1 text-sm text-ink-soft">
              Guarda este código y sigue las instrucciones de pago dentro del plazo.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="program-tag">Inscripción</span>
            <h1 className="font-display mt-1 text-5xl font-extrabold leading-[1] md:text-6xl">{reservation.code}</h1>
            <p className="mt-2 text-ink-soft">
              {reservation.event.title}
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] ${STATUS_TONE[reservation.status]}`}>
            {STATUS_LABEL[reservation.status]}
          </span>
        </div>

        <hr className="rule-thin my-10" />

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-8">
            <section>
              <p className="eyebrow mb-3">Detalle</p>
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                <dt className="text-mute">Estudiante</dt>
                <dd className="text-ink">{reservation.buyerFirstName} {reservation.buyerLastName}</dd>
                <dt className="text-mute">WhatsApp</dt>
                <dd className="text-ink">{reservation.buyerWhatsapp}</dd>
                <dt className="text-mute">Curso / fecha</dt>
                <dd className="text-ink">
                  {reservation.items.map((it) => (
                    <div key={it.id}>
                      {formatDateTime(it.occurrence.startsAt)}
                      <span className="ml-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-deep">
                        {formatDaysUntil(it.occurrence.startsAt)}
                      </span>
                      <div className="text-xs text-mute">{it.priceVariant.name} × {it.quantity}</div>
                    </div>
                  ))}
                </dd>
                <dt className="text-mute">Método de pago</dt>
                <dd className="text-ink">{reservation.paymentMethodKind}</dd>
                <dt className="text-mute">Monto USD</dt>
                <dd className="text-ink">{formatUsd(Number(reservation.amountUsd))}</dd>
                {reservation.amountBs && (
                  <>
                    <dt className="text-mute">Monto Bs.</dt>
                    <dd className="text-ink">{formatBs(Number(reservation.amountBs))}</dd>
                  </>
                )}
                {reservation.paymentMethodKind === "USDT" && (
                  <>
                    <dt className="text-mute">A pagar</dt>
                    <dd className="text-ink">{formatUsdt(Number(reservation.amountUsd))}</dd>
                  </>
                )}
              </dl>
            </section>

            {method && isOpen && (
              <section className="border border-ink bg-paper-deep p-5">
                <p className="eyebrow mb-2">Cómo pagar — {method.label}</p>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
                  {method.instructions}
                </pre>
              </section>
            )}

            {reservation.receiptPath && (
              <section>
                <p className="eyebrow mb-3">Comprobante recibido</p>
                {reservation.receiptPath.endsWith(".pdf") ? (
                  <a href={reservation.receiptPath} target="_blank" rel="noreferrer" className="editorial-link text-sm">
                    Ver comprobante (PDF) →
                  </a>
                ) : (
                  <a href={reservation.receiptPath} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={reservation.receiptPath} alt="Comprobante" className="max-h-72 border border-ink/30" />
                  </a>
                )}
              </section>
            )}

            <section className="border-l-2 border-brand/60 pl-4 text-sm leading-relaxed text-ink-soft">
              <p>
                Esta inscripción queda <em>pendiente</em> hasta validar el
                pago. Si pasa el tiempo sin comprobante, expira y libera
                el cupo automáticamente. Las inscripciones expiradas no
                se renuevan: hay que volver a inscribirse si aún quedan
                lugares.
              </p>
            </section>
          </div>

          <aside className="space-y-5">
            {isAwaitingPayment && (
              <div className="border border-ink bg-paper p-5">
                <p className="eyebrow mb-2">Tiempo restante</p>
                <Countdown to={reservation.expiresAt.toISOString()} />
                <p className="mt-2 text-xs text-mute">
                  Hasta {formatDateTime(reservation.expiresAt)}
                </p>
              </div>
            )}
            {reservation.status === "PAYMENT_REVIEW" && (
              <div className="border border-brand bg-brand/10 p-5">
                <p className="eyebrow mb-2">Pago recibido</p>
                <p className="text-sm text-ink">
                  Tu cupo queda asegurado mientras validamos el comprobante.
                  Ya no corre el tiempo.
                </p>
              </div>
            )}

            {reservation.status === "CONFIRMED" && (
              <div className="border-2 border-ink bg-paper-deep p-5">
                <p className="eyebrow mb-2">Tu boleto</p>
                <p className="text-sm text-ink-soft mb-3">
                  Descarga, imprime o guarda en tu teléfono. Lo escanearemos en la entrada.
                </p>
                <a
                  href={`/reservas/${encodeURIComponent(reservation.code)}/boleto`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  Descargar boleto PDF →
                </a>
              </div>
            )}

            {isOpen && (
              <ReceiptUpload reservationId={reservation.id} hasReceipt={!!reservation.receiptPath} />
            )}

            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-wa w-full justify-center">
              Escribir por WhatsApp
            </a>

            <Link href="/eventos" className="block text-center text-xs font-semibold uppercase tracking-[0.2em] text-mute hover:text-ink">
              Volver a los cursos
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
