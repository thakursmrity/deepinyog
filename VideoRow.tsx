import Link from "next/link";
import { youtubeThumb } from "@/lib/youtube";

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function VideoRow({
  id,
  title,
  minutes,
  unlocked,
  lockedHref,
  lockedLabel,
  done = false,
  youtubeId = null,
}: {
  id: string;
  title: string;
  minutes: number | null;
  unlocked: boolean;
  lockedHref: string;
  lockedLabel: string;
  done?: boolean;
  youtubeId?: string | null;
}) {
  return (
    <div className="list-item" style={{ borderTop: "1px solid var(--hair)" }}>
      <div className="thumb" style={{ background: unlocked ? "var(--leaf)" : "var(--tint)", color: "var(--muted)", overflow: "hidden", position: "relative" }}>
        {youtubeId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={youtubeThumb(youtubeId)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : null}
        {unlocked ? null : <LockIcon />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 500 }}>{title}</p>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>{minutes ? `${minutes} min` : ""}</p>
      </div>
      {done ? <span className="pill">Done</span> : null}
      {unlocked ? (
        <Link className="btn btn-outline btn-small" href={`/app/videos/${id}`}>Watch</Link>
      ) : (
        <Link className="btn btn-small" href={lockedHref}>{lockedLabel}</Link>
      )}
    </div>
  );
}
