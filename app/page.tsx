import Link from "next/link";
import { COURSE_FIELDS, CourseCard, type CourseRow } from "@/components/CourseCard";
import { EnquiryForm } from "@/components/EnquiryForm";
import { InstagramReels } from "@/components/InstagramReels";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { CATEGORY_FIELDS, PILLARS, groupCategories, type Category } from "@/lib/categories";
import { ABOUT, HERO_TEXT, INSTAGRAM_REELS, PHOTOS, TEACHER, WORK_WITH_ME } from "@/lib/content";
import { LINKS, external } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ interest?: string }> }) {
  const { interest } = await searchParams;
  const supabase = await createClient();
  const [{ data: cats }, { data: progs }, { data: authData }] = await Promise.all([
    supabase.from("categories").select(CATEGORY_FIELDS).eq("active", true),
    supabase.from("courses").select(COURSE_FIELDS).in("status", ["open", "upcoming"]).order("starts_on", { ascending: true, nullsFirst: false }).limit(3),
    supabase.auth.getUser(),
  ]);
  const signedIn = Boolean(authData.user);
  const groups = groupCategories((cats ?? []) as Category[]);
  const byName = new Map(groups.map((g) => [g.name, g.items]));
  const programs = (progs ?? []) as CourseRow[];
  const mainPillars = PILLARS.filter((p) => p.slug !== "family");
  const family = PILLARS.find((p) => p.slug === "family");
  const familyTopics = family ? family.groups.flatMap((g) => byName.get(g) ?? []) : [];

  return (
    <>
      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="container" style={{ paddingTop: 40, paddingBottom: 72, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 48 }}>
          <div style={{ flex: "1 1 440px", minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
            <p className="eyebrow">{TEACHER.focus} with {TEACHER.name}</p>
            <h1 style={{ fontSize: "clamp(42px, 6vw, 66px)", lineHeight: 1.06 }}>{TEACHER.tagline}</h1>
            <p style={{ fontSize: 19, lineHeight: 1.65, color: "var(--soft)", maxWidth: 540 }}>{HERO_TEXT}</p>
            <ul aria-label="Credentials" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TEACHER.credentials.slice(0, 3).map((c) => (
                <li key={c} className="pill" style={{ fontSize: 13.5, padding: "6px 12px" }}>{c}</li>
              ))}
            </ul>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              <Link className="btn" href={signedIn ? "/app" : "/signup"}>{signedIn ? "Continue my practice" : "Sign up"}</Link>
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

        {/* Mind, body and soul */}
        <section className="wash">
          <div className="container" style={{ paddingTop: 72, paddingBottom: 72, display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 680 }}>
              <p className="eyebrow">Mind, body and soul</p>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)" }}>What would you like to nurture today?</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20 }}>
              {mainPillars.map((p) => {
                const topics = p.groups.flatMap((g) => byName.get(g) ?? []);
                return (
                  <div key={p.slug} className="card" style={{ display: "flex", flexDirection: "column", gap: 14, padding: 26, background: p.tint }}>
                    <Link href={`/practice#${p.slug}`} style={{ textDecoration: "none", color: "var(--ink)", display: "flex", flexDirection: "column", gap: 4 }}>
                      <h3 style={{ fontSize: 30 }}>{p.name}</h3>
                      <span style={{ color: "var(--saffron-ink)", fontWeight: 500 }}>{p.line}</span>
                    </Link>
                    <p style={{ color: "var(--soft)", lineHeight: 1.6 }}>{p.blurb}</p>
                    {topics.length ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {topics.slice(0, 7).map((c) => (
                          <Link key={c.id} className="chip" href={`/practice/${c.slug}`}>{c.title}</Link>
                        ))}
                      </div>
                    ) : null}
                    <Link href={`/practice#${p.slug}`} style={{ marginTop: "auto", fontWeight: 500 }}>
                      Explore {p.name.toLowerCase()} practices
                    </Link>
                  </div>
                );
              })}
            </div>
            {family ? (
              <div className="card" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, padding: "20px 24px" }}>
                <Link href={`/practice#${family.slug}`} style={{ flex: "1 1 220px", textDecoration: "none", color: "var(--ink)" }}>
                  <h3 style={{ fontSize: 22 }}>{family.name}</h3>
                  <p style={{ color: "var(--muted)" }}>{family.blurb}</p>
                </Link>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {familyTopics.map((c) => (
                    <Link key={c.id} className="chip" href={`/practice/${c.slug}`}>{c.title}</Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Programs and workshops */}
        {programs.length > 0 ? (
          <section className="container" style={{ paddingTop: 80, paddingBottom: 8, display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p className="eyebrow">Programs and workshops</p>
                <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)" }}>Join me live</h2>
              </div>
              <Link href="/courses" style={{ fontWeight: 500 }}>See all programs</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {programs.map((c) => <CourseCard key={c.id} c={c} showPrice={signedIn} />)}
            </div>
          </section>
        ) : null}

        {/* About */}
        <section id="about" className="container" style={{ paddingTop: 80, paddingBottom: 80, display: "flex", flexWrap: "wrap", gap: 56, alignItems: "center" }}>
          <div style={{ flex: "1 1 300px", minWidth: 0, maxWidth: 380, aspectRatio: "4 / 5", borderRadius: "190px 190px 28px 28px", overflow: "hidden", border: "8px solid #fff", boxShadow: "var(--shadow)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ABOUT.photo} alt={`${TEACHER.name} in a yoga pose`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%" }} />
          </div>
          <div style={{ flex: "1 1 440px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <p className="eyebrow">About me</p>
            <h2 style={{ fontSize: 44, lineHeight: 1.15 }}>{ABOUT.heading}</h2>
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

        {/* Nature band */}
        <section aria-hidden="true" className="container">
          <div style={{ borderRadius: 28, overflow: "hidden", aspectRatio: "21 / 8", border: "1px solid var(--hair)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTOS.nature} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
          </div>
        </section>

        {/* Work with me */}
        <section id="work-with-me" className="container" style={{ paddingTop: 80, paddingBottom: 80, display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 680 }}>
            <p className="eyebrow">Work with me</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)" }}>Let&apos;s practise together</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {WORK_WITH_ME.map((o) => (
              <div key={o.title} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <h3 style={{ fontSize: 24 }}>{o.title}</h3>
                <p style={{ color: "var(--soft)", lineHeight: 1.6 }}>{o.body}</p>
                <a href={`/?interest=${encodeURIComponent(o.interest)}#join`} style={{ marginTop: "auto", fontWeight: 500 }}>
                  {o.cta}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Instagram */}
        {INSTAGRAM_REELS.length > 0 ? (
          <section className="wash">
            <div className="container" style={{ paddingTop: 72, paddingBottom: 72, display: "flex", flexDirection: "column", gap: 28 }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p className="eyebrow">From Instagram</p>
                  <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)" }}>Little moments of practice</h2>
                </div>
                <a href={LINKS.instagram} {...external} style={{ fontWeight: 500 }}>Follow @deepinyog</a>
              </div>
              <InstagramReels links={INSTAGRAM_REELS} />
            </div>
          </section>
        ) : null}

        {/* Enquiry */}
        <section id="join" className="container" style={{ paddingTop: 80, paddingBottom: 88, scrollMarginTop: 16 }}>
          <div className="card" style={{ padding: "44px 36px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 40, position: "relative", overflow: "hidden" }}>
            <div aria-hidden="true" className="sun-glow" style={{ position: "absolute", width: 420, height: 420, left: -140, top: -160, opacity: 0.7, pointerEvents: "none" }} />
            <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
              <h2 style={{ fontSize: 42 }}>Write to me</h2>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--soft)" }}>
                Tell me a little about yourself, or about your team, and I&apos;ll get back to you.
              </p>
              <a className="btn btn-outline" href={LINKS.instagram} {...external} style={{ alignSelf: "flex-start" }}>
                Or message me on Instagram
              </a>
            </div>
            <div style={{ flex: "1.4 1 380px", minWidth: 0, position: "relative" }}>
              <EnquiryForm key={interest ?? "default"} defaultInterest={interest} />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
