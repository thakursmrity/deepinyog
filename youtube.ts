// Pulls the 11-character video id out of any common YouTube link.
export function youtubeId(input: string): string | null {
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  try {
    const url = new URL(s.startsWith("http") ? s : `https://${s}`);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return clean(url.pathname.slice(1));
    if (host === "youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com") {
      if (url.searchParams.get("v")) return clean(url.searchParams.get("v")!);
      const m = url.pathname.match(/^\/(shorts|embed|live|v)\/([^/?#]+)/);
      if (m) return clean(m[2]);
    }
  } catch {
    return null;
  }
  return null;
}

function clean(id: string) {
  const m = id.match(/^[A-Za-z0-9_-]{11}/);
  return m ? m[0] : null;
}

export function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

export function youtubeEmbed(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}

// Public title lookup, no API key needed. Falls back to null if YouTube doesn't answer.
export async function youtubeTitle(id: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title?.trim() || null;
  } catch {
    return null;
  }
}
