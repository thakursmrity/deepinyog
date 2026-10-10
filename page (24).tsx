import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTeacher } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { deleteClass, saveAttendance } from "../../actions";

export default async function ClassAttendance({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireTeacher();

  const { data: cls } = await supabase.from("classes").select("id, title, kind, starts_at, duration_minutes, meeting_link, student_id").eq("id", id).maybeSingle();
  if (!cls) notFound();

  let studentsQuery = supabase.from("profiles").select("id, full_name, student_details(active)").eq("role", "student").order("full_name");
  if (cls.student_id) studentsQuery = studentsQuery.eq("id", cls.student_id);

  const [students, attendance] = await Promise.all([studentsQuery, supabase.from("attendance").select("student_id, present").eq("class_id", id)]);

  const marked = new Map((attendance.data ?? []).map((a) => [a.student_id, a.present]));
  const list = (students.data ?? []).filter((s) => {
    const d = Array.isArray(s.student_details) ? s.student_details[0] : s.student_details;
    return (d?.active ?? true) || marked.has(s.id);
  });

  return (
    <>
      <Link href="/teacher/classes">Back to classes</Link>
      <div>
        <h1 style={{ fontSize: 36 }}>{cls.title}</h1>
        <p style={{ color: "var(--muted)" }}>{formatDateTime(cls.starts_at)} · {cls.duration_minutes} min · {cls.kind}</p>
      </div>

      <form action={saveAttendance.bind(null, cls.id)} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ fontSize: 24 }}>Who attended?</h2>
        {list.length === 0 ? <p style={{ color: "var(--muted)" }}>No students yet.</p> : null}
        {list.map((s) => (
          <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 44, borderTop: "1px solid var(--hair)", paddingTop: 8 }}>
            <input type="hidden" name="student" value={s.id} />
            <input type="checkbox" name="present" value={s.id} defaultChecked={marked.get(s.id) ?? false} style={{ width: 22, height: 22 }} />
            {s.full_name}
          </label>
        ))}
        {list.length > 0 ? (
          <button className="btn" type="submit" style={{ alignSelf: "flex-start" }}>Save attendance</button>
        ) : null}
      </form>

      <form action={deleteClass.bind(null, cls.id)}>
        <button className="btn btn-outline btn-small" type="submit">Delete this class</button>
      </form>
    </>
  );
}
