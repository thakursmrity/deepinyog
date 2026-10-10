import Link from "next/link";
import { COURSE_FIELDS, type CourseRow } from "@/components/CourseCard";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { ABOUT, HERO_TEXT, PHOTOS, PRACTICE_WORDS, TEACHER, MARMA, YOGA_LIMBS } from "@/lib/content";
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
    supabase.from("courses").select(COURSE_FIELDS).in("status", ["open", "upcoming"]).order("starts_on", { ascending: true, nullsFirst: false }).limit(1),
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
                <Link className="btn btn-sun btn-large" href={signedIn ? "/app" : "/login?mode=register"}>
                  {signedIn ? "Continue my practice" : "Begin your practice"}
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px 64px", alignItems: "center" }}>
            <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.05 }}>What is yoga, really?</h2>
              <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.7, margin: 0 }}>
                Most people meet yoga as a set of postures. The postures are only one doorway. Yoga is a complete way of caring for yourself, through the body, the breath and the mind, so that you feel at home in all three.
              </p>
            </div>
            <figure style={{ flex: "1 1 340px", margin: 0, background: "var(--saffron-mist)", borderRadius: 28, padding: "28px 30px", display: "flex", flexDirection: "column", gap: 12 }}>
              <p lang="sa" style={{ margin: 0, fontSize: 26, lineHeight: 1.3, color: "var(--saffron-ink)" }}>योगश्चित्तवृत्तिनिरोधः</p>
              <p style={{ margin: 0, fontFamily: "var(--font-display), serif", fontSize: 22, lineHeight: 1.3 }}>Yogas chitta vritti nirodhah</p>
              <blockquote style={{ margin: 0, fontStyle: "italic", fontSize: 18, lineHeight: 1.55, color: "var(--soft)" }}>
                &ldquo;Yoga is the settling of the movements of the mind.&rdquo;
              </blockquote>
              <figcaption style={{ fontSize: 13, letterSpacing: 1.6, textTransform: "uppercase", color: "var(--muted)", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                Patanjali, Yoga Sutra 1.2
              </figcaption>
            </figure>
          </div>
          <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.7, margin: 0, maxWidth: "46em" }}>
            Patanjali describes yoga as eight limbs, from how we live with others to deep meditation. My classes work most with four of them.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
            {YOGA_LIMBS.map((y) => (
              <article key={y.name} style={{ background: "#fff", border: "1px solid var(--hair)", borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: "var(--muted)", margin: 0 }}>{y.limb}</p>
                <h3 style={{ fontSize: 24 }}>{y.name}</h3>
                <p style={{ color: "var(--saffron-ink)", fontSize: 14, margin: 0, fontStyle: "italic" }}>{y.via}</p>
                <p style={{ color: "var(--soft)", lineHeight: 1.6, margin: 0 }}>{y.body}</p>
              </article>
            ))}
          </div>
          <article style={{ background: "var(--sage)", borderRadius: 28, padding: "26px 28px", display: "flex", flexWrap: "wrap", gap: "12px 40px", alignItems: "center" }}>
            <div style={{ flex: "0 1 260px", display: "flex", flexDirection: "column", gap: 6 }}>
              <p style={{ fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: "var(--sage-ink)", margin: 0 }}>Alongside yoga</p>
              <h3 style={{ fontSize: 26 }}>{MARMA.title}</h3>
              <p style={{ color: "var(--sage-ink)", fontSize: 14, margin: 0, fontStyle: "italic" }}>{MARMA.via}</p>
            </div>
            <p style={{ flex: "1 1 360px", minWidth: 0, color: "var(--ink)", lineHeight: 1.65, margin: 0 }}>{MARMA.body}</p>
          </article>
          <Link className="btn btn-outline" href="/programs#paths" style={{ alignSelf: "flex-start" }}>Find the practice for you</Link>
        </section>

        {/* Live sessions */}
        {live.length > 0 ? (
          <section style={{ background: "var(--saffron-mist)" }}>
            <div className="container" style={{ paddingTop: 80, paddingBottom: 80, display: "flex", flexDirection: "column", gap: 28 }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                <h2 style={{ fontSize: "clamp(34px, 4.5vw, 50px)", lineHeight: 1.05 }}>Coming up next</h2>
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

        {/* Explore */}
        <section style={{ background: "var(--ground)" }}>
          <div className="container" style={{ paddingTop: 80, paddingBottom: 80, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              { href: "/about", title: "About me", body: "My journey, how I teach, and the training behind it.", img: ABOUT.photo, pos: "center 60%" },
              { href: "/programs", title: "Programs", body: "What's coming up, and a path for what you're living with.", img: PHOTOS.hero, pos: "center 40%" },
              { href: "/connect", title: "Connect", body: "Ask a question or request a one-on-one conversation.", img: PHOTOS.nature, pos: "center 40%" },
            ].map((c) => (
              <Link key={c.href} href={c.href} style={{ textDecoration: "none", color: "var(--ink)", background: "#fff", borderRadius: 28, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt="" style={{ width: "100%", height: 180, objectFit: "cover", objectPosition: c.pos }} />
                <span style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontFamily: "var(--font-display), serif", fontSize: 26 }}>{c.title} &rarr;</span>
                  <span style={{ color: "var(--soft)", lineHeight: 1.55 }}>{c.body}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <PublicFooter />
    </>
  );
}
