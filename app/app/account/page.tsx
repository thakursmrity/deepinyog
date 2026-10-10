import Link from "next/link";
import { MEMBERSHIP_ON } from "@/lib/features";
import { getAccess } from "@/lib/access";
import { requireStudent } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { inr } from "@/lib/money";
import { PasswordForm } from "./PasswordForm";

export default async function Account({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { supabase, profile } = await requireStudent();
  const [access, credits, payments, details] = await Promise.all([
    getAccess(supabase, profile.id),
    supabase.from("coaching_credits").select("id, sessions_total, sessions_used, created_at").eq("user_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("payments").select("id, item_name, amount_paise, status, paid_at, created_at").eq("user_id", profile.id).eq("status", "paid").order("paid_at", { ascending: false }),
    supabase.from("student_details").select("goals").eq("student_id", profile.id).maybeSingle(),
  ]);

  const sessionsLeft = (credits.data ?? []).reduce((n, c) => n + Math.max(0, c.sessions_total - c.sessions_used), 0);

  return (
    <>
      <h1 style={{ fontSize: 38 }}>{MEMBERSHIP_ON ? "Membership and account" : "My account"}</h1>
      {welcome === "coaching" ? (
        <p className="success" role="status">Your coaching pack is confirmed. You&apos;ll be contacted to set your session times.</p>
      ) : null}

      <div className="row">
        {MEMBERSHIP_ON || access.memberUntil ? (
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ fontSize: 24 }}>Membership</h2>
          {access.memberUntil ? (
            <>
              <p className="display" style={{ fontSize: 26 }}>Active until {formatDate(access.memberUntil)}</p>
              <p style={{ color: "var(--muted)" }}>Memberships don&apos;t renew on their own. Extend any time and the days are added on top.</p>
              {MEMBERSHIP_ON ? <Link className="btn btn-outline" href="/app/membership" style={{ alignSelf: "flex-start" }}>Extend membership</Link> : null}
            </>
          ) : (
            <>
              <p className="display" style={{ fontSize: 26 }}>Not a member yet</p>
              <p style={{ color: "var(--muted)" }}>Become a member to unlock the full library and member live classes.</p>
              <Link className="btn" href="/app/membership" style={{ alignSelf: "flex-start" }}>See membership</Link>
            </>
          )}
        </section>
        ) : null}

        <section className="card" style={{ background: "var(--sand)", display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ fontSize: 24 }}>One-on-one with me</h2>
          {(credits.data ?? []).length > 0 ? (
            <>
              <p className="display" style={{ fontSize: 26 }}>{sessionsLeft} {sessionsLeft === 1 ? "session" : "sessions"} left</p>
              <p style={{ color: "var(--sand-ink)" }}>We fix our session times together.</p>
            </>
          ) : (
            <p style={{ color: "var(--sand-ink)" }}>Personal sessions with a plan built for you.</p>
          )}
          <Link className="btn btn-outline" href="/connect" style={{ alignSelf: "flex-start" }}>
            Request a conversation
          </Link>
        </section>
      </div>

      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={{ fontSize: 24 }}>Payments</h2>
        {(payments.data ?? []).length === 0 ? <p style={{ color: "var(--muted)" }}>No payments yet.</p> : null}
        {(payments.data ?? []).map((p) => (
          <div key={p.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, borderTop: "1px solid var(--hair)", paddingTop: 10 }}>
            <span>{p.item_name}</span>
            <span style={{ color: "var(--muted)" }}>{inr(p.amount_paise)} · {formatDate(p.paid_at ?? p.created_at)}</span>
          </div>
        ))}
      </section>

      <section className="card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
        <div><p style={{ color: "var(--muted)", fontSize: 14 }}>Name</p><p style={{ fontWeight: 500 }}>{profile.full_name}</p></div>
        <div><p style={{ color: "var(--muted)", fontSize: 14 }}>Email</p><p style={{ fontWeight: 500 }}>{profile.email}</p></div>
        <div><p style={{ color: "var(--muted)", fontSize: 14 }}>Goals</p><p style={{ fontWeight: 500 }}>{details.data?.goals || "Not set yet"}</p></div>
      </section>

      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontSize: 24 }}>Change your password</h2>
        <PasswordForm />
      </section>
    </>
  );
}
