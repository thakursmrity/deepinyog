import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTeacher } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { CourseForm, type CourseInput } from "../CourseForm";

type Person = { full_name: string; email: string | null };
const person = (p: Person | Person[] | null) => (Array.isArray(p) ? p[0] : p);

export default async function ManageCourse({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const { supabase } = await requireTeacher();

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title, summary, description, status, price_paise, early_bird_price_paise, early_bird_until, starts_on, included_in_membership, kind, schedule, hosts, register_url")
    .eq("id", id)
    .maybeSingle();
  if (!course) notFound();

  const [lessons, waitlist, enrolled] = await Promise.all([
    supabase.from("videos").select("id, title, duration_minutes, sort").eq("course_id", id).order("sort").order("created_at"),
    supabase.from("waitlist").select("created_at, profiles(full_name, email)").eq("course_id", id).order("created_at"),
    supabase.from("enrollments").select("created_at, payment_id, profiles(full_name, email)").eq("course_id", id).order("created_at", { ascending: false }),
  ]);

  const waitEmails = (waitlist.data ?? []).map((w) => person(w.profiles as Person | Person[] | null)?.email).filter(Boolean).join(", ");

  return (
    <>
      <Link href="/teacher/courses">All courses</Link>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
        <h1 style={{ fontSize: 36 }}>{course.title}</h1>
        <a href={`/courses/${course.slug}`} target="_blank" rel="noopener noreferrer">View public page</a>
      </div>
      {created ? <p className="success" role="status">Course created. Upload its lessons in the video library and pick this course.</p> : null}

      <div className="row">
        <section className="card" style={{ flex: "2 1 480px", display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 24 }}>Details and pricing</h2>
          <CourseForm course={course as CourseInput} />
        </section>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 style={{ fontSize: 22 }}>Lessons ({(lessons.data ?? []).length})</h2>
            {(lessons.data ?? []).length === 0 ? (
              <p style={{ color: "var(--muted)" }}>
                Upload videos in the <Link href="/teacher/videos">video library</Link> and set them to this course.
              </p>
            ) : null}
            {(lessons.data ?? []).map((l, i) => (
              <p key={l.id}>{i + 1}. {l.title} {l.duration_minutes ? <span style={{ color: "var(--muted)" }}>· {l.duration_minutes} min</span> : null}</p>
            ))}
          </section>

          <section className="card" style={{ background: "var(--sand)", display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 style={{ fontSize: 22 }}>Waitlist ({(waitlist.data ?? []).length})</h2>
            {(waitlist.data ?? []).map((w, i) => {
              const p = person(w.profiles as Person | Person[] | null);
              return <p key={i}>{p?.full_name || "Unnamed"} <span style={{ color: "var(--sand-ink)" }}>· {p?.email}</span></p>;
            })}
            {waitEmails ? (
              <a className="btn btn-small" href={`mailto:?bcc=${encodeURIComponent(waitEmails)}&subject=${encodeURIComponent(`${course.title} is open`)}`} style={{ alignSelf: "flex-start" }}>
                Email the waitlist
              </a>
            ) : null}
          </section>

          <section className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 style={{ fontSize: 22 }}>Enrolled ({(enrolled.data ?? []).length})</h2>
            {(enrolled.data ?? []).map((e, i) => {
              const p = person(e.profiles as Person | Person[] | null);
              return (
                <p key={i}>
                  {p?.full_name || "Unnamed"} <span style={{ color: "var(--muted)" }}>· {formatDate(e.created_at)}{e.payment_id ? "" : " · given by you"}</span>
                </p>
              );
            })}
          </section>
        </div>
      </div>
    </>
  );
}
