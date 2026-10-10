import Link from "next/link";
import { BuyButton } from "@/components/BuyButton";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { getAccess } from "@/lib/access";
import { formatDate } from "@/lib/format";
import { inr } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Membership and coaching | Deepinyog" };
export const dynamic = "force-dynamic";

type Plan = { id: string; kind: "membership" | "coaching"; name: string; description: string; price_paise: number; duration_days: number | null; sessions: number | null };

export default async function Pricing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase.from("plans").select("id, kind, name, description, price_paise, duration_days, sessions").eq("active", true).order("sort");
  const plans = (data ?? []) as Plan[];
  const access = user ? await getAccess(supabase, user.id) : null;

  const memberships = plans.filter((p) => p.kind === "membership");
  const coaching = plans.filter((p) => p.kind === "coaching");

  return (
    <>
      <PublicHeader />
      <main className="container" style={{ paddingTop: 40, paddingBottom: 88, display: "flex", flexDirection: "column", gap: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 680 }}>
          <p className="eyebrow">Membership</p>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 52px)", lineHeight: 1.1 }}>Practice your way</h1>
          <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.6 }}>
            Start free. Become a member when you want the full library and live classes. Add personal coaching whenever you need it.
          </p>
          {access?.memberUntil ? (
            <p className="pill" style={{ alignSelf: "flex-start", fontSize: 15 }}>You&apos;re a member until {formatDate(access.memberUntil)}</p>
          ) : null}
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ fontSize: 28 }}>Free</h2>
            <p className="display" style={{ fontSize: 36 }}>{inr(0)}</p>
            <ul style={{ margin: 0, paddingLeft: 20, color: "var(--soft)", lineHeight: 1.8 }}>
              <li>Free practice videos</li>
              <li>Streaks and progress tracking</li>
              <li>A look inside every course</li>
            </ul>
            <div style={{ marginTop: "auto" }}>
              {user ? <Link className="btn btn-outline" href="/app/library">Go to library</Link> : <Link className="btn btn-outline" href="/signup?next=/app/library">Start free</Link>}
            </div>
          </div>
          {memberships.map((p, i) => (
            <div key={p.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 14, borderColor: i === memberships.length - 1 ? "var(--sun)" : undefined, background: i === memberships.length - 1 ? "linear-gradient(180deg, #fff7e8 0%, #ffffff 55%)" : "var(--surface)" }}>
              <h2 style={{ fontSize: 28 }}>{p.name}</h2>
              <p className="display" style={{ fontSize: 36 }}>
                {inr(p.price_paise)}
                <span style={{ fontSize: 16, fontFamily: "var(--font-body)" }}> for {p.duration_days} days</span>
              </p>
              <p style={{ lineHeight: 1.6, opacity: 0.9 }}>{p.description}</p>
              <div style={{ marginTop: "auto" }}>
                <BuyButton
                  itemType="plan"
                  itemId={p.id}
                  signedIn={Boolean(user)}
                  successPath="/app?welcome=member"
                  label={access?.memberUntil ? "Extend membership" : "Become a member"}
                  className="btn"
                />
              </div>
            </div>
          ))}
        </section>
        <p style={{ color: "var(--muted)", marginTop: -32 }}>
          Memberships are paid once for the period and don&apos;t renew on their own. Buying again before it ends adds the days on top.
        </p>

        {coaching.length > 0 ? (
          <section id="coaching" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 680 }}>
              <p className="eyebrow">1-on-1 coaching</p>
              <h2 style={{ fontSize: 40 }}>Personal guidance, just for you</h2>
              <p style={{ fontSize: 17, color: "var(--soft)", lineHeight: 1.6 }}>
                Private sessions with a plan built around your goals, body and schedule. After buying, you&apos;ll be contacted to fix your session times.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
              {coaching.map((p) => (
                <div key={p.id} className="card" style={{ background: "var(--sand)", display: "flex", flexDirection: "column", gap: 12 }}>
                  <h3 style={{ fontSize: 26 }}>{p.name}</h3>
                  <p className="display" style={{ fontSize: 32 }}>{inr(p.price_paise)}</p>
                  <p style={{ color: "var(--soft)", lineHeight: 1.6 }}>{p.description}</p>
                  <div style={{ marginTop: "auto" }}>
                    <BuyButton itemType="plan" itemId={p.id} signedIn={Boolean(user)} successPath="/app/account?welcome=coaching" label="Book coaching" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <PublicFooter />
    </>
  );
}
