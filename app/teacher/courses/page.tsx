import Link from "next/link";
import { StatusPill } from "@/components/CourseCard";
import { requireTeacher } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { coursePrice, inr } from "@/lib/money";
import { CourseForm } from "./CourseForm";

export default async function TeacherCourses() {
  const { supabase } = await requireTeacher();
  const [courses, waitlist, enrollments] = await Promise.all([
    supabase.from("courses").select("id, slug, title, status, price_paise, early_bird_price_paise, early_bird_until, starts_on").order("created_at", { ascending: false }),
    supabase.from("waitlist").select("course_id"),
    supabase.from("enrollments").select("course_id"),
  ]);

  const count = (rows: { course_id: string }[] | null) => {
    const m = new Map<string, number>();
    for (const r of rows ?? []) m.set(r.course_id, (m.get(r.course_id) ?? 0) + 1);
    return m;
  };
  const waiting = count(waitlist.data);
  const enrolled = count(enrollments.data);

  return (
    <>
      <h1 style={{ fontSize: 38 }}>Programs and courses</h1>
      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {(courses.data ?? []).length === 0 ? <p style={{ color: "var(--muted)" }}>No courses yet. Create your first one below; start it as Upcoming to collect a waitlist.</p> : null}
        {(courses.data ?? []).map((c) => (
          <div key={c.id} style={{ borderTop: "1px solid var(--hair)", padding: "14px 0", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700 }}>
                <Link href={`/teacher/courses/${c.id}`}>{c.title}</Link> <StatusPill status={c.status} />
              </p>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>
                {c.price_paise > 0 ? inr(coursePrice(c)) : "Free"} · {waiting.get(c.id) ?? 0} on waitlist · {enrolled.get(c.id) ?? 0} enrolled
                {c.starts_on ? ` · starts ${formatDate(c.starts_on)}` : ""}
              </p>
            </div>
            <Link className="btn btn-outline btn-small" href={`/teacher/courses/${c.id}`}>Manage</Link>
          </div>
        ))}
      </section>
      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontSize: 24 }}>Create a program, workshop or course</h2>
        <CourseForm />
      </section>
    </>
  );
}
