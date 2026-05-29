type Props = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "brand" | "ink" | "mute";
};

const TONE_BG: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-paper border-ink/20",
  brand: "bg-brand border-ink",
  ink: "bg-ink text-paper border-ink",
  mute: "bg-paper-deep border-ink/15 text-mute",
};

export function StatCard({ label, value, hint, tone = "default" }: Props) {
  return (
    <div className={`border p-5 ${TONE_BG[tone]}`}>
      <p className={`eyebrow ${tone === "ink" ? "!text-paper/60" : ""}`}>{label}</p>
      <p className="font-display mt-2 text-4xl font-extrabold leading-none md:text-5xl">
        {value}
      </p>
      {hint && <p className={`mt-2 text-xs ${tone === "ink" ? "text-paper/60" : "text-mute"}`}>{hint}</p>}
    </div>
  );
}
