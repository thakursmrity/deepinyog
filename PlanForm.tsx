"use client";

import { useActionState } from "react";
import { updatePlan, type FormState } from "../actions";

export type PlanRow = {
  id: string;
  kind: "membership" | "coaching";
  name: string;
  description: string;
  price_paise: number;
  duration_days: number | null;
  sessions: number | null;
  active: boolean;
};

export function PlanForm({ plan }: { plan: PlanRow }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updatePlan.bind(null, plan.id), {});
  return (
    <form action={action} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="form-grid">
        <label className="field"><span>Name</span><input name="name" defaultValue={plan.name} required /></label>
        <label className="field"><span>Price (Rs)</span><input name="price" inputMode="decimal" defaultValue={String(plan.price_paise / 100)} required /></label>
        {plan.kind === "membership" ? (
          <label className="field"><span>Length (days)</span><input name="duration_days" type="number" min={1} defaultValue={plan.duration_days ?? 30} /></label>
        ) : (
          <label className="field"><span>Sessions</span><input name="sessions" type="number" min={1} defaultValue={plan.sessions ?? 4} /></label>
        )}
      </div>
      <label className="field"><span>Description</span><textarea name="description" defaultValue={plan.description} /></label>
      <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input type="checkbox" name="active" defaultChecked={plan.active} style={{ width: 20, height: 20 }} />
        Show on the website
      </label>
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      {state.ok ? <p className="success" role="status">{state.ok}</p> : null}
      <button className="btn btn-small" type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>{pending ? "Saving" : "Save"}</button>
    </form>
  );
}
