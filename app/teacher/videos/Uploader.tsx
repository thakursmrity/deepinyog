"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CategoryPicker, type PickCategory } from "@/components/CategoryPicker";
import { saveVideo } from "../actions";

// Supabase's free plan accepts files up to 50 MB per upload. Raise this if your plan allows more.
const MAX_MB = 50;

export function Uploader({
  courses,
  categories,
  preselected = [],
}: {
  courses: { id: string; title: string }[];
  categories: PickCategory[];
  preselected?: string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [access, setAccess] = useState("members");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const file = form.get("file");
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const duration = Number(form.get("duration")) || null;
    const courseId = String(form.get("course_id") ?? "") || null;
    const categoryIds = form.getAll("category").map(String);
    if (access === "course" && !courseId) return setStatus({ ok: false, text: "Pick the course this video belongs to." });

    if (!(file instanceof File) || file.size === 0) return setStatus({ ok: false, text: "Choose a video file." });
    if (!title) return setStatus({ ok: false, text: "Give the video a title." });
    if (file.size > MAX_MB * 1024 * 1024) {
      return setStatus({ ok: false, text: `This file is over ${MAX_MB} MB. Export it at 720p, or split it into shorter parts.` });
    }

    setBusy(true);
    setStatus({ ok: true, text: "Uploading. Keep this page open." });

    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await createClient().storage.from("videos").upload(path, file, {
      contentType: file.type || "video/mp4",
      upsert: false,
    });
    if (uploadError) {
      setBusy(false);
      return setStatus({ ok: false, text: `Upload failed: ${uploadError.message}` });
    }

    const { error } = await saveVideo({ title, description, duration, storagePath: path, access, courseId, categoryIds });
    setBusy(false);
    if (error) return setStatus({ ok: false, text: `Saved the file but not its details: ${error}` });

    formEl.reset();
    setStatus({ ok: true, text: "Video uploaded." });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="form-grid">
        <label className="field"><span>Title</span><input name="title" required /></label>
        <label className="field"><span>Length in minutes</span><input name="duration" type="number" min={1} max={300} /></label>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Who can watch</span>
          <select name="access" value={access} onChange={(e) => setAccess(e.target.value)}>
            <option value="free">Everyone with a free account</option>
            <option value="members">Members only</option>
            <option value="course">People in a course</option>
            <option value="assigned">Only students I assign it to</option>
          </select>
        </label>
        {access === "course" ? (
          <label className="field">
            <span>Course</span>
            <select name="course_id" defaultValue="">
              <option value="" disabled>{courses.length ? "Pick a course" : "Create a course first"}</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div className="field">
        <span>Topics it helps with</span>
        <CategoryPicker categories={categories} selected={preselected} />
      </div>
      <label className="field"><span>Description</span><textarea name="description" placeholder="What this practice helps with, and anything to be careful about" /></label>
      <label className="field">
        <span>Video file</span>
        <input name="file" type="file" accept="video/*" required />
        <small>MP4 works best. Up to {MAX_MB} MB.</small>
      </label>
      {status ? <p className={status.ok ? "success" : "error"} role="status">{status.text}</p> : null}
      <button className="btn" type="submit" disabled={busy} style={{ alignSelf: "flex-start" }}>
        {busy ? "Uploading" : "Upload video"}
      </button>
    </form>
  );
}
