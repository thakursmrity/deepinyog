import Link from "next/link";
import { COURSE_FIELDS, KIND_LABEL, type CourseRow } from "@/components/CourseCard";
import { ProgramMotif } from "@/components/ProgramMotif";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { PHOTOS, TEACHER } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { getPrograms } from "@/lib/programs";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Programs | Deepinyog" };
export const dynamic = "force-dynamic";

// What a regular practice works on. Written to inform, never to promise a cure.
const KNOWLEDGE = [
  {
    title: "Breath and the nervous system",
    body: "Slow, steady breathing with a longer exhale is one of the simplest ways to tell the body it is safe. Pranayama trains this on purpose, so calm becomes a skill you can return to, not an accident.",
  },
  {
    title: "The spine and long sitting hours",
    body: "Hours at a desk tighten the hips and round the upper back. Moving the spine gently in every direction, every day, restores mobility and eases the strain that settles in the neck and lower back.",
  },
  {
    title: "Marma, the body's vital points",
    body: "The Sushruta Samhita, a classical Ayurvedic text, describes 107 marma points where muscle, vessels, tendons, bone and joints meet. Gentle marma work helps release held tension and restore the flow of prana.",
  },
  {
    title: "Rest, sleep and Yoga Nidra",
    body: "Yoga Nidra is a guided practice of deep, conscious relaxation, done lying down. Many people find it helps them unwind fully and rest more deeply at night.",
  },
  {
    title: "Stress, focus and meditation",
    body: "A few minutes of meditation each day builds the ability to notice a thought without being pulled along by it. Over time this shows up as steadier focus and a softer response to stress.",
  },
  {
    title: "Every season of a woman's life",
    body: "From the monthly cycle to pregnancy and menopause, a woman's body moves through many seasons. Practice adapted to each phase supports comfort, energy and emotional balance.",
  },
];

// Ways in, starting from what a person is living with rather than the name of a style.
const PATHS = [
  { need: "I sit at a desk all day", feels: "A stiff neck, tight shoulders, a tired lower back by evening.", slugs: ["yoga-therapy", "marma-therapy"] },
  { need: "My mind won't switch off", feels: "Racing thoughts, shallow breath, sleep that doesn't refresh.", slugs: ["pranayama", "meditation"] },
  { need: "I want strength and ease", feels: "To feel steady, flexible and light in my own body again.", slugs: ["hatha-yoga"] },
  { need: "I'm living with pain or a health concern", feels: "Back or joint pain, thyroid or blood sugar concerns, recovery after illness.", slugs: ["yoga-therapy"] },
  { need: "Care for women's health", feels: "Cycles, PCOD, pregnancy, menopause, and the emotions that come with them.", slugs: ["womens-wellness"] },
  { need: "Something for my child", feels: "Better focus, calmer moods, and a joyful way to move.", slugs: ["kids-yoga"] },
  { need: "Wellbeing for my team", feels: "Long hours, screen fatigue and stress showing up at work.", slugs: ["workplace-wellness"] },
  { need: "Feeling stuck or searching", feels: "Wanting clarity, direction, and a gentler way of living.", slugs: ["life-coaching", "lemurian-yoga"] },
];

function when(c: CourseRow) {
  if (c.schedule) return c.schedule;
  if (c.starts_on) return `Starts ${formatDate(c.starts_on)}`;
  return "Dates announced soon";
}

