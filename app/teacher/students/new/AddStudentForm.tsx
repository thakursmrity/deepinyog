"use client";

import { useActionState } from "react";
import { addStudent, type FormState } from "../../actions";

export function AddStudentForm({ defaults = { name: "", email: "", phone: "" } }: { defaults?: { name: string; email: string; phone: string } }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addStudent, {});

  if (state.password) {
    return (
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p className="success">{state.ok}</p>
        <p>Share these login details with the student. The password is shown only once; you can create a new one later from their page.</p>
        <div style={{ background: "var(--ground)", borderRadius: 12, padding: 18, fontSize: 17, lineHeight: 1.8 }}>
          <div>Website: <strong>{typeof window !== "undefined" ? window.location.host : "deepinyog.com"}/login</strong></div>
          <div>Email: <strong>{state.email}</strong></div>
          <div>Password: <strong style={{ letterSpacing: 1 }}>{state.password}</strong></div>
        </div>
        <a className="btn btn-outline" href="/teacher/students/new" style={{ alignSelf: "flex-start" }}>Add another student</a>
      </div>
    );
  }

  return (
    <form action={action} className="card" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="form-grid">
        <label className="field"><span>Full name</span><input name="full_name" required defaultValue={defaults.name} /></label>
        <label className="field"><span>Email</span><input name="email" type="email" required defaultValue={defaults.email} /><small>They sign in with this.</small></label>
        <label className="field"><span>Phone</span><input name="phone" type="tel" defaultValue={defaults.phone} /></label>
        <label className="field">
          <span>Plan</span>
          <select name="plan" defaultValue="Group">
            <option>Group</option>
            <option>1-on-1</option>
            <option>Meditation</option>
          </select>
        </label>
      </div>
      <label className="field"><span>Goals</span><input name="goals" placeholder="For example: posture, flexibility, better sleep" /></label>
      <label className="field">
        <span>Health notes</span>
        <textarea name="health_notes" placeholder="Injuries, conditions, or anything to be careful about" />
        <small>Only you can see this.</small>
      </label>
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      <button className="btn" type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Adding" : "Add student and create login"}
      </button>
    </form>
  );
}
