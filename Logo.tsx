// The Deepinyog wordmark: navy lowercase name rising out of a soft sun.
export function SunMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <radialGradient id="dy-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb53a" />
          <stop offset="45%" stopColor="#ffd27a" />
          <stop offset="75%" stopColor="#ffeac2" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fff4de" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#dy-sun)" />
    </svg>
  );
}

export function LogoMark({ size = 32 }: { size?: number; color?: string }) {
  return <SunMark size={size} />;
}

export function Logo({ textColor = "var(--ink)", tagline = false }: { color?: string; textColor?: string; tagline?: boolean }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 0, color: textColor, lineHeight: 1 }}>
      <span style={{ position: "relative", display: "inline-block", padding: "6px 4px" }}>
        <span aria-hidden="true" style={{ position: "absolute", left: "36%", top: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
          <SunMark size={46} />
        </span>
        <span style={{ position: "relative", fontFamily: "var(--font-body), system-ui, sans-serif", fontWeight: 500, fontSize: 25, letterSpacing: 0.3 }}>
          deepinyog
        </span>
      </span>
      {tagline ? (
        <span style={{ fontSize: 10.5, letterSpacing: 0.8, color: "var(--saffron-ink)", marginTop: -2, paddingLeft: 4 }}>Dive Deeper to Rise Higher</span>
      ) : null}
    </span>
  );
}
