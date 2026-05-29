import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { getReservationAdmin } from "@/src/lib/admin-data";
import { ReservationActions } from "@/src/components/admin/reservation-actions";
import { StatusPill } from "@/src/components/admin/status-pill";
import { formatDateTime, formatDaysUntil, formatUsd, formatBs, formatUsdt } from "@/src/lib/format";

export const dynamic = "force-dynamic";

export default async function ReservationDetailAdmin({ params }: PageProps<"/admin/reservas/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const r = await getReservationAdmin(id);
  if (!r) notFound();

  return (
    <div>
      <Link href="/admin/reservas" className="text-xs uppercase tracking-[0.2em] text-mute hover:text-ink">
        ← Volver a inscripciones
      </Link>

      <header className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="program-tag">Inscripción</span>
          <h1 className="font-display mt-1 text-4xl font-extrabold leading-[1] md:text-5xl">{r.code}</h1>
          <p className="mt-2 text-ink-soft">{r.event.title}</p>
        </div>
        <StatusPill status={r.status} />
      </header>

      <hr className="rule-thin my-10" />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <section>
            <p className="eyebrow mb-3">Estudiante</p>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-mute">Nombre</dt>
              <dd className="text-ink">{r.buyerFirstName} {r.buyerLastName}</dd>
              <dt className="text-mute">WhatsApp</dt>
              <dd className="text-ink">
                <a className="editorial-link" href={`https://wa.me/${r.buyerWhatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
                  {r.buyerWhatsapp}
                </a>
              </dd>
              {r.buyerNote && (
                <>
                  <dt className="text-mute">Nota del estudiante</dt>
                  <dd className="text-ink-soft">{r.buyerNote}</dd>
                </>
              )}
            </dl>
          </section>

          <section>
            <p className="eyebrow mb-3">Curso / fecha</p>
            <ul className="space-y-2 text-sm">
              {r.items.map((it) => (
                <li key={it.id} className="border-l-2 border-ink/30 pl-3">
                  <p className="font-display">
                    {formatDateTime(it.occurrence.startsAt)}
                    <span className="ml-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-deep">
                      {formatDaysUntil(it.occurrence.startsAt)}
                    </span>
                  </p>
                  <p className="text-xs text-mute">
                    {it.priceVariant.name} · {it.quantity} cupo(s) · {formatUsd(Number(it.unitPriceUsd))} c/u
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="eyebrow mb-3">Pago</p>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-mute">Método</dt>
              <dd className="text-ink">{r.paymentMethodKind}</dd>
              <dt className="text-mute">Monto USD</dt>
              <dd className="text-ink font-display font-bold">{formatUsd(Number(r.amountUsd))}</dd>
              {r.amountBs && (
                <>
                  <dt className="text-mute">Monto Bs.</dt>
                  <dd className="text-ink">{formatBs(Number(r.amountBs))}</dd>
                </>
              )}
              {r.paymentMethodKind === "USDT" && (
                <>
                  <dt className="text-mute">A pagar</dt>
                  <dd className="text-ink">{formatUsdt(Number(r.amountUsd))}</dd>
                </>
              )}
              {r.exchangeRate && (
                <>
                  <dt className="text-mute">Tasa Bs./USD usada</dt>
                  <dd className="text-ink">{Number(r.exchangeRate).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</dd>
                </>
              )}
              <dt className="text-mute">Vence</dt>
              <dd className="text-ink">{formatDateTime(r.expiresAt)}</dd>
              {r.confirmedAt && (<><dt className="text-mute">Confirmada</dt><dd className="text-ink">{formatDateTime(r.confirmedAt)}</dd></>)}
              {r.rejectedAt && (<><dt className="text-mute">Rechazada</dt><dd className="text-ink">{formatDateTime(r.rejectedAt)}</dd></>)}
              {r.cancelledAt && (<><dt className="text-mute">Cancelada</dt><dd className="text-ink">{formatDateTime(r.cancelledAt)}</dd></>)}
            </dl>
          </section>

          {r.receiptPath && (
            <section>
              <p className="eyebrow mb-3">Comprobante</p>
              {r.receiptPath.endsWith(".pdf") ? (
                <a href={r.receiptPath} target="_blank" rel="noreferrer" className="editorial-link text-sm">
                  Abrir PDF →
                </a>
              ) : (
                <a href={r.receiptPath} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.receiptPath} alt="Comprobante" className="max-h-96 border border-ink/30" />
                </a>
              )}
            </section>
          )}

          {r.internalNote && (
            <section>
              <p className="eyebrow mb-2">Nota interna</p>
              <p className="border-l-2 border-brand pl-3 text-sm text-ink-soft whitespace-pre-line">{r.internalNote}</p>
            </section>
          )}
        </div>

        <aside>
          <ReservationActions reservationId={r.id} status={r.status} isAdmin={user.role === "ADMIN"} />
        </aside>
      </div>
    </div>
  );
}
