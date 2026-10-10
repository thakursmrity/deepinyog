// Small line drawings, one per program. Unknown programs get the sun.
const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const MOTIFS: Record<string, React.ReactNode> = {
  "hatha-yoga": (
    <g {...P}>
      <circle cx="24" cy="9" r="3" />
      <path d="M24 13v12M24 17l-9-5M24 17l9-5M24 25l-7 12M24 25l7 12M13 38h22" />
    </g>
  ),
  "yoga-therapy": (
    <g {...P}>
      <path d="M24 6c-3 4-3 8 0 11s3 7 0 11-3 8 0 11" />
      <path d="M18 11h12M17 20h14M18 29h12M20 38h8" />
    </g>
  ),
  "marma-therapy": (
    <g {...P}>
      <path d="M16 40V24c0-2 1-3 3-3s3 1 3 3v-9c0-2 1-3 3-3s3 1 3 3v10l2-3c1-2 3-2 4-1s1 3 0 5l-6 10c-1 3-3 4-6 4h-3" />
      <circle cx="25" cy="7" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="35" cy="14" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16" r="1.4" fill="currentColor" stroke="none" />
    </g>
  ),
  pranayama: (
    <g {...P}>
      <path d="M8 18c6-6 12 6 18 0s10-4 14-1" />
      <path d="M8 26c6-6 12 6 18 0s10-4 14-1" />
      <path d="M8 34c6-6 12 6 18 0s10-4 14-1" />
    </g>
  ),
  meditation: (
    <g {...P}>
      <path d="M30 8a12 12 0 1 0 10 18A10 10 0 0 1 30 8Z" />
      <path d="M12 40c4-3 8-4 12-4s8 1 12 4" />
    </g>
  ),
  "lemurian-yoga": (
    <g {...P}>
      <path d="M38 8C26 10 15 20 11 40" />
      <path d="M38 8c-2 8-8 15-16 19M34 11c-6 1-12 5-15 11M30 18c-4 2-8 3-12 3M27 23c-3 3-7 5-11 5M23 29c-3 2-6 3-9 3" />
    </g>
  ),
  "womens-wellness": (
    <g {...P}>
      <path d="M24 40V24" />
      <path d="M24 24c-6 0-10-4-10-10 6 0 10 4 10 10Z" />
      <path d="M24 24c6 0 10-4 10-10-6 0-10 4-10 10Z" />
      <path d="M24 18c-3-3-3-8 0-11 3 3 3 8 0 11Z" />
    </g>
  ),
  "kids-yoga": (
    <g {...P}>
      <path d="M24 7l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8Z" />
      <circle cx="24" cy="31" r="3" />
      <path d="M24 34v6M18 37l6-2 6 2" />
    </g>
  ),
  "workplace-wellness": (
    <g {...P}>
      <circle cx="16" cy="16" r="4" />
      <circle cx="32" cy="16" r="4" />
      <path d="M8 34c0-5 4-9 8-9s8 4 8 9M24 34c0-5 4-9 8-9s8 4 8 9" />
      <path d="M8 40h32" />
    </g>
  ),
  "life-coaching": (
    <g {...P}>
      <path d="M24 40s-14-8-14-19a7 7 0 0 1 14-3 7 7 0 0 1 14 3c0 11-14 19-14 19Z" />
      <path d="M24 18v10M19 23h10" />
    </g>
  ),
};

const SUN = (
  <g {...P}>
    <circle cx="24" cy="24" r="8" />
    <path d="M24 6v5M24 37v5M6 24h5M37 24h5M11 11l3.5 3.5M33.5 33.5 37 37M11 37l3.5-3.5M33.5 14.5 37 11" />
  </g>
);

export function ProgramMotif({ slug, size = 48 }: { slug: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {MOTIFS[slug] ?? SUN}
    </svg>
  );
}