export default async function Programs() {
  const supabase = await createClient();
  const [{ programs }, { data: courses }] = await Promise.all([
    getPrograms(supabase),
    supabase.from("courses").select(COURSE_FIELDS).in("status", ["open", "upcoming"]).order("starts_on", { ascending: true, nullsFirst: false }),
  ]);
  const upcoming = (courses ?? []) as CourseRow[];
  const bySlug = new Map(programs.map((p) => [p.slug, p]));

  return (
    <>
      <PublicHeader />
      <main>
        {/* Opening */}
        <section style={{ background: "linear-gradient(180deg, #fff 0%, var(--saffron-mist) 100%)" }}>
          <div className="container" style={{ paddingTop: 56, paddingBottom: 64, display: "flex", flexDirection: "column", gap: 16, maxWidth: 1100 }}>
            <p className="eyebrow" style={{ color: "var(--saffron-ink)" }}>Programs</p>
            <h1 style={{ fontSize: "clamp(42px, 6vw, 68px)", lineHeight: 1.04, maxWidth: "14em" }}>Practice shaped around you, not the other way round</h1>
            <p style={{ fontSize: 19, color: "var(--soft)", lineHeight: 1.65, margin: 0, maxWidth: "38em" }}>
              Every program begins with a simple question: what are you carrying, and what would you like to feel instead? Start with what is coming up next, or find the path that fits where you are today.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", marginTop: 8 }}>
              <a className="btn btn-sun" href="#upcoming">See upcoming programs</a>
              <a href="#paths" style={{ fontWeight: 500 }}>Find my path</a>
            </div>
          </div>
        </section>

        {/* Upcoming programs, managed by the teacher under Courses */}
        <section id="upcoming" className="container" style={{ paddingTop: 72, paddingBottom: 72, display: "flex", flexDirection: "column", gap: 24, scrollMarginTop: 16 }}>
          <h2 style={{ fontSize: "clamp(32px, 4.5vw, 48px)", lineHeight: 1.05 }}>Coming up</h2>
          {upcoming.length === 0 ? (
            <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 18, color: "var(--soft)", margin: 0 }}>My next program is being prepared. Write to me and I&apos;ll let you know as soon as dates are set.</p>
              <Link className="btn btn-outline" href="/connect">Tell me first</Link>
            </div>
          ) : (
            upcoming.map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.slug}`}
                style={{ textDecoration: "none", color: "var(--ink)", background: "#fff", border: "1px solid var(--hair)", borderRadius: 32, padding: "32px 34px", display: "flex", flexWrap: "wrap", gap: "20px 48px", alignItems: "center", boxShadow: "0 20px 50px rgba(160, 96, 58, 0.10)" }}
              >
                <div style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <span className="pill" style={{ background: "var(--blush-soft)", color: "var(--ink)" }}>{KIND_LABEL[c.kind] ?? "Program"}</span>
                    <span className="pill">{c.status === "upcoming" ? "Opening soon" : "Registrations open"}</span>
                  </div>
                  <h3 style={{ fontSize: "clamp(30px, 4vw, 44px)", lineHeight: 1.05 }}>{c.title}</h3>
                  {c.summary ? <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.6, margin: 0 }}>{c.summary}</p> : null}
                  {c.hosts ? <p style={{ color: "var(--muted)", margin: 0 }}>With {c.hosts} and {TEACHER.name}</p> : null}
                </div>
                <div style={{ flex: "0 1 280px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <p style={{ fontFamily: "var(--font-display), serif", fontSize: 22, lineHeight: 1.35, margin: 0 }}>{when(c)}</p>
                  <span className="btn btn-sun" style={{ alignSelf: "flex-start" }}>{c.status === "upcoming" ? "Join the waitlist" : "Know more and register"}</span>
                </div>
              </Link>
            ))
          )}
        </section>

        {/* What practice works on */}
        <section style={{ background: "var(--ground)" }}>
          <div className="container" style={{ paddingTop: 80, paddingBottom: 80, display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "flex-end", justifyContent: "space-between" }}>
              <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 12 }}>
                <h2 style={{ fontSize: "clamp(32px, 4.5vw, 48px)", lineHeight: 1.05 }}>What a steady practice works on</h2>
                <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.65, margin: 0 }}>
                  Yoga is not only postures. In my classes, breath, movement, stillness and touch work together, and each one has its own way of caring for you.
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={PHOTOS.hero} alt={`${TEACHER.name} meditating by a river`} style={{ width: 200, height: 200, objectFit: "cover", borderRadius: "999px 999px 24px 24px", border: "8px solid #fff" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
              {KNOWLEDGE.map((k, i) => (
                <article key={k.title} style={{ background: "#fff", borderRadius: 24, padding: "26px 26px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-display), serif", fontSize: 22, color: "var(--saffron-ink)" }}>0{i + 1}</span>
                  <h3 style={{ fontSize: 22, lineHeight: 1.25 }}>{k.title}</h3>
                  <p style={{ color: "var(--soft)", lineHeight: 1.7, margin: 0 }}>{k.body}</p>
                </article>
              ))}
            </div>
            <p style={{ color: "var(--muted)", fontSize: 15, margin: 0, maxWidth: "48em" }}>
              Yoga supports medical care and never replaces it. Tell me about any condition, injury or medication, and I will adapt the practice for you.
            </p>
          </div>
        </section>

        {/* Paths by need */}
        <section id="paths" className="container" style={{ paddingTop: 88, paddingBottom: 88, display: "flex", flexDirection: "column", gap: 32, scrollMarginTop: 16 }}>
          <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ fontSize: "clamp(32px, 4.5vw, 48px)", lineHeight: 1.05 }}>Where would you like to begin?</h2>
            <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.65, margin: 0 }}>Pick what sounds most like you. Each path leads to the practices I would suggest first.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 18 }}>
            {PATHS.map((path) => {
              const linked = path.slugs.map((s) => bySlug.get(s)).filter((p): p is NonNullable<typeof p> => Boolean(p));
              return (
                <article key={path.need} style={{ border: "1px solid var(--line)", borderRadius: 24, padding: 24, display: "flex", flexDirection: "column", gap: 12, background: "#fff" }}>
                  <span aria-hidden="true" style={{ width: 48, height: 48, borderRadius: 999, background: "var(--saffron-mist)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ProgramMotif slug={path.slugs[0]} size={26} />
                  </span>
                  <h3 style={{ fontSize: 21, lineHeight: 1.25 }}>&ldquo;{path.need}&rdquo;</h3>
                  <p style={{ color: "var(--soft)", lineHeight: 1.6, margin: 0, flex: 1 }}>{path.feels}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {linked.map((p) => (
                      <Link key={p.slug} href={`/programs/${p.slug}`} style={{ fontWeight: 600 }}>{p.title} &rarr;</Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Onward to connect */}
        <section className="container" style={{ paddingTop: 80, paddingBottom: 96 }}>
          <div style={{ background: "var(--sage)", borderRadius: 32, padding: "36px 36px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: "1 1 400px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <h2 style={{ fontSize: "clamp(28px, 3.6vw, 40px)", lineHeight: 1.1 }}>Still unsure which path is yours?</h2>
              <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.6, margin: 0 }}>Ask me a question or request a one-on-one conversation.</p>
            </div>
            <Link className="btn btn-sun btn-large" href="/connect">Connect with me</Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
