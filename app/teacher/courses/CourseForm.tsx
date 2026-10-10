"use client";

import { useActionState } from "react";
import { createCourse, updateCourse, type FormState } from "../actions";

export type CourseInput = {
  id?: string;
  title: string;
  summary: string;
  description: string;
  status: string;
  price_paise: number;
  early_bird_price_paise: number | null;
  early_bird_until: string | null;
  starts_on: string | null;
  included_in_membership: boolean;
  kind?: string;
  schedule?: string;
  hosts?: string;
  register_url?: string | null;
};

const rupees = (p: number | null) => (p == null ? "" : String(p / 100));

export function CourseForm({ course }: { course?: CourseInput }) {
  const action = course?.id ? updateCourse.bind(null, course.id) : createCourse;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const c = course;

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="form-grid">
        <label className="field">
          <span>Type</span>
          <select name="kind" defaultValue={c?.kind ?? "course"}>
            <option value="course">Course (recorded lessons)</option>
            <option value="program">Live program (several sessions)</option>
            <option value="workshop">Workshop (one session)</option>
          </select>
        </label>
        <label className="field" style={{ gridColumn: "span 2" }}><span>Title</span><input name="title" required defaultValue={c?.title} placeholder="For example: BackYourBack" /></label>
      </div>
      <label className="field"><span>One-line summary</span><input name="summary" defaultValue={c?.summary} /></label>
      <div className="form-grid">
        <label className="field"><span>When (shown as written)</span><input name="schedule" defaultValue={c?.schedule ?? ""} placeholder="12 to 14 Oct, 7:00 to 8:30 AM IST, online" /></label>
        <label className="field"><span>With (co-hosts)</span><input name="hosts" defaultValue={c?.hosts ?? ""} placeholder="Dr. Rohit Sabharwal" /></label>
      </div>
      <label className="field">
        <span>Outside registration link (optional)</span>
        <input name="register_url" type="url" defaultValue={c?.register_url ?? ""} placeholder="https://forms.gle/..." />
        <small>For programs with no fee that register elsewhere, like a Google Form. Leave empty to let people join on this site.</small>
      </label>
      <label className="field">
        <span>Description</span>
        <textarea name="description" defaultValue={c?.description} style={{ minHeight: 140 }} placeholder="Who it's for, what they'll learn, how it runs" />
      </label>
      <div className="form-grid">
        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={c?.status ?? "upcoming"}>
            <option value="upcoming">Upcoming (waitlist)</option>
            <option value="open">Open for enrollment</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <label className="field"><span>Price (Rs)</span><input name="price" inputMode="decimal" defaultValue={rupees(c?.price_paise ?? 99900)} /><small>0 means no fee.</small></label>
        <label className="field"><span>Early-bird price (Rs)</span><input name="early_bird_price" inputMode="decimal" defaultValue={rupees(c?.early_bird_price_paise ?? null)} /></label>
        <label className="field"><span>Early-bird ends</span><input name="early_bird_until" type="date" defaultValue={c?.early_bird_until ?? ""} /></label>
        <label className="field"><span>Starts on</span><input name="starts_on" type="date" defaultValue={c?.starts_on ?? ""} /></label>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input type="checkbox" name="included_in_membership" defaultChecked={c?.included_in_membership ?? false} style={{ width: 20, height: 20 }} />
        Members get this course included
      </label>
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      {state.ok ? <p className="success" role="status">{state.ok}</p> : null}
      <button className="btn" type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Saving" : c?.id ? "Save course" : "Create course"}
      </button>
    </form>
  );
}
