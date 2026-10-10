import { LINKS, external } from "@/lib/links";

type Network = "instagram" | "youtube" | "facebook";

// Simple line icons that hint at each platform: a camera, a play button, a speech bubble.
function Icon({ network }: { network: Network }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (network === "instagram") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
      </svg>
    );
  }
  if (network === "youtube") {
    return (
      <svg {...common}>
        <rect x="2.5" y="5" width="19" height="14" rx="4" />
        <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5z" />
    </svg>
  );
}

const NAMES: Record<Network, string> = { instagram: "Instagram", youtube: "YouTube", facebook: "Facebook" };

// A link to one of Deepinyog's channels, with its icon. Opens in a new tab.
export function SocialLink({ network, label }: { network: Network; label?: string }) {
  return (
    <a href={LINKS[network]} {...external} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
      <Icon network={network} />
      <span>{label ?? NAMES[network]}</span>
    </a>
  );
}
