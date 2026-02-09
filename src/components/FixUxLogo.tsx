/**
 * FixUx brand logo — wordmark + abstract icon.
 * Inspired by Sequoia-style bold wordmark with a unique geometric mark.
 */
export function FixUxLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { text: "text-[15px]", icon: 14 },
    md: { text: "text-[20px]", icon: 18 },
    lg: { text: "text-[28px]", icon: 24 },
  };

  const s = sizes[size];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`${s.text} font-extrabold tracking-tight text-foreground uppercase`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.04em" }}>
        FixUx
      </span>
      {/* Abstract geometric mark — stacked lines suggesting layers/screens */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 24 24"
        fill="none"
        className="text-foreground"
      >
        <rect x="3" y="4" width="18" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="6" y="10" width="15" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="3" y="16" width="18" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="3" y="10" width="2" height="2.5" rx="0.5" fill="currentColor" opacity="0.4" />
      </svg>
    </span>
  );
}
