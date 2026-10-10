import Link from "next/link";
import { requireTeacher } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { inr } from "@/lib/money";
import { markSessionUsed } from "../actions";

type Person = { full_name: string; email: string | null };
const person = (p: Person | Person[] | null) => (Array.isArray(p) ? p[0] : p);

function monthStartIndia(offset = 0) {
  const now = new Date(Date.now() + 5.5 * 3600000);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1) - 5.5 * 3600000);
}

export default async function Sales() {
  const { supabase } = await requireTeacher();
  const thisMonth = monthStartIndia(0);
  const lastMonth = monthStartIndia(-1);
  const nowIso = new Date().toISOString();

  const [paid, members, credits, freeUsers] = await Promise.all([
    supabase.from("payments").select("id, item_type, item_name, amount_paise, paid_at, user_id, profiles(full_name, email)").eq("status", "paid").order("paid_at", { ascending: false }).limit(300),
    supabase.from("memberships").select("user_id").lte("starts_at", nowIso).gt("ends_at", nowIso),
    supabase.from("coaching_credits").select("id, user_id, sessions_total, sessions_used, created_at, profiles(full_name, email)").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
  ]);

  const rows = paid.data ?? [];
  const sum = (from: Date, to?: Date) =>
    rows.filter((r) => r.paid_at && new Date(r.paid_at) >= from && (!to || new Date(r.paid_at) < to)).reduce((n, r) => n + r.amount_paise, 0);
  const revenueThis = sum(thisMonth);
  const revenueLast = sum(lastMonth, thisMonth);
  const activeMembers = new Set((members.data ?? []).map((m) => m.user_id)).size;
  const accounts = freeUsers.count ?? 0;
  const openCredits = (credits.data ?? []).filter((c) => c.sessions_used < c.sessions_total);

  const byType = new Map<string, number>();
  for (const r of rows.filter((r) => r.paid_at && new Date(r.paid_at) >= thisMonth)) {
    const key = r.item_type === "course" ? "Courses" : r.item_name.toLowerCase().includes("coaching") ? "Coaching" : "Membership";
    byType.set(key, (byType.get(key) ?? 0) + r.amount_paise);
  }

  return (
    <>
      <h1 style={{ fontSize: 38 }}>Sales</h1>
      <div className="stats">
        <div className="stat"><p className="label">Earned this month</p><p className="num">{inr(revenueThis)}</p><p className="hint">Last month: {inr(revenueLast)}</p></div>
        <div className="stat"><p className="label">Active members</p><p className="num">{activeMembers}</p><p className="hint">of {accounts} student accounts</p></div>
        <div className="stat">
          <p className="label">This month by type</p>
          {byType.size === 0 ? <p className="hint">No sales yet this month</p> : null}
          {[...byType.entries()].map(([k, v]) => <p key={k} className="hint" style={{ fontSize: 15 }}>{k}: <strong>{inr(v)}</strong></p>)}
        </div>
        <div className="stat" style={{ background: "var(--sand)" }}>
          <p className="label" style={{ color: "var(--sand-ink)" }}>Coaching sessions owed</p>
          <p className="num">{openCredits.reduce((n, c) => n + c.sessions_total - c.sessions_used, 0)}</p>
          <p className="hint" style={{ color: "var(--sand-ink)" }}>across {new Set(openCredits.map((c) => c.user_id)).size} students</p>
        </div>
      </div>

      {openCredits.length > 0 ? (
        <section className="card" style={{ background: "var(--sand)", display: "flex", flexDirection: "column", gap: 8 }}>
          <h2 style={{ fontSize: 24 }}>Coaching to schedule</h2>
          {openCredits.map((c) => {
            const p = person(c.profiles as Person | Person[] | null);
            return (
              <div key={c.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, borderTop: "1px solid var(--sand-line)", paddingTop: 10 }}>
                <span>
                  <Link href={`/teacher/students/${c.user_id}`} style={{ fontWeight: 500 }}>{p?.full_name || p?.email}</Link> · {c.sessions_used} of {c.sessions_total} sessions done · bought {formatDate(c.created_at)}
                </span>
                <form action={markSessionUsed.bind(null, c.id, "/teacher/sales")}>
                  <button className="btn btn-small" type="submit">Mark one session done</button>
                </form>
              </div>
            );
          })}
        </section>
      ) : null}

      <section className="card" style={{ padding: "24px 24px 12px" }}>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>Payments</h2>
        {rows.length === 0 ? <p style={{ color: "var(--muted)", paddingBottom: 12 }}>Payments will appear here as soon as someone buys.</p> : (
          <div className="table-wrap">
            <table style={{ minWidth: 560 }}>
              <thead><tr><th>When</th><th>Who</th><th>What</th><th>Amount</th></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const p = person(r.profiles as Person | Person[] | null);
                  return (
                    <tr key={r.id}>
                      <td>{r.paid_at ? formatDateTime(r.paid_at) : ""}</td>
                      <td><Link href={`/teacher/students/${r.user_id}`}>{p?.full_name || p?.email}</Link></td>
                      <td>{r.item_name}</td>
                      <td>{inr(r.amount_paise)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
