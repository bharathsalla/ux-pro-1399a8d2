/**
 * FixUx brand logo — heavy black wordmark + unique interactive geometric icon.
 * Bold, confident, product-first identity.
 */
export function FixUxLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { text: "text-[17px]", icon: 18, gap: "gap-1.5" },
    md: { text: "text-[22px]", icon: 22, gap: "gap-2" },
    lg: { text: "text-[32px]", icon: 28, gap: "gap-2.5" },
  };

  const s = sizes[size];

  return (
    <span className={`inline-flex items-center ${s.gap}`}>
      {/* Unique geometric mark — overlapping squares suggesting screen layers + fix/repair */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 28 28"
        fill="none"
        className="text-foreground"
      >
        {/* Back square — screen/canvas */}
        <rect x="4" y="4" width="16" height="16" rx="1" stroke="currentColor" strokeWidth="2.2" fill="none" />
        {/* Front square — overlapping, offset */}
        <rect x="9" y="9" width="16" height="16" rx="1" fill="currentColor" />
        {/* "Fix" crosshair/target mark inside front square */}
        <line x1="17" y1="13" x2="17" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="13" y1="17" x2="21" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span
        className={`${s.text} font-black tracking-tight text-foreground uppercase`}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.02em" }}
      >
        FixUx
      </span>
    </span>
  );
}
