import Link from "next/link";
import { getDashboardStats, getRecentReservations } from "@/src/lib/admin-data";
import { StatCard } from "@/src/components/admin/stat-card";
import { formatDateTime, formatUsd } from "@/src/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard — Curso Nacional Admin" };

const STATUS_LABEL = {
  PENDING_PAYMENT: "Esperando pago",
  PAYMENT_REVIEW: "En revisión",
  CONFIRMED: "Confirmada",
  REJECTED: "Rechazada",
  EXPIRED: "Expirada",
  CANCELLED: "Cancelada",
} as const;

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([
    getDashboardStats(),
    getRecentReservations(8),
  ]);

  return (
    <div>
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="program-tag">Panel</span>
          <h1 className="font-display mt-1 text-4xl leading-[1] md:text-5xl">Dashboard</h1>
        </div>
        <p className="text-xs uppercase tracking-[0.22em] text-mute">
          Estado actualizado al cargar la página.
        </p>
      </header>

      <section className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[
          { label: "Esperando pago", value: stats.pendingPayment, tone: "brand" as const },
          { label: "En revisión", value: stats.paymentReview, tone: "ink" as const },
          { label: "Confirmadas", value: stats.confirmed },
          { label: "Expiradas", value: stats.expired, tone: "mute" as const },
          { label: "Rechazadas", value: stats.rejected, tone: "mute" as const },
          { label: "Canceladas", value: stats.cancelled, tone: "mute" as const },
          { label: "Ingreso estimado", value: formatUsd(stats.estimatedRevenueUsd), hint: "Suma de inscripciones confirmadas" },
          { label: "Cursos activos", value: stats.activeEvents, hint: "Estado PUBLISHED" },
        ].map((s, i) => (
          <div key={s.label} className="card-reveal" style={{ animationDelay: `${i * 50}ms` }}>
            <StatCard label={s.label} value={s.value} tone={s.tone} hint={s.hint} />
          </div>
        ))}
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl md:text-3xl">Últimas inscripciones</h2>
          <Link href="/admin/reservas" className="editorial-link text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
            Ver todas →
          </Link>
        </div>
        <div className="mt-5 overflow-x-auto border border-ink/15 bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-paper-deep text-left text-[0.7rem] font-bold uppercase tracking-[0.18em] text-mute">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Estudiante</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3">Creada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-mute">Aún no hay inscripciones.</td>
                </tr>
              )}
              {recent.map((r, i) => (
                <tr
                  key={r.id}
                  className="row-reveal transition-colors hover:bg-paper-deep/40"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <td className="px-4 py-3 font-display font-bold">
                    <Link href={`/admin/reservas/${r.id}`} className="editorial-link">{r.code}</Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{r.event.title}</td>
                  <td className="px-4 py-3 text-ink-soft">{r.buyerFirstName} {r.buyerLastName}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-mute">
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-display font-bold">{formatUsd(Number(r.amountUsd))}</td>
                  <td className="px-4 py-3 text-xs text-mute">{formatDateTime(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
