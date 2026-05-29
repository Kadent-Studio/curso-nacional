type Props = { className?: string };

export function Skeleton({ className = "" }: Props) {
  return (
    <div
      className={`relative overflow-hidden bg-paper-deep ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink/5 to-transparent [animation:shimmer_1.6s_linear_infinite]" />
    </div>
  );
}

export function Spinner({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="cargando"
      className={`inline-block ${className}`}
      style={{
        width: size,
        height: size,
        border: "2px solid currentColor",
        borderRightColor: "transparent",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}
