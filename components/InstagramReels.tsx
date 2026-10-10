"use client";

import Script from "next/script";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

// Embeds her own Instagram reels using Instagram's official embed.
export function InstagramReels({ links }: { links: string[] }) {
  if (links.length === 0) return null;
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, alignItems: "start" }}>
        {links.map((url) => (
          <blockquote
            key={url}
            className="instagram-media"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            style={{ background: "#fff", border: "1px solid var(--hair)", borderRadius: 20, margin: 0, minWidth: 280, maxWidth: 540, width: "100%" }}
          >
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: 24, textAlign: "center" }}>
              Watch on Instagram
            </a>
          </blockquote>
        ))}
      </div>
      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" onLoad={() => window.instgrm?.Embeds.process()} />
    </>
  );
}
