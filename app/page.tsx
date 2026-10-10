import Link from "next/link";
import { COURSE_FIELDS, type CourseRow } from "@/components/CourseCard";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { ABOUT, HERO_TEXT, PHOTOS, PRACTICE_WORDS, QUOTE, TEACHER, YOGA_PRACTICES } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function sessionDates(c: CourseRow) {
  if (c.schedule) return c.schedule;
  if (c.starts_on) return `Starts ${formatDate(c.starts_on)}`;
  return "Dates coming soon";
}

export default async function Home() {
  const supabase = await createClient();
  const [{ data: sessions }, { data: auth }] = await Promise.all([
    supabase.from("courses").select(COURSE_FIELDS).in("status", ["open", "upcoming"]).order("starts_on", { ascending: true, nullsFirst: false }).limit(2),
    supabase.auth.getUser(),
  ]);
  const signedIn = Boolean(auth.user);
  const live = (sessions ?? []) as CourseRow[];

  return (
    <>
      <PublicHeader />

      <main>
        {/* Opening: the sun from the logo rises behind the tagline */}
        <section className="hero">
          <div aria-hidden="true" className="hero-sun" />
          <div className="container hero-inner">
            <div className="hero-copy">
              <h1 className="hero-title">
                <span>Dive deeper</span>
                <span className="rise">to rise higher</span>
              </h1>
              <p className="hero-lede">{HERO_TEXT}</p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
                <Link className="btn btn-sun btn-large" href={signedIn ? "/app" : "/signup"}>
                  {signedIn ? "Continue my practice" : "Sign up now"}
                </Link>
                <Link href="/programs" style={{ fontWeight: 500 }}>Explore programs</Link>
              </div>
              <p style={{ color: "var(--muted)", fontSize: 15, margin: 0 }}>
                With {TEACHER.name}, {TEACHER.credentials.slice(0, 2).join(" and ")}
              </p>
            </div>
            <div className="hero-arch">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={PHOTOS.hero} alt={`${TEACHER.name} meditating beside a Himalayan river`} />
            </div>
          </div>
        </section>

        <div className="practice-strip">
          <ul aria-label="What we practise">
            {PRACTICE_WORDS.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>

        {/* What yoga is */}
        <section id="yoga" className="container" style={{ paddingTop: 96, paddingBottom: 88, display: "flex", flexDirection: "column", gap: 40, scrollMarginTop: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px 64px", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.05 }}>What is yoga, really?</h2>
              <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.7, margin: 0 }}>
                Most people meet yoga as a set of postures. The postures are only one doorway. Yoga is a complete way of caring for yourself, through the body, the breath and the mind, so that you feel at home in all three.
              </p>
            </div>
            <figure style={{ flex: "1 1 320px", margin: 0, background: "var(--saffron-mist)", borderRadius: 28, padding: "26px 28px" }}>
              <blockquote style={{ margin: 0, fontFamily: "var(--font-display), serif", fontSize: 26, lineHeight: 1.3 }}>Yogas chitta vritti nirodhah</blockquote>
              <figcaption style={{ color: "var(--soft)", marginTop: 10, lineHeight: 1.55 }}>Yoga is the settling of the movements of the mind. Patanjali, Yoga Sutra 1.2</figcaption>
            </figure>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {YOGA_PRACTICES.map((y) => (
              <article key={y.name} style={{ background: "#fff", border: "1px solid var(--hair)", borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 8 }}>
                <h3 style={{ fontSize: 22 }}>{y.name}</h3>
                <p style={{ color: "var(--saffron-ink)", fontSize: 14, margin: 0, fontStyle: "italic" }}>{y.meaning}</p>
                <p style={{ color: "var(--soft)", lineHeight: 1.6, margin: 0 }}>{y.body}</p>
              </article>
            ))}
          </div>
          <Link className="btn btn-outline" href="/programs#paths" style={{ alignSelf: "flex-start" }}>Find the practice for you</Link>
        </section>

        {/* Live sessions */}
        {live.length > 0 ? (
          <section style={{ background: "var(--saffron-mist)" }}>
            <div className="container" style={{ paddingTop: 80, paddingBottom: 80, display: "flex", flexDirection: "column", gap: 28 }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
                <h2 style={{ fontSize: "clamp(34px, 4.5vw, 50px)", lineHeight: 1.05 }}>Join me live</h2>
                <Link href="/programs#upcoming" style={{ fontWeight: 500 }}>All programs</Link>
              </div>
              {live.map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  style={{ textDecoration: "none", color: "var(--ink)", background: "#fff", borderRadius: 32, padding: "34px 36px", display: "flex", flexWrap: "wrap", gap: "20px 48px", alignItems: "center", boxShadow: "0 20px 50px rgba(160, 96, 58, 0.12)" }}
                >
                  <div style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    <h3 style={{ fontSize: "clamp(34px, 4vw, 48px)", lineHeight: 1.05 }}>{c.title}</h3>
                    {c.summary ? <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.6, margin: 0 }}>{c.summary}</p> : null}
                    {c.hosts ? <p style={{ color: "var(--muted)", margin: 0 }}>With {c.hosts} and {TEACHER.name}</p> : null}
                  </div>
                  <div style={{ flex: "0 1 300px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <p style={{ fontFamily: "var(--font-display), serif", fontSize: 24, lineHeight: 1.3, margin: 0 }}>{sessionDates(c)}</p>
                    <span className="btn btn-sun" style={{ alignSelf: "flex-start" }}>
                      {c.status === "upcoming" ? "Join the waitlist" : "Register"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* About me */}
        <section id="about" className="container" style={{ paddingTop: 96, paddingBottom: 96, display: "flex", flexWrap: "wrap", gap: 64, alignItems: "center", scrollMarginTop: 16 }}>
          <div style={{ flex: "1 1 300px", minWidth: 0, maxWidth: 400, aspectRatio: "4 / 5", borderRadius: "999px 999px 32px 32px", overflow: "hidden", border: "10px solid #fff", boxShadow: "0 30px 80px rgba(90, 63, 71, 0.16)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ABOUT.photo} alt={`${TEACHER.name} in a lunge pose at an old fort`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%" }} />
          </div>
          <div style={{ flex: "1 1 460px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            <p className="quote">{QUOTE}</p>
            <h2 style={{ fontSize: 30 }}>{ABOUT.heading}</h2>
            {ABOUT.paragraphs.map((p) => (
              <p key={p} style={{ fontSize: 18, lineHeight: 1.75, color: "var(--soft)", margin: 0, maxWidth: "36em" }}>{p}</p>
            ))}
            <ul style={{ listStyle: "none", margin: "4px 0 0", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
              {TEACHER.credentials.map((c) => (
                <li key={c} style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 500 }}>
                  <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 999, background: "var(--saffron)", boxShadow: "0 0 0 4px var(--saffron-soft)", flexShrink: 0 }} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Practise from anywhere */}
        <section className="container">
          <div style={{ position: "relative", borderRadius: 36, overflow: "hidden", minHeight: 380, display: "flex", alignItems: "flex-end" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTOS.nature} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(40, 28, 24, 0) 30%, rgba(40, 28, 24, 0.62) 100%)" }} />
            <div style={{ position: "relative", padding: "40px 40px 44px", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, width: "100%" }}>
              <p style={{ fontFamily: "var(--font-display), serif", fontSize: "clamp(30px, 4vw, 46px)", lineHeight: 1.15, color: "#fff", margin: 0, maxWidth: 620 }}>
                Practise with me from wherever you are, live and online.
              </p>
              {signedIn ? null : (
                <Link className="btn btn-sun btn-large" href="/signup">Sign up now</Link>
              )}
            </div>
          </div>
        </section>

        {/* Connect */}
        <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div style={{ background: "var(--blush-soft)", borderRadius: 36, padding: "44px 40px", display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 46px)", lineHeight: 1.08 }}>Not sure where to begin?</h2>
              <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.6, margin: 0 }}>Send me a question or ask for a one-on-one conversation. We&apos;ll find your starting point together.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              <Link className="btn btn-sun btn-large" href="/programs#connect">Connect with me</Link>
              <Link className="btn btn-outline btn-large" href="/programs">See programs</Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
