"use client";

import { useActionState } from "react";
import { createCategory, updateCategory, type FormState } from "../actions";

export type CategoryInput = {
  id?: string;
  grp: string;
  title: string;
  summary: string;
  guidance: string;
  caution: string;
  sort: number;
  active: boolean;
};

export function CategoryForm({ category, groups }: { category?: CategoryInput; groups: string[] }) {
  const action = category?.id ? updateCategory.bind(null, category.id) : createCategory;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const c = category;
  const listId = `groups-${c?.id ?? "new"}`;

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="form-grid">
        <label className="field">
          <span>Group</span>
          <input name="grp" list={listId} defaultValue={c?.grp} required placeholder="Pick or type a new group" />
          <datalist id={listId}>
            {groups.map((g) => <option key={g} value={g} />)}
          </datalist>
        </label>
        <label className="field"><span>Title</span><input name="title" defaultValue={c?.title} required /></label>
        <label className="field"><span>Order</span><input name="sort" type="number" defaultValue={c?.sort ?? 100} /></label>
      </div>
      <label className="field"><span>One-line summary</span><input name="summary" defaultValue={c?.summary} /></label>
      <label className="field"><span>How to practise</span><textarea name="guidance" defaultValue={c?.guidance} /></label>
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
        {pending ? "Saving" : c?.id ? "Save" : "Add topic"}
      </button>
    </form>
  );
}
