import Link from "next/link";
import { EnquiryForm } from "@/components/EnquiryForm";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { PHOTOS, TEACHER } from "@/lib/content";
import { SocialLink } from "@/components/SocialLink";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Connect | Deepinyog" };
export const dynamic = "force-dynamic";

const OPTIONS = ["A question", "A one-on-one conversation with me", "A program for my team or school", "Something else"];

export default async function Connect({ searchParams }: { searchParams: Promise<{ interest?: string }> }) {
  const { interest } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const signedIn = Boolean(auth.user);

  return (
    <>
      <PublicHeader />
      <main>
        <section style={{ background: "linear-gradient(180deg, #fff 0%, var(--saffron-mist) 100%)" }}>
          <div className="container" style={{ paddingTop: 56, paddingBottom: 96, display: "flex", flexWrap: "wrap", gap: 56, alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 340px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
              <p className="eyebrow" style={{ color: "var(--saffron-ink)" }}>Connect</p>
              <h1 style={{ fontSize: "clamp(40px, 5.5vw, 60px)", lineHeight: 1.05 }}>Let&apos;s talk</h1>
              <p style={{ fontSize: 19, lineHeight: 1.65, color: "var(--soft)", margin: 0, maxWidth: "26em" }}>
                Not sure where to start? Tell me a little about yourself, and I&apos;ll guide you to what will help.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "#fff", borderRadius: 20, padding: "18px 20px" }}>
                  <p style={{ fontWeight: 600, margin: "0 0 4px" }}>Have a question?</p>
                  <p style={{ color: "var(--soft)", margin: 0, lineHeight: 1.55 }}>About a program, your health, or how to begin. I read every message myself.</p>
                </div>
                <div style={{ background: "var(--sage)", borderRadius: 20, padding: "18px 20px" }}>
                  <p style={{ fontWeight: 600, margin: "0 0 4px" }}>A one-on-one conversation</p>
                  <p style={{ color: "var(--soft)", margin: 0, lineHeight: 1.55 }}>We talk about your body, your routine and your goals, and decide together what will help.</p>
                </div>
                <div style={{ background: "var(--blush-soft)", borderRadius: 20, padding: "18px 20px" }}>
                  <p style={{ fontWeight: 600, margin: "0 0 4px" }}>For teams and schools</p>
                  <p style={{ color: "var(--soft)", margin: 0, lineHeight: 1.55 }}>Workplace wellness and kids yoga sessions, shaped around your group.</p>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
                <SocialLink network="instagram" label="Message me on Instagram" />
                <SocialLink network="youtube" label="My YouTube channel" />
                <SocialLink network="facebook" />
              </div>
            </div>
            <div style={{ flex: "1.2 1 400px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PHOTOS.profile} alt={TEACHER.name} style={{ width: 76, height: 76, borderRadius: 999, objectFit: "cover", border: "3px solid #fff", boxShadow: "0 6px 18px rgba(90, 63, 71, 0.15)", flexShrink: 0 }} />
                <p style={{ margin: 0, color: "var(--soft)" }}>Your message comes straight to me, {TEACHER.name}.</p>
              </div>
              <EnquiryForm key={interest ?? "default"} options={OPTIONS} defaultInterest={interest} />
              {signedIn ? null : (
                <p style={{ color: "var(--muted)", margin: 0 }}>
                  Want to practise with me between sessions? <Link href="/login?mode=register">Register</Link> to open your practice space.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
