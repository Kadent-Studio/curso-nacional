import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth";
import {
  getPaymentMethodsAdmin,
  getExchangeRateHistory,
} from "@/src/lib/admin-data";
import { ExchangeRateForm, PaymentMethodForm } from "@/src/components/admin/config-forms";
import { formatDateTime } from "@/src/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Configuración — Curso Nacional Admin" };

export default async function ConfiguracionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/admin");

  const [methods, rates] = await Promise.all([
    getPaymentMethodsAdmin(),
    getExchangeRateHistory(15),
  ]);

  const currentRate = rates.find((r) => r.active);

  return (
    <div>
      <header>
        <span className="program-tag">Configuración</span>
        <h1 className="font-display mt-1 text-4xl leading-[1] md:text-5xl">Operación</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          Tasa Bs./USD vigente y métodos de pago. Cambios aplican a inscripciones
          futuras; las existentes quedan congeladas con su tasa original.
        </p>
      </header>

      <hr className="rule-thin my-10" />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr]">
        <section>
          <h2 className="eyebrow mb-4">Tasa Bs./USD</h2>
          <div className="border border-ink/15 bg-paper p-5">
            <p className="text-xs text-mute">Vigente</p>
            <p className="font-display mt-1 text-3xl font-extrabold">
              {currentRate ? Number(currentRate.bsPerUsd).toLocaleString("es-VE", { minimumFractionDigits: 4 }) : "—"}
            </p>
            {currentRate && (
              <p className="text-xs text-mute">Desde {formatDateTime(currentRate.createdAt)}</p>
            )}
          </div>
          <div className="mt-6 border border-ink/15 bg-paper p-5">
            <ExchangeRateForm current={currentRate ? Number(currentRate.bsPerUsd) : null} />
          </div>

          <h3 className="eyebrow mt-10 mb-3">Historial</h3>
          <ul className="border border-ink/15 bg-paper divide-y divide-ink/10">
            {rates.length === 0 && <li className="p-4 text-sm text-mute">Sin tasas registradas.</li>}
            {rates.map((r) => (
              <li key={r.id} className="flex items-center justify-between p-3 text-sm">
                <span className="font-display">{Number(r.bsPerUsd).toLocaleString("es-VE", { minimumFractionDigits: 4 })}</span>
                <span className="text-xs text-mute">
                  {formatDateTime(r.createdAt)}{r.active ? " · activa" : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="eyebrow mb-4">Métodos de pago</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {methods.map((m) => (
              <PaymentMethodForm
                key={m.id}
                method={{
                  id: m.id,
                  kind: m.kind,
                  label: m.label,
                  instructions: m.instructions,
                  active: m.active,
                }}
              />
            ))}
            {methods.length === 0 && (
              <p className="text-sm text-mute">Sin métodos configurados. Corre el seed para crear los iniciales.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
