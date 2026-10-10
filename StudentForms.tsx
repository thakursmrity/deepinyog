"use client";

import { useActionState, useState, useTransition } from "react";
import { resetStudentPassword, updateStudent, type FormState } from "../../actions";

type Student = { id: string; full_name: string; phone: string | null; plan: string; goals: string; health_notes: string; active: boolean };

export function EditStudentForm({ student }: { student: Student }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateStudent.bind(null, student.id), {});

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="form-grid">
        <label className="field"><span>Full name</span><input name="full_name" defaultValue={student.full_name} required /></label>
        <label className="field"><span>Phone</span><input name="phone" type="tel" defaultValue={student.phone ?? ""} /></label>
        <label className="field">
          <span>Plan</span>
          <select name="plan" defaultValue={student.plan}>
            <option>Group</option>
            <option>1-on-1</option>
            <option>Meditation</option>
          </select>
        </label>
      </div>
      <label className="field"><span>Goals</span><input name="goals" defaultValue={student.goals} /></label>
      <label className="field"><span>Health notes (only you see this)</span><textarea name="health_notes" defaultValue={student.health_notes} /></label>
      <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input type="checkbox" name="active" defaultChecked={student.active} style={{ width: 20, height: 20 }} />
        Active student
      </label>
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      {state.ok ? <p className="success" role="status">{state.ok}</p> : null}
      <button className="btn" type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Saving" : "Save changes"}
      </button>
    </form>
  );
}

export function ResetPassword({ studentId }: { studentId: string }) {
  const [result, setResult] = useState<FormState | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button
        type="button"
        className="btn btn-outline btn-small"
        disabled={pending}
        style={{ alignSelf: "flex-start" }}
        onClick={() => {
          if (!confirm("Create a new password for this student? Their old one will stop working.")) return;
          startTransition(async () => setResult(await resetStudentPassword(studentId)));
        }}
      >
        {pending ? "Creating" : "Create a new password"}
      </button>
      {result?.password ? (
        <p>New password: <strong style={{ letterSpacing: 1 }}>{result.password}</strong> (share it with the student now)</p>
      ) : null}
      {result?.error ? <p className="error">{result.error}</p> : null}
    </div>
  );
}
