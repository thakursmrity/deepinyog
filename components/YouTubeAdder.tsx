"use client";

import { useActionState } from "react";
import { addYouTubeVideos, type FormState } from "@/app/teacher/actions";
import { CategoryPicker, type PickCategory } from "@/components/CategoryPicker";

// Paste one or many YouTube links. Titles are filled in automatically. These are always free videos.
export function YouTubeAdder({ categories = [], fixedCategoryId }: { categories?: PickCategory[]; fixedCategoryId?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addYouTubeVideos, {});

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <label className="field">
        <span>YouTube links</span>
        <textarea
          name="links"
          required
          style={{ minHeight: 110 }}
          placeholder={"Paste one link per line, for example\nhttps://youtu.be/..."}
        />
        <small>Use each video&apos;s Share link. Titles are added automatically, and you can rename them later. YouTube videos are always free to watch.</small>
      </label>
      {fixedCategoryId ? (
        <input type="hidden" name="category" value={fixedCategoryId} />
      ) : categories.length ? (
        <div className="field">
          <span>Topics they help with</span>
          <CategoryPicker categories={categories} />
        </div>
      ) : null}
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      {state.ok ? <p className="success" role="status">{state.ok}</p> : null}
      <button className="btn" type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Adding videos" : "Add YouTube videos"}
      </button>
    </form>
  );
}
