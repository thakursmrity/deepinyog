import Link from "next/link";
import { VideoRow } from "@/components/VideoRow";
import { canWatch, getAccess, type CourseMeta, type VideoMeta } from "@/lib/access";
import { requireStudent } from "@/lib/auth";
import { formatDate } from "@/lib/format";

type Video = VideoMeta & { title: string; duration_minutes: number | null; youtube_id: string | null };

export default async function Library({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const { supabase, profile } = await requireStudent();
  const [access, videosRes, coursesRes, doneRes, catsRes, linksRes] = await Promise.all([
    getAccess(supabase, profile.id),
    supabase.from("videos").select("id, title, duration_minutes, access, course_id, youtube_id").in("access", ["free", "members", "course"]).order("sort").order("created_at", { ascending: false }),
    supabase.from("courses").select("id, slug, title, included_in_membership"),
    supabase.from("activity").select("ref_id").eq("student_id", profile.id).eq("kind", "video_completed"),
    supabase.from("categories").select("id, slug, title, sort").eq("active", true).order("sort"),
    supabase.from("video_categories").select("video_id, category_id"),
  ]);
  const usedCats = new Set((linksRes.data ?? []).map((l) => l.category_id));
  const topics = (catsRes.data ?? []).filter((c) => usedCats.has(c.id));
  const current = topics.find((t) => t.slug === topic);
  const inTopic = current ? new Set((linksRes.data ?? []).filter((l) => l.category_id === current.id).map((l) => l.video_id)) : null;

  const videos = ((videosRes.data ?? []) as Video[]).filter((v) => !inTopic || inTopic.has(v.id));
  const courses = coursesRes.data ?? [];
  const byId = new Map<string, CourseMeta & { slug: string; title: string }>(courses.map((c) => [c.id, c]));
  const done = new Set((doneRes.data ?? []).map((d) => d.ref_id));

  const free = videos.filter((v) => v.access === "free");
  const members = videos.filter((v) => v.access === "members");
  const myCourseVideos = videos.filter((v) => v.course_id && canWatch(v, access, byId));

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
        <h1 style={{ fontSize: 38 }}>Video library</h1>
        {access.memberUntil ? (
          <span className="pill" style={{ fontSize: 14 }}>Member until {formatDate(access.memberUntil)}</span>
        ) : (
          <Link className="btn" href="/app/membership">Unlock everything with membership</Link>
        )}
      </div>

      {topics.length > 0 ? (
        <nav aria-label="Topics" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Link className={current ? "chip" : "chip chip-on"} href="/app/library">All</Link>
          {topics.map((t) => (
            <Link key={t.id} className={current?.id === t.id ? "chip chip-on" : "chip"} href={`/app/library?topic=${t.slug}`}>{t.title}</Link>
          ))}
        </nav>
      ) : null}

      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Open to you</h2>
        {free.length === 0 ? <p style={{ color: "var(--muted)" }}>{current ? "Nothing open in this topic yet." : "New practices are coming soon."}</p> : null}
        {free.map((v) => (
          <VideoRow key={v.id} youtubeId={v.youtube_id} id={v.id} title={v.title} minutes={v.duration_minutes} unlocked lockedHref="/app/membership" lockedLabel="" done={done.has(v.id)} />
        ))}
      </section>

      {members.length > 0 ? (
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h2 style={{ fontSize: 24, marginBottom: 8 }}>Members library</h2>
          {members.map((v) => (
            <VideoRow
              key={v.id}
              id={v.id}
              title={v.title}
              minutes={v.duration_minutes}
              unlocked={canWatch(v, access, byId)}
              lockedHref="/app/membership"
              lockedLabel="Become a member"
              done={done.has(v.id)}
            />
          ))}
        </section>
      ) : null}

      {myCourseVideos.length > 0 ? (
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h2 style={{ fontSize: 24, marginBottom: 8 }}>From your courses</h2>
          {myCourseVideos.map((v) => (
            <VideoRow key={v.id} youtubeId={v.youtube_id} id={v.id} title={v.title} minutes={v.duration_minutes} unlocked lockedHref="/courses" lockedLabel="" done={done.has(v.id)} />
          ))}
        </section>
      ) : null}
    </>
  );
}
