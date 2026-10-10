import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { VideoRow } from "@/components/VideoRow";
import { canWatch, getAccess, type CourseMeta, type VideoMeta } from "@/lib/access";
import { CATEGORY_FIELDS, type Category } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Video = VideoMeta & { title: string; duration_minutes: number | null; sort: number; youtube_id: string | null };

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase.from("categories").select(CATEGORY_FIELDS).eq("slug", slug).eq("active", true).maybeSingle();
  if (!data) notFound();
  const cat = data as Category;

  const [{ data: links }, { data: siblings }, { data: courses }] = await Promise.all([
    supabase.from("video_categories").select("videos(id, title, duration_minutes, access, course_id, sort, youtube_id)").eq("category_id", cat.id),
    supabase.from("categories").select("slug, title").eq("grp", cat.grp).eq("active", true).order("sort"),
    supabase.from("courses").select("id, slug, title, included_in_membership"),
  ]);

  const videos = (links ?? [])
    .map((l) => (Array.isArray(l.videos) ? l.videos[0] : l.videos) as Video | null)
    .filter((v): v is Video => Boolean(v))
    .sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title));
  const byId = new Map<string, CourseMeta & { slug: string; title: string }>((courses ?? []).map((c) => [c.id, c]));
  const access = user ? await getAccess(supabase, user.id) : null;
  const order = { free: 0, members: 1, course: 2, assigned: 3 } as const;
  videos.sort((a, b) => order[a.access] - order[b.access]);

  const lockFor = (v: Video) => {
    if (!user) return { href: `/signup?next=${encodeURIComponent(`/practice/${slug}`)}`, label: v.access === "free" ? "Sign up free to watch" : "Start free" };
    if (v.course_id && byId.get(v.course_id)) return { href: `/courses/${byId.get(v.course_id)!.slug}`, label: "In a course" };
    return { href: "/pricing", label: "Members" };
  };

  return (
    <>
      <PublicHeader />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 88, display: "flex", flexDirection: "column", gap: 28 }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 15, color: "var(--muted)" }}>
          <Link href="/practice">Practices</Link> <span aria-hidden="true">/</span> {cat.grp}
        </nav>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 }}>
          <h1 style={{ fontSize: "clamp(34px, 5vw, 50px)", lineHeight: 1.1 }}>{cat.title}</h1>
          {cat.summary ? <p style={{ fontSize: 19, color: "var(--soft)", lineHeight: 1.6 }}>{cat.summary}</p> : null}
        </div>

        <div className="row">
          {cat.guidance ? (
            <section className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p className="eyebrow">How to practise</p>
              <p style={{ lineHeight: 1.7, whiteSpace: "pre-line" }}>{cat.guidance}</p>
            </section>
          ) : null}
          {cat.caution ? (
            <section className="card" style={{ background: "var(--sand)", borderColor: "var(--sand-line)", display: "flex", flexDirection: "column", gap: 10 }}>
              <p className="eyebrow" style={{ color: "var(--sand-ink)" }}>Take care</p>
              <p style={{ lineHeight: 1.7, color: "var(--sand-ink)", whiteSpace: "pre-line" }}>{cat.caution}</p>
            </section>
          ) : null}
        </div>

        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h2 style={{ fontSize: 26, marginBottom: 8 }}>Videos</h2>
          {videos.length === 0 ? <p style={{ color: "var(--muted)" }}>Videos for this topic are on the way.</p> : null}
          {videos.map((v) => {
            const unlocked = Boolean(access && canWatch(v, access, byId));
            const lock = lockFor(v);
            return <VideoRow key={v.id} youtubeId={v.youtube_id} id={v.id} title={v.title} minutes={v.duration_minutes} unlocked={unlocked} lockedHref={lock.href} lockedLabel={lock.label} />;
          })}
        </section>

        {(siblings ?? []).length > 1 ? (
          <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p className="eyebrow">More in {cat.grp}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {(siblings ?? []).filter((s) => s.slug !== slug).map((s) => (
                <Link key={s.slug} className="chip" href={`/practice/${s.slug}`}>{s.title}</Link>
              ))}
            </div>
          </section>
        ) : null}

        <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 760 }}>
          This guidance is for general wellbeing and doesn&apos;t replace medical advice. If you have a health condition, injury or pain, check with your doctor before starting.
        </p>
      </main>
      <PublicFooter />
    </>
  );
}
