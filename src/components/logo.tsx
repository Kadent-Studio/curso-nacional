type Size = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

const PX: Record<Size, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 64,
  xl: 96,
  xxl: 140,
};

type LogoProps = {
  size?: Size;
  className?: string;
  /** Backwards-compat noop — round badge works on any bg */
  variant?: "default" | "paper";
};

export function Logo({ size = "md", className = "" }: LogoProps) {
  const px = PX[size];
  return (
    <svg
      viewBox="0 0 100 100"
      width={px}
      height={px}
      role="img"
      aria-label="Curso Nacional"
      className={`shrink-0 ${className}`}
    >
      <circle cx="50" cy="50" r="50" fill="var(--brand)" />
      <text
        x="50"
        y="44"
        textAnchor="middle"
        textLength="64"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-bricolage), 'Arial Black', Impact, sans-serif"
        fontWeight={800}
        fontSize={24}
        fill="var(--ink)"
      >
        CURSO
      </text>
      <text
        x="50"
        y="71"
        textAnchor="middle"
        textLength="86"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-bricolage), 'Arial Black', Impact, sans-serif"
        fontWeight={800}
        fontSize={24}
        fill="var(--ink)"
      >
        NACIONAL
      </text>
    </svg>
  );
}
