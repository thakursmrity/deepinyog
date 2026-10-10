"use client";

import { useState, useTransition } from "react";
import { youtubeEmbed } from "@/lib/youtube";
import { markDone } from "./actions";

export function Player({
  src,
  youtubeId,
  assignmentId,
  videoId,
  done,
}: {
  src?: string;
  youtubeId?: string | null;
  assignmentId: string | null;
  videoId: string;
  done: boolean;
}) {
  const [isDone, setIsDone] = useState(done);
  const [pending, startTransition] = useTransition();

  function complete() {
    if (isDone) return;
    startTransition(async () => {
      await markDone(assignmentId, videoId);
      setIsDone(true);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {youtubeId ? (
        <iframe
          src={youtubeEmbed(youtubeId)}
          title="Practice video"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          style={{ width: "100%", aspectRatio: "16 / 9", border: 0, borderRadius: 16, background: "var(--leaf)" }}
        />
      ) : (
        <video src={src} controls playsInline preload="metadata" onEnded={complete} style={{ width: "100%", borderRadius: 16, background: "#000", maxHeight: "70vh" }} />
      )}
      <div>
        {isDone ? (
          <span className="pill">Marked as done</span>
        ) : (
          <button type="button" className="btn" onClick={complete} disabled={pending}>
            {pending ? "Saving" : "I finished this practice"}
          </button>
        )}
      </div>
    </div>
  );
}
