import Link from "next/link";
import { MEMBERSHIP_ON } from "@/lib/features";
import { notFound } from "next/navigation";
import { ProgramMotif } from "@/components/ProgramMotif";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { VideoRow } from "@/components/VideoRow";
import { canWatch, getAccess, type CourseMeta, type VideoMeta } from "@/lib/access";
import { getProgram, getPrograms, highlightList } from "@/lib/programs";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Video = VideoMeta & { title: string; duration_minutes: number | null; sort: number; youtube_id: string | null };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { program } = await getProgram(supabase, slug);
  return { title: program ? `${program.title} | Deepinyog` : "Deepinyog" };
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const [{ program: p, fromDb }, { programs }, { data: auth }] = await Promise.all([
    getProgram(supabase, slug),
    getPrograms(supabase),
    supabase.auth.getUser(),
  ]);
  if (!p) notFound();
  const user = auth.user;

  let videos: Video[] = [];
  let byId = new Map<string, CourseMeta & { slug: string; title: string }>();
  if (fromDb) {
    const [{ data: links }, { data: courses }] = await Promise.all([
      supabase.from("video_categories").select("videos(id, title, duration_minutes, access, course_id, sort, youtube_id)").eq("category_id", p.id),
      supabase.from("courses").select("id, slug, title, included_in_membership"),
    ]);
    const order = { free: 0, members: 1, course: 2, assigned: 3 } as const;
    videos = (links ?? [])
      .map((l) => (Array.isArray(l.videos) ? l.videos[0] : l.videos) as Video | null)
      .filter((v): v is Video => Boolean(v))
      .sort((a, b) => order[a.access] - order[b.access] || a.sort - b.sort || a.title.localeCompare(b.title));
    byId = new Map((courses ?? []).map((c) => [c.id, c]));
  }
  const access = user && videos.length ? await getAccess(supabase, user.id) : null;
  const lockFor = (v: Video) => {
    if (!user) return { href: `/login?mode=register&next=${encodeURIComponent(`/programs/${slug}`)}`, label: "Register to watch" };
    if (v.course_id && byId.get(v.course_id)) return { href: `/courses/${byId.get(v.course_id)!.slug}`, label: "Part of a course" };
    return { href: "/app/membership", label: "Unlock" };
  };

  const helps = highlightList(p);
  const others = programs.filter((x) => x.slug !== p.slug);

  return (
    <>
      <PublicHeader />
      <main>
        <section className="hero" style={{ background: "linear-gradient(180deg, #fff 0%, var(--saffron-mist) 100%)" }}>
          <div className="container" style={{ paddingTop: 40, paddingBottom: 72, display: "flex", flexWrap: "wrap", gap: 40, alignItems: "center" }}>
            <div style={{ flex: "1 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
              <Link href="/programs" style={{ fontWeight: 500 }}>All programs</Link>
              <h1 style={{ fontSize: "clamp(42px, 6vw, 72px)", lineHeight: 1.02 }}>{p.title}</h1>
              {p.tagline ? <p style={{ fontFamily: "var(--font-display), serif", fontSize: 26, color: "var(--saffron-ink)", margin: 0 }}>{p.tagline}</p> : null}
              {p.summary ? <p style={{ fontSize: 19, color: "var(--soft)", lineHeight: 1.65, margin: 0, maxWidth: "34em" }}>{p.summary}</p> : null}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginTop: 6 }}>
                <Link className="btn btn-sun btn-large" href={user ? "/app" : `/login?mode=register&next=${encodeURIComponent(`/programs/${slug}`)}`}>
                  {user ? "Go to my practice" : "Sign up now"}
                </Link>
                <a href={`/?interest=${encodeURIComponent(p.title)}#join`} style={{ fontWeight: 500 }}>Ask me about this</a>
              </div>
            </div>
            <div aria-hidden="true" style={{ flex: "0 0 auto", width: 260, height: 260, borderRadius: 999, background: "radial-gradient(circle, #ffd896 0%, #ffe8c4 45%, rgba(255,246,233,0) 72%)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--saffron-ink)", margin: "0 auto" }}>
              <ProgramMotif slug={p.slug} size={120} />
            </div>
          </div>
        </section>

        <section className="container" style={{ paddingTop: 72, paddingBottom: 24, display: "flex", flexWrap: "wrap", gap: 48 }}>
          {helps.length ? (
            <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ fontSize: 34 }}>This can help with</h2>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
                {helps.map((h) => (
                  <li key={h} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: "1px solid var(--hair)", fontSize: 18 }}>
                    <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 999, background: "var(--saffron)", boxShadow: "0 0 0 4px var(--saffron-soft)", flexShrink: 0 }} />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div style={{ flex: "1.2 1 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            {p.guidance ? (
              <>
                <h2 style={{ fontSize: 34 }}>How we practise</h2>
                <p style={{ fontSize: 18, lineHeight: 1.75, color: "var(--soft)", margin: 0, whiteSpace: "pre-line" }}>{p.guidance}</p>
              </>
            ) : null}
            {p.caution ? (
              <div style={{ background: "var(--sand)", border: "1px solid var(--sand-line)", borderRadius: 22, padding: "20px 22px" }}>
                <p style={{ fontWeight: 600, color: "var(--sand-ink)", margin: "0 0 6px" }}>Please take care</p>
                <p style={{ color: "var(--sand-ink)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>{p.caution}</p>
              </div>
            ) : null}
          </div>
        </section>

        {videos.length > 0 ? (
          <section className="container" style={{ paddingTop: 56 }}>
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h2 style={{ fontSize: 30, marginBottom: 8 }}>Practices</h2>
              {videos.filter((v) => MEMBERSHIP_ON || v.access !== "members" || Boolean(access?.memberUntil)).map((v) => {
                const unlocked = Boolean(access && canWatch(v, access, byId));
                const lock = lockFor(v);
                return <VideoRow key={v.id} youtubeId={v.youtube_id} id={v.id} title={v.title} minutes={v.duration_minutes} unlocked={unlocked} lockedHref={lock.href} lockedLabel={lock.label} />;
              })}
            </div>
          </section>
        ) : null}

        <section className="container" style={{ paddingTop: 72, paddingBottom: 96, display: "flex", flexDirection: "column", gap: 18 }}>
          <h2 style={{ fontSize: 30 }}>Other programs</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {others.map((o) => (
              <Link key={o.slug} className="chip" href={`/programs/${o.slug}`}>{o.title}</Link>
            ))}
          </div>
          <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: "48em", marginTop: 18 }}>
            This guidance is for general wellbeing and doesn&apos;t replace medical advice. If you have a health condition, injury or pain, please check with your doctor before starting.
          </p>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
