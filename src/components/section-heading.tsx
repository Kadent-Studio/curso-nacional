type Props = {
  number: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
};

export function SectionHeading({ number, eyebrow, title, intro, align = "left" }: Props) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className={`flex items-baseline gap-3 ${align === "center" ? "justify-center" : ""}`}>
        <span className="program-tag">{number}</span>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      </div>
      <h2 className="font-display mt-3 text-[2.6rem] leading-[0.98] text-ink md:text-[3.6rem]">
        {title}
      </h2>
      {intro && (
        <p className={`mt-4 max-w-2xl text-base leading-relaxed text-ink-soft ${align === "center" ? "mx-auto" : ""}`}>
          {intro}
        </p>
      )}
    </div>
  );
}
