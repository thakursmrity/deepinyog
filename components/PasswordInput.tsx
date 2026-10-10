"use client";

import { useState, type InputHTMLAttributes } from "react";

// A password box with an eye button to show or hide what was typed.
export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [shown, setShown] = useState(false);

  return (
    <div style={{ position: "relative", display: "flex" }}>
      <input {...props} type={shown ? "text" : "password"} style={{ flex: 1, minWidth: 0, paddingRight: 48, ...props.style }} />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        title={shown ? "Hide password" : "Show password"}
        style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, border: 0, background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
          {shown ? <path d="M4 4l16 16" /> : null}
        </svg>
      </button>
    </div>
  );
}
