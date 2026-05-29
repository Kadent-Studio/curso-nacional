import Link from "next/link";

export type TabItem = {
  label: string;
  href: string;
  active: boolean;
  count?: number;
};

export function Tabs({ items, size = "lg" }: { items: TabItem[]; size?: "lg" | "sm" }) {
  const sizeClasses =
    size === "lg"
      ? "px-4 py-3 text-sm md:text-base"
      : "px-3 py-2 text-xs";
  return (
    <div className="-mb-px flex flex-wrap items-end gap-x-1 gap-y-1 border-b border-ink/15">
      {items.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`relative inline-flex items-center gap-2 border-b-2 font-display font-bold uppercase tracking-[0.08em] transition-colors ${sizeClasses} ${
            t.active
              ? "border-ink text-ink"
              : "border-transparent text-mute hover:border-ink/40 hover:text-ink"
          }`}
        >
          <span>{t.label}</span>
          {typeof t.count === "number" && (
            <span
              className={`inline-flex min-w-[1.5rem] justify-center rounded-sm px-1.5 py-0.5 text-[0.65rem] font-bold tracking-normal ${
                t.active ? "bg-brand text-ink" : "bg-paper-deep text-mute"
              }`}
            >
              {t.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
