import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { ABOUT, PHOTOS, QUOTE, TEACHER } from "@/lib/content";

export const metadata = { title: "About me | Deepinyog" };

// How I work with every student, in my own words.
const PRINCIPLES = [
  { title: "You first, then the practice", body: "Before we begin, I want to know your body, your routine, and anything you carry: pain, a condition, a busy mind. The practice is shaped around that." },
  { title: "Breath leads movement", body: "In every class the breath sets the pace. When the breath is steady, the body opens safely and the mind follows." },
  { title: "Ancient roots, everyday life", body: "Hatha yoga, pranayama, meditation and Marma come from old traditions. I teach them so they fit into a modern day, at home or at work." },
  { title: "Small steps, kept daily", body: "Ten mindful minutes done every day change more than one long session done rarely. I help you build a rhythm you can keep." },
];

export default function About() {
  return (
    <>
      <PublicHeader />
      <main>
        <section className="container" style={{ paddingTop: 48, paddingBottom: 96, display: "flex", flexWrap: "wrap", gap: 64, alignItems: "center" }}>
          <div style={{ flex: "1 1 300px", minWidth: 0, maxWidth: 400, aspectRatio: "4 / 5", borderRadius: "999px 999px 32px 32px", overflow: "hidden", border: "10px solid #fff", boxShadow: "0 30px 80px rgba(90, 63, 71, 0.16)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ABOUT.photo} alt={`${TEACHER.name} in a lunge pose at an old fort`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%" }} />
          </div>
          <div style={{ flex: "1 1 460px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            <p className="quote">{QUOTE}</p>
            <h1 style={{ fontSize: "clamp(38px, 5vw, 54px)", lineHeight: 1.05 }}>{ABOUT.heading}</h1>
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

        <section style={{ background: "var(--ground)" }}>
          <div className="container" style={{ paddingTop: 80, paddingBottom: 80, display: "flex", flexDirection: "column", gap: 28 }}>
            <h2 style={{ fontSize: "clamp(32px, 4.5vw, 46px)", lineHeight: 1.05 }}>How I teach</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 18 }}>
              {PRINCIPLES.map((p) => (
                <article key={p.title} style={{ background: "#fff", borderRadius: 24, padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                  <h3 style={{ fontSize: 21, lineHeight: 1.25 }}>{p.title}</h3>
                  <p style={{ color: "var(--soft)", lineHeight: 1.65, margin: 0 }}>{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container" style={{ paddingTop: 80, paddingBottom: 96 }}>
          <div style={{ position: "relative", borderRadius: 36, overflow: "hidden", minHeight: 360, display: "flex", alignItems: "flex-end" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTOS.nature} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(40, 28, 24, 0) 30%, rgba(40, 28, 24, 0.62) 100%)" }} />
            <div style={{ position: "relative", padding: "40px 40px 44px", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, width: "100%" }}>
              <p style={{ fontFamily: "var(--font-display), serif", fontSize: "clamp(28px, 3.8vw, 42px)", lineHeight: 1.15, color: "#fff", margin: 0, maxWidth: 600 }}>
                Practise with me from wherever you are, live and online.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Link className="btn btn-sun btn-large" href="/programs">See programs</Link>
                <Link className="btn btn-large" href="/connect" style={{ background: "#fff", color: "var(--ink)" }}>Connect with me</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
