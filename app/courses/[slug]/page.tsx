import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButton } from "@/components/BuyButton";
import { COURSE_FIELDS, KIND_LABEL, StatusPill, type CourseRow } from "@/components/CourseCard";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { getAccess } from "@/lib/access";
import { formatDate } from "@/lib/format";
import { coursePrice, earlyBirdActive, inr } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import { enrollFree, toggleWaitlist } from "../actions";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase.from("courses").select(`${COURSE_FIELDS}, description`).eq("slug", slug).maybeSingle();
  if (!data) notFound();
  const c = data as CourseRow & { description: string };

  const access = user ? await getAccess(supabase, user.id) : null;
  const owned = Boolean(access?.enrolled.has(c.id) || (access?.memberUntil && c.included_in_membership));
  const waitlisted = Boolean(access?.waitlisted.has(c.id));

  // Lesson titles are only readable when signed in; visitors see the count teaser.
  const { data: lessons } = user
    ? await supabase.from("videos").select("id, title, duration_minutes").eq("course_id", c.id).order("sort").order("created_at")
    : { data: null };

  const early = earlyBirdActive(c);

  return (
    <>
      <PublicHeader />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 88, display: "flex", flexWrap: "wrap", gap: 40, alignItems: "flex-start" }}>
        <article style={{ flex: "2 1 480px", minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
          <Link href="/courses">All courses</Link>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span className="pill" style={{ background: "var(--blush-soft)", color: "var(--ink)" }}>{KIND_LABEL[c.kind] ?? "Course"}</span>
            <StatusPill status={c.status} />
            {c.included_in_membership ? <span className="pill">Included in membership</span> : null}
          </div>
          <h1 style={{ fontSize: "clamp(34px, 5vw, 50px)", lineHeight: 1.1 }}>{c.title}</h1>
          {c.summary ? <p style={{ fontSize: 19, color: "var(--soft)", lineHeight: 1.6 }}>{c.summary}</p> : null}
          {c.hosts ? <p style={{ fontWeight: 500 }}>With {c.hosts}</p> : null}
          {c.description ? <p style={{ fontSize: 17, lineHeight: 1.75, whiteSpace: "pre-line" }}>{c.description}</p> : null}

          {lessons && lessons.length > 0 ? (
            <section className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h2 style={{ fontSize: 24, marginBottom: 6 }}>What&apos;s inside</h2>
              {lessons.map((l, i) => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderTop: i ? "1px solid var(--hair)" : 0, paddingTop: i ? 10 : 0 }}>
                  <span>
                    {i + 1}. {owned ? <Link href={`/app/videos/${l.id}`}>{l.title}</Link> : l.title}
                  </span>
                  <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{l.duration_minutes ? `${l.duration_minutes} min` : ""}</span>
                </div>
              ))}
            </section>
          ) : null}
        </article>

        <aside className="card" style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
          {user && c.price_paise > 0 && !owned ? (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
              <span className="display" style={{ fontSize: 36 }}>{inr(coursePrice(c))}</span>
              {early ? <span style={{ textDecoration: "line-through", color: "var(--muted)" }}>{inr(c.price_paise)}</span> : null}
            </div>
          ) : null}
          {user && early && c.early_bird_until && !owned ? <p style={{ color: "var(--saffron-ink)", fontWeight: 700 }}>Early-bird price until {formatDate(c.early_bird_until)}</p> : null}
          {c.schedule ? <p style={{ fontWeight: 500 }}>{c.schedule}</p> : null}
          {c.starts_on && !c.schedule ? <p style={{ color: "var(--muted)" }}>Starts {formatDate(c.starts_on)}</p> : null}

          {owned ? (
            <Link className="btn" href="/app/courses">Go to my course</Link>
          ) : c.status === "open" && c.price_paise === 0 && c.register_url ? (
            <a className="btn" href={c.register_url} target="_blank" rel="noopener noreferrer">Register</a>
          ) : c.status === "open" && c.price_paise === 0 ? (
            <form action={enrollFree.bind(null, c.id, c.slug)}>
              <button className="btn" type="submit">Join</button>
            </form>
          ) : c.status === "open" && !user ? (
            <Link className="btn" href={`/signup?next=${encodeURIComponent(`/courses/${c.slug}`)}`}>Sign up to join</Link>
          ) : c.status === "open" ? (
            <BuyButton itemType="course" itemId={c.id} signedIn={Boolean(user)} successPath="/app/courses?welcome=1" label="Enroll now" />
          ) : c.status === "upcoming" ? (
            <form action={toggleWaitlist.bind(null, c.id, c.slug, !waitlisted)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {waitlisted ? <p className="success">You&apos;re on the waitlist. I&apos;ll let you know as soon as it opens.</p> : <p style={{ color: "var(--soft)" }}>Join the waitlist and I&apos;ll let you know as soon as it opens.</p>}
              <button className={waitlisted ? "btn btn-outline" : "btn"} type="submit">{waitlisted ? "Leave waitlist" : "Join the waitlist"}</button>
            </form>
          ) : (
            <p style={{ color: "var(--muted)" }}>This one is closed for now.</p>
          )}

          {user && !owned && c.included_in_membership ? (
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              Also included with <Link href="/app/membership">membership</Link>.
            </p>
          ) : null}
        </aside>
      </main>
      <PublicFooter />
    </>
  );
}
