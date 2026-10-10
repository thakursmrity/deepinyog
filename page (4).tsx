import Link from "next/link";
import { BuyButton } from "@/components/BuyButton";
import { getAccess } from "@/lib/access";
import { requireStudent } from "@/lib/auth";
import { firstName, formatDate } from "@/lib/format";
import { inr } from "@/lib/money";

export const metadata = { title: "Membership | Deepinyog" };

type Plan = { id: string; kind: "membership" | "coaching"; name: string; description: string; price_paise: number; duration_days: number | null; sessions: number | null };

// Only reachable when signed in. New members land here right after signing up.
export default async function Membership({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { supabase, profile } = await requireStudent();
  const [{ data }, access] = await Promise.all([
    supabase.from("plans").select("id, kind, name, description, price_paise, duration_days, sessions").eq("active", true).order("sort"),
    getAccess(supabase, profile.id),
  ]);
  const plans = (data ?? []) as Plan[];
  const memberships = plans.filter((p) => p.kind === "membership");
  const coaching = plans.filter((p) => p.kind === "coaching");

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 720 }}>
        {welcome ? (
          <>
            <p className="eyebrow">Welcome, {firstName(profile.full_name)}</p>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 44px)", lineHeight: 1.1 }}>I&apos;m so glad you&apos;re here</h1>
            <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.6 }}>
              Your practice space is ready. You can begin right away, or choose a membership to open the full library.
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">Membership</p>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 44px)", lineHeight: 1.1 }}>Practise your way</h1>
            <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.6 }}>
              Membership opens the full library across body, breath, mind and soul, with new practices every week.
            </p>
          </>
        )}
        {access.memberUntil ? (
          <p className="pill" style={{ alignSelf: "flex-start", fontSize: 15 }}>You&apos;re a member until {formatDate(access.memberUntil)}</p>
        ) : null}
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ fontSize: 26 }}>Begin now</h2>
          <p style={{ color: "var(--soft)", lineHeight: 1.6 }}>
            Start with the practices already open to you, keep your streak going, and explore every topic.
          </p>
          <div style={{ marginTop: "auto" }}>
            <Link className="btn btn-outline" href="/app">Go to my practice</Link>
          </div>
        </div>
        {memberships.map((p, i) => {
          const highlight = i === memberships.length - 1;
          return (
            <div
              key={p.id}
              className="card"
              style={{ display: "flex", flexDirection: "column", gap: 12, borderColor: highlight ? "var(--sun)" : undefined, background: highlight ? "linear-gradient(180deg, #fff7e8 0%, #ffffff 55%)" : "var(--surface)" }}
            >
              <h2 style={{ fontSize: 26 }}>{p.name}</h2>
              <p className="display" style={{ fontSize: 34 }}>
                {inr(p.price_paise)}
                <span style={{ fontSize: 16, fontFamily: "var(--font-body)" }}> for {p.duration_days} days</span>
              </p>
              <p style={{ color: "var(--soft)", lineHeight: 1.6 }}>{p.description}</p>
              <div style={{ marginTop: "auto" }}>
                <BuyButton
                  itemType="plan"
                  itemId={p.id}
                  signedIn
                  successPath="/app?welcome=member"
                  label={access.memberUntil ? "Extend membership" : "Choose this"}
                />
              </div>
            </div>
          );
        })}
      </section>
      <p style={{ color: "var(--muted)" }}>
        Memberships are paid once for the period and don&apos;t renew on their own. Extending early adds the days on top.
      </p>

      {coaching.length > 0 ? (
        <section id="coaching" style={{ display: "flex", flexDirection: "column", gap: 20, scrollMarginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 680 }}>
            <h2 style={{ fontSize: 32 }}>1:1 guidance with me</h2>
            <p style={{ color: "var(--soft)", lineHeight: 1.6 }}>
              Private sessions with a plan built around your goals, body and schedule. After you book, I&apos;ll reach out to fix our session times.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {coaching.map((p) => (
              <div key={p.id} className="card" style={{ background: "var(--sand)", borderColor: "var(--sand-line)", display: "flex", flexDirection: "column", gap: 12 }}>
                <h3 style={{ fontSize: 24 }}>{p.name}</h3>
                <p className="display" style={{ fontSize: 30 }}>{inr(p.price_paise)}</p>
                <p style={{ color: "var(--soft)", lineHeight: 1.6 }}>{p.description}</p>
                <div style={{ marginTop: "auto" }}>
                  <BuyButton itemType="plan" itemId={p.id} signedIn successPath="/app/account?welcome=coaching" label="Book sessions" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
