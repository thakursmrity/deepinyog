import Link from "next/link";
import { COURSE_FIELDS, CourseCard, type CourseRow } from "@/components/CourseCard";
import { VideoRow } from "@/components/VideoRow";
import { getAccess } from "@/lib/access";
import { requireStudent } from "@/lib/auth";

export default async function MyCourses({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { supabase, profile } = await requireStudent();
  const access = await getAccess(supabase, profile.id);

  const { data } = await supabase.from("courses").select(COURSE_FIELDS);
  const courses = (data ?? []) as CourseRow[];
  const mine = courses.filter((c) => access.enrolled.has(c.id) || (access.memberUntil && c.included_in_membership && c.status !== "upcoming"));
  const waiting = courses.filter((c) => access.waitlisted.has(c.id));

  const ids = mine.map((c) => c.id);
  const [{ data: lessons }, { data: doneRows }] = await Promise.all([
    ids.length
      ? supabase.from("videos").select("id, title, duration_minutes, course_id").in("course_id", ids).order("sort").order("created_at")
      : Promise.resolve({ data: [] as { id: string; title: string; duration_minutes: number | null; course_id: string }[] }),
    supabase.from("activity").select("ref_id").eq("student_id", profile.id).eq("kind", "video_completed"),
  ]);
  const done = new Set((doneRows ?? []).map((d) => d.ref_id));

  return (
    <>
      <h1 style={{ fontSize: 38 }}>My courses</h1>
      {welcome ? <p className="success" role="status">You&apos;re enrolled. Welcome to the course!</p> : null}

      {mine.length === 0 ? (
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ color: "var(--soft)" }}>You haven&apos;t joined a course yet.</p>
          <Link className="btn" href="/courses" style={{ alignSelf: "flex-start" }}>Browse courses</Link>
        </section>
      ) : null}

      {mine.map((c) => {
        const list = (lessons ?? []).filter((l) => l.course_id === c.id);
        const finished = list.filter((l) => done.has(l.id)).length;
        return (
          <section key={c.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "baseline", marginBottom: 8 }}>
              <h2 style={{ fontSize: 26 }}>{c.title}</h2>
              {list.length > 0 ? <span style={{ color: "var(--muted)" }}>{finished} of {list.length} done</span> : null}
            </div>
            {list.length === 0 ? <p style={{ color: "var(--muted)" }}>Lessons will appear here as soon as they&apos;re added.</p> : null}
            {list.map((l) => (
              <VideoRow key={l.id} id={l.id} title={l.title} minutes={l.duration_minutes} unlocked lockedHref="" lockedLabel="" done={done.has(l.id)} />
            ))}
          </section>
        );
      })}

      {waiting.length > 0 ? (
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 26 }}>On your waitlist</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {waiting.map((c) => <CourseCard key={c.id} c={c} />)}
          </div>
        </section>
      ) : null}
    </>
  );
}
