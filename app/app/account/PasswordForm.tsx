"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PasswordForm() {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 8) return setMessage({ ok: false, text: "Use at least 8 characters." });
    if (password !== confirm) return setMessage({ ok: false, text: "The two passwords don't match." });

    setPending(true);
    const { error } = await createClient().auth.updateUser({ password });
    setPending(false);
    if (error) setMessage({ ok: false, text: error.message });
    else {
      setMessage({ ok: true, text: "Password updated." });
      formEl.reset();
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>
      <label className="field">
        <span>New password</span>
        <input name="password" type="password" autoComplete="new-password" required minLength={8} />
      </label>
      <label className="field">
        <span>Repeat new password</span>
        <input name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </label>
      {message ? (
        <p className={message.ok ? "success" : "error"} role="status">
          {message.text}
        </p>
      ) : null}
      <button className="btn" type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Saving" : "Change password"}
      </button>
    </form>
  );
}
