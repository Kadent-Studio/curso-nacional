export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-strip">
      <div className="marquee-track">
        {doubled.map((it, i) => (
          <span key={i} className="flex items-center gap-10">
            <span>{it}</span>
            <span aria-hidden className="text-ink/60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
