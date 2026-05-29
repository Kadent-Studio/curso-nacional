import Link from "next/link";
import { listReservations, listActiveEvents } from "@/src/lib/admin-data";
import { StatusPill } from "@/src/components/admin/status-pill";
import { Tabs, type TabItem } from "@/src/components/admin/tabs";
import { formatDateTime, formatUsd } from "@/src/lib/format";
import type { ReservationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = { title: "Inscripciones — Curso Nacional Admin" };

const STATUSES: { value: ReservationStatus | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING_PAYMENT", label: "Esperando pago" },
  { value: "PAYMENT_REVIEW", label: "En revisión" },
  { value: "CONFIRMED", label: "Confirmadas" },
  { value: "REJECTED", label: "Rechazadas" },
  { value: "EXPIRED", label: "Expiradas" },
  { value: "CANCELLED", label: "Canceladas" },
];

type SearchParamsObj = {
  kind?: string;
  event?: string;
  status?: string;
  q?: string;
};

function buildHref(base: { kind?: string; event?: string; status?: string; q?: string }) {
  const params = new URLSearchParams();
  if (base.kind) params.set("kind", base.kind);
  if (base.event) params.set("event", base.event);
  if (base.status) params.set("status", base.status);
  if (base.q) params.set("q", base.q);
  const qs = params.toString();
  return qs ? `/admin/reservas?${qs}` : "/admin/reservas";
}

export default async function ReservationsListPage({ searchParams }: PageProps<"/admin/reservas">) {
  const sp = (await searchParams) as SearchParamsObj;
  const kindParam = sp.kind === "COURSE" || sp.kind === "THEATER" ? sp.kind : "";
  const eventId = sp.event ?? "";
  const status = sp.status ?? "";
  const search = sp.q ?? "";

  const [reservations, activeEvents] = await Promise.all([
    listReservations({
      kind: kindParam || undefined,
      eventId: eventId || undefined,
      status: status || undefined,
      search: search || undefined,
    }),
    listActiveEvents(kindParam || undefined),
  ]);

  // Top-level tabs: Todos / Cursos / Obras
  const kindTabs: TabItem[] = [
    { label: "Todos", href: buildHref({ status, q: search }), active: !kindParam },
    { label: "Cursos", href: buildHref({ kind: "COURSE", status, q: search }), active: kindParam === "COURSE" },
    { label: "Obras", href: buildHref({ kind: "THEATER", status, q: search }), active: kindParam === "THEATER" },
  ];

  // Event tabs (within selected kind)
  const eventTabs: TabItem[] | null = kindParam
    ? [
        {
          label: kindParam === "COURSE" ? "Todos los cursos" : "Todas las obras",
          href: buildHref({ kind: kindParam, status, q: search }),
          active: !eventId,
        },
        ...activeEvents.map((e) => ({
          label: e.title,
          href: buildHref({ kind: kindParam, event: e.id, status, q: search }),
          active: eventId === e.id,
          count: e._count.reservations,
        })),
      ]
    : null;

  return (
    <div>
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="program-tag">Operación</span>
          <h1 className="font-display mt-1 text-4xl leading-[1] md:text-5xl">Inscripciones</h1>
        </div>
        <p className="text-xs uppercase tracking-[0.22em] text-mute">{reservations.length} resultados</p>
      </header>

      <div className="mt-8">
        <Tabs items={kindTabs} />
      </div>

      {eventTabs && (
        <div className="mt-6 overflow-x-auto">
          <Tabs items={eventTabs} size="sm" />
        </div>
      )}

      <form className="mt-8 flex flex-col gap-3 md:flex-row md:items-end">
        {kindParam && <input type="hidden" name="kind" value={kindParam} />}
        {eventId && <input type="hidden" name="event" value={eventId} />}
        <div className="flex-1">
          <label className="block">
            <span className="label-text">Buscar</span>
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="Código, nombre o WhatsApp"
              autoComplete="off"
            />
          </label>
        </div>
        <div className="md:w-64">
          <label className="block">
            <span className="label-text">Estado</span>
            <select name="status" defaultValue={status}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className="btn-primary">Filtrar →</button>
        {(status || search) && (
          <Link
            href={buildHref({ kind: kindParam || undefined, event: eventId || undefined })}
            className="self-center text-xs uppercase tracking-[0.2em] text-mute hover:text-ink"
          >
            Limpiar filtros
          </Link>
        )}
      </form>

      <div className="mt-8 overflow-x-auto border border-ink/15 bg-paper">
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-[0.7rem] font-bold uppercase tracking-[0.18em] text-mute">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Curso / Obra</th>
              <th className="px-4 py-3">Estudiante</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Monto</th>
              <th className="px-4 py-3">Vence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {reservations.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-mute">Sin resultados.</td></tr>
            )}
            {reservations.map((r, i) => (
              <tr
                key={r.id}
                className="row-reveal transition-colors hover:bg-paper-deep/40"
                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
              >
                <td className="px-4 py-3 font-display font-bold">
                  <Link href={`/admin/reservas/${r.id}`} className="editorial-link">{r.code}</Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {r.event.title}
                  <span className="ml-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-mute">
                    {r.event.type === "COURSE" ? "Curso" : "Obra"}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft">{r.buyerFirstName} {r.buyerLastName}</td>
                <td className="px-4 py-3 text-mute">{r.buyerWhatsapp}</td>
                <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                <td className="px-4 py-3 text-right font-display font-bold">{formatUsd(Number(r.amountUsd))}</td>
                <td className="px-4 py-3 text-xs text-mute">{formatDateTime(r.expiresAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
