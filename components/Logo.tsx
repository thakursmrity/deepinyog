// The Deepinyog logo: a lotus opening in front of a rising sun, above calm water.
// The name sits beside the mark; no tagline, so the logo stays clean.

export function LotusMark({ size = 40, water = true }: { size?: number; water?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="60" cy="54" r="36" fill="#fff3d9" />
      <circle cx="60" cy="54" r="24" fill="#f2b544" />
      <path d="M60 92 C42 90 32 78 30 64 C45 64 56 75 60 92 Z" fill="#f4cfc7" stroke="#9e5a64" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M60 92 C78 90 88 78 90 64 C75 64 64 75 60 92 Z" fill="#f4cfc7" stroke="#9e5a64" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M60 92 C49 79 50 62 60 48 C70 62 71 79 60 92 Z" fill="#fdf1ee" stroke="#9e5a64" strokeWidth="2.4" strokeLinejoin="round" />
      {water ? (
        <>
          <path d="M32 101 Q60 109 88 101" fill="none" stroke="#4f6b4c" strokeWidth="3" strokeLinecap="round" />
          <path d="M44 109 Q60 114 76 109" fill="none" stroke="#4f6b4c" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
        </>
      ) : null}
    </svg>
  );
}

// Kept for places that ask for the small mark on its own.
export function SunMark({ size = 32 }: { size?: number }) {
  return <LotusMark size={size} water={false} />;
}

export function LogoMark({ size = 32 }: { size?: number; color?: string }) {
  return <LotusMark size={size} water={false} />;
}

export function Logo({ textColor = "var(--ink)", tagline = false }: { color?: string; textColor?: string; tagline?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, color: textColor, lineHeight: 1 }}>
      <LotusMark size={tagline ? 46 : 42} />
      <span style={{ fontFamily: "var(--font-display), serif", fontSize: 26, letterSpacing: 0.4 }}>deepinyog</span>
    </span>
  );
}
