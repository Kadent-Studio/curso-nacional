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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/logo.png"
      width={px}
      height={px}
      alt="Curso Nacional"
      className={`shrink-0 ${className}`}
      style={{ width: px, height: px }}
    />
  );
}
