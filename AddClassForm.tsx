"use client";

import { useActionState, useState } from "react";
import { addClass, type FormState } from "../actions";

export function AddClassForm({ students }: { students: { id: string; full_name: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addClass, {});
  const [kind, setKind] = useState("Group");

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="form-grid">
        <label className="field"><span>Class name</span><input name="title" required placeholder="For example: Hatha flow" /></label>
        <label className="field">
          <span>Type</span>
          <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option>Group</option>
            <option>1-on-1</option>
            <option>Meditation</option>
          </select>
        </label>
        {kind === "1-on-1" ? (
          <label className="field">
            <span>Student</span>
            <select name="student_id" required defaultValue="">
              <option value="" disabled>Pick a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="field"><span>Date</span><input name="date" type="date" required /></label>
        <label className="field"><span>Time (India)</span><input name="time" type="time" required /></label>
        <label className="field"><span>Minutes</span><input name="duration" type="number" min={10} max={240} defaultValue={60} /></label>
      </div>
      <label className="field"><span>Meeting link</span><input name="meeting_link" type="url" placeholder="Zoom or Google Meet link" /></label>
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      {state.ok ? <p className="success" role="status">{state.ok}</p> : null}
      <button className="btn" type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Adding" : "Add class"}
      </button>
    </form>
  );
}
