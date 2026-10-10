"use client";

import { useActionState } from "react";
import { createCategory, updateCategory, type FormState } from "../actions";

export type CategoryInput = {
  id?: string;
  grp: string;
  title: string;
  tagline?: string;
  highlights?: string;
  summary: string;
  guidance: string;
  caution: string;
  sort: number;
  active: boolean;
};

export function CategoryForm({ category }: { category?: CategoryInput; groups?: string[] }) {
  const action = category?.id ? updateCategory.bind(null, category.id) : createCategory;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const c = category;

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="form-grid">
        <input type="hidden" name="grp" value={c?.grp || "Programs"} />
        <label className="field"><span>Title</span><input name="title" defaultValue={c?.title} required /></label>
        <label className="field"><span>Order</span><input name="sort" type="number" defaultValue={c?.sort ?? 100} /></label>
      </div>
      <label className="field"><span>Short line under the title</span><input name="tagline" defaultValue={c?.tagline ?? ""} placeholder="For example: Strength, ease and balance" /></label>
      <label className="field"><span>Introduction</span><textarea name="summary" defaultValue={c?.summary} /></label>
      <label className="field">
        <span>This can help with</span>
        <textarea name="highlights" defaultValue={c?.highlights ?? ""} placeholder={"One per line, for example\nBack and neck pain\nBetter sleep"} />
        <small>One item per line.</small>
      </label>
      <label className="field"><span>How we practise</span><textarea name="guidance" defaultValue={c?.guidance} /></label>
      <label className="field"><span>Take care (shown in a highlighted box)</span><textarea name="caution" defaultValue={c?.caution} /></label>
      {c?.id ? (
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" name="active" defaultChecked={c.active} style={{ width: 20, height: 20 }} />
          Show on the website
        </label>
      ) : null}
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      {state.ok ? <p className="success" role="status">{state.ok}</p> : null}
      <button className="btn btn-small" type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Saving" : c?.id ? "Save" : "Add program"}
      </button>
    </form>
  );
}
