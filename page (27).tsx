import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTeacher } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { inr } from "@/lib/money";
import { addNote, assignVideo, grantCourse, grantMembership, grantSessions, markSessionUsed } from "../../actions";
import { EditStudentForm, ResetPassword } from "./StudentForms";

const ACTIVITY_LABEL: Record<string, string> = {
  login: "Signed in",
  video_opened: "Opened a video",
  video_completed: "Finished a video",
  class_attended: "Attended a class",
};

export default async function StudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireTeacher();

  const nowIso = new Date().toISOString();
  const [profile, details, notes, assignments, videos, attendance, activity, memberships, enrolled, credits, payments, courses] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, phone, created_at").eq("id", id).eq("role", "student").maybeSingle(),
    supabase.from("student_details").select("plan, goals, health_notes, active, joined_on").eq("student_id", id).maybeSingle(),
    supabase.from("notes").select("id, body, created_at").eq("student_id", id).order("created_at", { ascending: false }).limit(10),
    supabase.from("video_assignments").select("id, assigned_at, completed_at, videos(title)").eq("student_id", id).order("assigned_at", { ascending: false }),
    supabase.from("videos").select("id, title").neq("access", "free").order("created_at", { ascending: false }),
    supabase.from("attendance").select("present, classes(title, starts_at)").eq("student_id", id).order("marked_at", { ascending: false }).limit(10),
    supabase.from("activity").select("kind, created_at").eq("student_id", id).order("created_at", { ascending: false }).limit(15),
    supabase.from("memberships").select("ends_at").eq("user_id", id).gt("ends_at", nowIso).order("ends_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("enrollments").select("course_id, courses(title)").eq("user_id", id),
    supabase.from("coaching_credits").select("id, sessions_total, sessions_used").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("payments").select("amount_paise").eq("user_id", id).eq("status", "paid"),
    supabase.from("courses").select("id, title").order("created_at", { ascending: false }),
  ]);
  const spent = (payments.data ?? []).reduce((n, p) => n + p.amount_paise, 0);

  if (!profile.data) notFound();
  const p = profile.data;
  const d = details.data;

  return (
    <>
      <Link href="/teacher">Back to overview</Link>
      <div>
        <h1 style={{ fontSize: 36 }}>{p.full_name}</h1>
        <p style={{ color: "var(--muted)" }}>
          {p.email} {d?.joined_on ? `· joined ${formatDate(d.joined_on)}` : ""}
        </p>
      </div>

      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
          <h2 style={{ fontSize: 24 }}>Membership, courses and coaching</h2>
          <span style={{ color: "var(--muted)" }}>Paid so far: {inr(spent)}</span>
        </div>
        <div className="form-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontWeight: 700 }}>Membership</p>
            <p>{memberships.data ? `Active until ${formatDate(memberships.data.ends_at)}` : "Not a member yet"}</p>
            <form action={grantMembership.bind(null, p.id)} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input name="days" type="number" min={1} defaultValue={30} aria-label="Days" style={{ width: 80, font: "inherit", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--line)" }} />
              <button className="btn btn-outline btn-small" type="submit">Give days</button>
            </form>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontWeight: 700 }}>Courses</p>
            {(enrolled.data ?? []).length === 0 ? <p>None yet</p> : null}
            {(enrolled.data ?? []).map((e) => {
              const c = Array.isArray(e.courses) ? e.courses[0] : e.courses;
              return <p key={e.course_id}>{c?.title}</p>;
            })}
            {(courses.data ?? []).length > 0 ? (
              <form action={grantCourse.bind(null, p.id)} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <select name="course_id" aria-label="Course" style={{ font: "inherit", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--line)", maxWidth: 200 }}>
                  {(courses.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <button className="btn btn-outline btn-small" type="submit">Give course</button>
              </form>
            ) : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontWeight: 700 }}>1-on-1 sessions</p>
            {(credits.data ?? []).length === 0 ? <p>None</p> : null}
            {(credits.data ?? []).map((c) => (
              <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span>{c.sessions_used} of {c.sessions_total} done</span>
                {c.sessions_used < c.sessions_total ? (
                  <form action={markSessionUsed.bind(null, c.id, `/teacher/students/${p.id}`)}>
                    <button className="btn btn-small" type="submit">Mark one done</button>
                  </form>
                ) : null}
              </div>
            ))}
            <form action={grantSessions.bind(null, p.id)} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input name="sessions" type="number" min={1} defaultValue={4} aria-label="Sessions" style={{ width: 70, font: "inherit", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--line)" }} />
              <button className="btn btn-outline btn-small" type="submit">Give sessions</button>
            </form>
          </div>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Use the give buttons for people who paid you directly, or as a gift.</p>
      </section>

      <div className="row">
        <section className="card" style={{ flex: "2 1 460px", display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 24 }}>Details</h2>
          <EditStudentForm
            student={{
              id: p.id,
              full_name: p.full_name,
              phone: p.phone,
              plan: d?.plan ?? "Group",
              goals: d?.goals ?? "",
              health_notes: d?.health_notes ?? "",
              active: d?.active ?? true,
            }}
          />
          <hr style={{ border: 0, borderTop: "1px solid var(--line)", width: "100%" }} />
          <h3 style={{ fontSize: 20 }}>Login</h3>
          <ResetPassword studentId={p.id} />
        </section>

        <section className="card" style={{ background: "var(--sand)", display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ fontSize: 24 }}>Notes to student</h2>
          <form action={addNote.bind(null, p.id)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label className="field">
              <span>New note (the student sees the latest one)</span>
              <textarea name="body" required />
            </label>
            <button className="btn btn-small" type="submit" style={{ alignSelf: "flex-start" }}>Send note</button>
          </form>
          {(notes.data ?? []).map((n) => (
            <div key={n.id} style={{ borderTop: "1px solid var(--sand-line)", paddingTop: 10 }}>
              <p style={{ whiteSpace: "pre-line" }}>{n.body}</p>
              <p style={{ fontSize: 13, color: "var(--sand-ink)" }}>{formatDate(n.created_at)}</p>
            </div>
          ))}
        </section>
      </div>

      <div className="row">
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ fontSize: 24 }}>Practice videos</h2>
          {(videos.data ?? []).length > 0 ? (
            <form action={assignVideo.bind(null, p.id)} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
              <label className="field" style={{ flex: "1 1 200px" }}>
                <span>Assign a video</span>
                <select name="video_id" required>
                  {(videos.data ?? []).map((v) => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </select>
              </label>
              <button className="btn btn-small" type="submit">Assign</button>
            </form>
          ) : (
            <p style={{ color: "var(--muted)" }}>
              Upload a video in the <Link href="/teacher/videos">video library</Link> to assign it.
            </p>
          )}
          {(assignments.data ?? []).map((a) => {
            const v = Array.isArray(a.videos) ? a.videos[0] : a.videos;
            return (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, borderTop: "1px solid var(--hair)", paddingTop: 10 }}>
                <span>{v?.title}</span>
                {a.completed_at ? <span className="pill">Done {formatDate(a.completed_at)}</span> : <span className="pill pill-warn">Not yet</span>}
              </div>
            );
          })}
        </section>

        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ fontSize: 24 }}>Recent classes</h2>
          {(attendance.data ?? []).length === 0 ? <p style={{ color: "var(--muted)" }}>No attendance marked yet.</p> : null}
          {(attendance.data ?? []).map((a, i) => {
            const c = Array.isArray(a.classes) ? a.classes[0] : a.classes;
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, borderTop: i ? "1px solid var(--hair)" : 0, paddingTop: i ? 10 : 0 }}>
                <span>{c?.title} · {c ? formatDateTime(c.starts_at) : ""}</span>
                {a.present ? <span className="pill">Present</span> : <span className="pill pill-warn">Missed</span>}
              </div>
            );
          })}
        </section>

        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ fontSize: 24 }}>Recent activity</h2>
          {(activity.data ?? []).length === 0 ? <p style={{ color: "var(--muted)" }}>Nothing yet.</p> : null}
          {(activity.data ?? []).map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <span>{ACTIVITY_LABEL[a.kind] ?? a.kind}</span>
              <span style={{ color: "var(--muted)" }}>{formatDateTime(a.created_at)}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
