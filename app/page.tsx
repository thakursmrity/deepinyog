import Link from "next/link";
import { COURSE_FIELDS, CourseCard, type CourseRow } from "@/components/CourseCard";
import { EnquiryForm } from "@/components/EnquiryForm";
import { InstagramReels } from "@/components/InstagramReels";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { CATEGORY_FIELDS, GROUP_BLURB, PILLARS, groupCategories, type Category } from "@/lib/categories";
import { ABOUT, CLASSES, INSTAGRAM_REELS, PHOTOS, TEACHER } from "@/lib/content";
import { LINKS, external } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const OFFERS = [
  { title: "Free account", body: "Free practices from her YouTube library, your streak and progress, and a look inside every program.", href: "/signup", cta: "Start free" },
  { title: "Membership", body: "The full library across body, breath, mind and soul, with new practices every week.", href: "/pricing", cta: "See membership" },
  { title: "1-on-1 guidance", body: "Personal yoga therapy, Marma care or life coaching, built around you.", href: "/pricing#coaching", cta: "See coaching" },
  { title: "For teams", body: "Yoga, breathwork and stress care for workplaces, schools and groups.", href: "#join", cta: "Ask about team sessions" },
];

export default async function Home() {
  const supabase = await createClient();
  const [{ data: cats }, { data: progs }] = await Promise.all([
    supabase.from("categories").select(CATEGORY_FIELDS).eq("active", true),
    supabase.from("courses").select(COURSE_FIELDS).in("status", ["open", "upcoming"]).order("starts_on", { ascending: true, nullsFirst: false }).limit(3),
  ]);
  const groups = groupCategories((cats ?? []) as Category[]);
  const byName = new Map(groups.map((g) => [g.name, g.items]));
  const programs = (progs ?? []) as CourseRow[];

  return (
    <>
      <PublicHeader />

      <main>
        {/* Hero: her photo, tagline, credentials */}
        <section className="container" style={{ paddingTop: 40, paddingBottom: 72, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 48 }}>
          <div style={{ flex: "1 1 440px", minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
            <p className="eyebrow">{TEACHER.focus} with {TEACHER.name}</p>
            <h1 style={{ fontSize: "clamp(42px, 6vw, 66px)", lineHeight: 1.06 }}>{TEACHER.tagline}</h1>
            <p style={{ fontSize: 19, lineHeight: 1.65, color: "var(--soft)", maxWidth: 540 }}>
              Holistic wellness for mind, body and soul. Yoga, breathwork, meditation and healing practices to help you move with ease, find calm, and come home to yourself.
            </p>
            <ul aria-label="Credentials" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TEACHER.credentials.slice(0, 3).map((c) => (
                <li key={c} className="pill" style={{ fontSize: 13.5, padding: "6px 12px" }}>{c}</li>
              ))}
            </ul>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              <Link className="btn" href="/signup">Start free</Link>
              <Link className="btn btn-outline" href="/practice">Explore practices</Link>
            </div>
          </div>
          <div style={{ flex: "1 1 340px", minWidth: 0, display: "flex", justifyContent: "center", position: "relative" }}>
            <div aria-hidden="true" className="sun-glow" style={{ position: "absolute", width: "110%", aspectRatio: "1 / 1", top: "-12%", left: "-5%", opacity: 0.8, pointerEvents: "none" }} />
            <div style={{ position: "relative", width: "100%", maxWidth: 440, aspectRatio: "4 / 5", borderRadius: "220px 220px 28px 28px", overflow: "hidden", border: "8px solid #fff", boxShadow: "var(--shadow)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={PHOTOS.hero} alt={`${TEACHER.name} meditating beside a mountain river`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "70% center" }} />
            </div>
          </div>
        </section>

        {/* Mind, body, soul */}
        <section className="wash">
          <div className="container" style={{ paddingTop: 72, paddingBottom: 72, display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 680 }}>
              <p className="eyebrow">Mind, body and soul</p>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)" }}>What would you like to nurture today?</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20 }}>
              {PILLARS.map((p, i) => (
                <div key={p.name} className="card" style={{ display: "flex", flexDirection: "column", gap: 16, padding: 26, background: i === 0 ? "var(--blush-soft)" : i === 1 ? "#f3f8f1" : "#fffaf0" }}>
                  <div>
                    <h3 style={{ fontSize: 30 }}>{p.name}</h3>
                    <p style={{ color: "var(--saffron-ink)", fontWeight: 500 }}>{p.line}</p>
                  </div>
                  {p.groups.map((g) =>
                    byName.get(g)?.length ? (
                      <div key={g} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--muted)" }}>{g}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {byName.get(g)!.map((c) => (
                            <Link key={c.id} className="chip" href={`/practice/${c.slug}`}>{c.title}</Link>
                          ))}
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>
              ))}
            </div>
            {byName.get("Women and family")?.length ? (
              <div className="card" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, padding: "20px 24px" }}>
                <div style={{ flex: "1 1 220px" }}>
                  <h3 style={{ fontSize: 22 }}>Women and family</h3>
                  <p style={{ color: "var(--muted)" }}>{GROUP_BLURB["Women and family"]}</p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {byName.get("Women and family")!.map((c) => (
                    <Link key={c.id} className="chip" href={`/practice/${c.slug}`}>{c.title}</Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Programs and workshops */}
        {programs.length > 0 ? (
          <section className="container" style={{ paddingTop: 80, paddingBottom: 24, display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p className="eyebrow">Programs and workshops</p>
                <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)" }}>Join a live program</h2>
              </div>
              <Link href="/courses" style={{ fontWeight: 500 }}>See all programs</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {programs.map((c) => <CourseCard key={c.id} c={c} />)}
            </div>
          </section>
        ) : null}

        {/* Ways to practise */}
        <section className="container" style={{ paddingTop: 80, paddingBottom: 80, display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p className="eyebrow">Ways to practise</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)" }}>Start free, go deeper when you&apos;re ready</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {OFFERS.map((o) => (
              <div key={o.title} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <h3 style={{ fontSize: 24 }}>{o.title}</h3>
                <p style={{ color: "var(--soft)", lineHeight: 1.6 }}>{o.body}</p>
                <Link href={o.href} style={{ marginTop: "auto", fontWeight: 500 }}>{o.cta}</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Nature band */}
        <section aria-hidden="true" className="container">
          <div style={{ borderRadius: 28, overflow: "hidden", aspectRatio: "21 / 8", border: "1px solid var(--hair)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTOS.nature} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
          </div>
        </section>

        {/* About */}
        <section id="about" className="container" style={{ paddingTop: 80, paddingBottom: 80, display: "flex", flexWrap: "wrap", gap: 56, alignItems: "center" }}>
          <div style={{ flex: "1 1 300px", minWidth: 0, maxWidth: 380, aspectRatio: "4 / 5", borderRadius: "190px 190px 28px 28px", overflow: "hidden", border: "8px solid #fff", boxShadow: "var(--shadow)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ABOUT.photo} alt={`${TEACHER.name} in a yoga pose`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%" }} />
          </div>
          <div style={{ flex: "1 1 440px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <p className="eyebrow">About</p>
            <h2 style={{ fontSize: 44, lineHeight: 1.15 }}>Meet {TEACHER.name}</h2>
            {ABOUT.paragraphs.map((p) => (
              <p key={p} style={{ fontSize: 18, lineHeight: 1.75, color: "var(--soft)" }}>{p}</p>
            ))}
            <ul style={{ listStyle: "none", margin: "6px 0 0", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              {TEACHER.credentials.map((c) => (
                <li key={c} style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 500 }}>
                  <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 999, background: "var(--sun)", boxShadow: "0 0 0 4px var(--glow)", flexShrink: 0 }} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Live classes */}
        <section id="classes" className="wash">
          <div className="container" style={{ paddingTop: 72, paddingBottom: 72, display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p className="eyebrow">Live classes</p>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)" }}>Practise together, live</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {CLASSES.map((c) => (
                <div key={c.title} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <h3 style={{ fontSize: 24 }}>{c.title}</h3>
                  <p style={{ lineHeight: 1.6, color: "var(--soft)" }}>{c.body}</p>
                  <a href="#join" style={{ marginTop: "auto", fontWeight: 500 }}>{c.cta}</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Instagram */}
        {INSTAGRAM_REELS.length > 0 ? (
          <section className="container" style={{ paddingTop: 80, paddingBottom: 24, display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p className="eyebrow">From Instagram</p>
                <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)" }}>Little moments of practice</h2>
              </div>
              <a href={LINKS.instagram} {...external} style={{ fontWeight: 500 }}>Follow @deepinyog</a>
            </div>
            <InstagramReels links={INSTAGRAM_REELS} />
          </section>
        ) : null}

        {/* Enquiry */}
        <section id="join" className="container" style={{ paddingTop: 80, paddingBottom: 88 }}>
          <div className="card" style={{ padding: "44px 36px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 40, position: "relative", overflow: "hidden" }}>
            <div aria-hidden="true" className="sun-glow" style={{ position: "absolute", width: 420, height: 420, left: -140, top: -160, opacity: 0.7, pointerEvents: "none" }} />
            <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
              <h2 style={{ fontSize: 42 }}>Ready to begin?</h2>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--soft)" }}>
                Tell us a little about yourself, or about your team, and you&apos;ll get a reply to find the practice that fits.
              </p>
              <a className="btn btn-outline" href={LINKS.instagram} {...external} style={{ alignSelf: "flex-start" }}>
                Or message on Instagram
              </a>
            </div>
            <div style={{ flex: "1.4 1 380px", minWidth: 0, position: "relative" }}>
              <EnquiryForm />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
