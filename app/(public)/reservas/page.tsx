import { redirect } from "next/navigation";

export const metadata = { title: "Consultar inscripción — Curso Nacional" };

async function lookupAction(formData: FormData) {
  "use server";
  const raw = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!raw) return;
  redirect(`/reservas/${encodeURIComponent(raw)}`);
}

export default function ReservasLookup() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-[640px] px-6 md:px-10">
        <span className="program-tag">Mi inscripción</span>
        <h1 className="font-display mt-3 text-5xl leading-[0.98]">Consulta tu código.</h1>
        <p className="mt-4 text-ink-soft">
          Ingresa el código que recibiste al inscribirte (por ejemplo{" "}
          <span className="font-display font-bold text-ink">CN-000123</span>) y verás
          su estado, las instrucciones de pago y el comprobante.
        </p>
        <form action={lookupAction} className="mt-8 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            name="code"
            placeholder="CN-000000"
            required
            className="md:flex-1"
            autoComplete="off"
          />
          <button type="submit" className="btn-primary justify-center">
            Ver inscripción →
          </button>
        </form>
      </div>
    </section>
  );
}
