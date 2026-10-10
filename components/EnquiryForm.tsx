"use client";

import { useActionState } from "react";
import { submitEnquiry, type EnquiryState } from "@/app/enquiry";
import { ENQUIRY_INTERESTS } from "@/lib/content";

export function EnquiryForm({ defaultInterest }: { defaultInterest?: string }) {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, {});

  if (state.ok) {
    return (
      <div style={{ background: "var(--ground)", color: "var(--ink)", borderRadius: 20, padding: 28 }}>
        <p className="display" style={{ fontSize: 26, marginBottom: 6 }}>Thank you</p>
        <p style={{ color: "var(--soft)" }}>Your message has reached me. I&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form action={action} style={{ background: "var(--ground)", color: "var(--ink)", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="form-grid">
        <label className="field"><span>Your name</span><input name="name" required autoComplete="name" /></label>
        <label className="field"><span>Phone or email</span><input name="contact" required autoComplete="email" /></label>
      </div>
      <label className="field">
        <span>Interested in</span>
        <select name="interest" defaultValue={defaultInterest && ENQUIRY_INTERESTS.includes(defaultInterest) ? defaultInterest : ENQUIRY_INTERESTS[0]}>
          {ENQUIRY_INTERESTS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Anything to share</span>
        <textarea name="message" placeholder="Your goals, timings that suit you, or anything I should know" />
      </label>
      <label aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        Leave this empty<input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      <button className="btn" type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Sending" : "Send message"}
      </button>
    </form>
  );
}
