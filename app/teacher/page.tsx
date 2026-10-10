import Link from "next/link";
import { requireTeacher } from "@/lib/auth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatDate } from "@/lib/format";

const DAY = 86400000;
const CHECK_IN_AFTER_DAYS = 10;

export default async function TeacherOverview() {
  const { supabase } = await requireTeacher();
  const since30 = new Date(Date.now() - 30 * DAY).toISOString();
  const since60 = new Date(Date.now() - 60 * DAY).toISOString();
  const since7 = new Date(Date.now() - 7 * DAY).toISOString();

  const nowIso = new Date().toISOString();
  const [students, classes30, attendance30, attendancePrev, activity, practiced7, newEnquiries, members] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, created_at, student_details(plan, goals, active)")
      .eq("role", "student")
      .order("full_name"),
    supabase.from("classes").select("id, student_id").gte("starts_at", since30).lte("starts_at", new Date().toISOString()),
    supabase.from("attendance").select("student_id, present, classes!inner(starts_at)").gte("classes.starts_at", since30),
    supabase.from("attendance").select("present, classes!inner(starts_at)").gte("classes.starts_at", since60).lt("classes.starts_at", since30),
    supabase.from("activity").select("student_id, created_at").gte("created_at", since60).order("created_at", { ascending: false }),
    supabase.from("activity").select("student_id").in("kind", ["video_opened", "video_completed"]).gte("created_at", since7),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("memberships").select("user_id").lte("starts_at", nowIso).gt("ends_at", nowIso),
  ]);
  const health = await platformHealth(supabase, (students.data ?? []).map((st) => ({ id: st.id, created_at: st.created_at })));
  const memberIds = new Set((members.data ?? []).map((m) => m.user_id));
  const newEnquiryCount = newEnquiries.count ?? 0;

  const all = (students.data ?? []).map((s) => {
    const d = Array.isArray(s.student_details) ? s.student_details[0] : s.student_details;
    return { ...s, plan: d?.plan ?? "Group", goals: d?.goals ?? "", active: d?.active ?? true };
  });
  const active = all.filter((s) => s.active);

  const rate = (rows: { present: boolean }[] | null) => {
    const r = rows ?? [];
    return r.length ? Math.round((r.filter((x) => x.present).length / r.length) * 100) : null;
  };
  const rateNow = rate(attendance30.data);
  const ratePrev = rate(attendancePrev.data);

  const lastSeen = new Map<string, string>();
  for (const a of activity.data ?? []) if (!lastSeen.has(a.student_id)) lastSeen.set(a.student_id, a.created_at);

  const attendedBy = new Map<string, number>();
  for (const a of attendance30.data ?? []) if (a.present) attendedBy.set(a.student_id, (attendedBy.get(a.student_id) ?? 0) + 1);
  const groupClasses = (classes30.data ?? []).filter((c) => !c.student_id).length;

  const practicedThisWeek = new Set((practiced7.data ?? []).map((a) => a.student_id)).size;
  const needsCheckIn = (id: string, joined: string) => {
    const seen = lastSeen.get(id) ?? joined;
    return Date.now() - new Date(seen).getTime() > CHECK_IN_AFTER_DAYS * DAY;
  };
  const checkInCount = active.filter((s) => needsCheckIn(s.id, s.created_at)).length;
  const newThisMonth = active.filter((s) => new Date(s.created_at).getTime() > Date.now() - 30 * DAY).length;

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 38 }}>Overview</h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {newEnquiryCount > 0 ? (
            <Link className="btn btn-outline" href="/teacher/enquiries">
              {newEnquiryCount} new {newEnquiryCount === 1 ? "enquiry" : "enquiries"}
            </Link>
          ) : null}
          <Link className="btn btn-outline" href="/teacher/classes">Mark attendance</Link>
          <Link className="btn" href="/teacher/videos">Upload video</Link>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <p className="label">Student accounts</p>
          <p className="num">{active.length}</p>
          <p className="hint">{newThisMonth} joined in the last 30 days · {memberIds.size} members</p>
        </div>
        <div className="stat">
          <p className="label">Attendance, last 30 days</p>
          <p className="num">{rateNow === null ? "No data" : `${rateNow}%`}</p>
          <p className="hint">{ratePrev === null ? "Previous 30 days: no data" : `Previous 30 days: ${ratePrev}%`}</p>
        </div>
        <div className="stat">
          <p className="label">Practiced between classes</p>
          <p className="num">{practicedThisWeek}</p>
          <p className="hint">students opened a video in the last 7 days</p>
        </div>
        <div className="stat" style={{ background: "var(--sand)" }}>
          <p className="label" style={{ color: "var(--sand-ink)" }}>Needs a check-in</p>
          <p className="num">{checkInCount}</p>
          <p className="hint" style={{ color: "var(--sand-ink)" }}>no activity for {CHECK_IN_AFTER_DAYS}+ days</p>
        </div>
      </div>

      <HealthSection health={health} />

      <section className="card" style={{ padding: "24px 24px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 style={{ fontSize: 24 }}>Students</h2>
          <Link href="/teacher/students/new" style={{ fontWeight: 500 }}>Add a student</Link>
        </div>
        {all.length === 0 ? (
          <p style={{ color: "var(--muted)", paddingBottom: 16 }}>No students yet. Add your first student to give them a login.</p>
        ) : (
          <div className="table-wrap">
            <table style={{ minWidth: 640 }}>
              <thead>
                <tr><th>Student</th><th>Access</th><th>Goal</th><th>Last active</th><th>Classes, 30 days</th><th>Status</th></tr>
              </thead>
              <tbody>
                {all.map((s) => {
                  const seen = lastSeen.get(s.id);
                  const flag = s.active && needsCheckIn(s.id, s.created_at);
                  return (
                    <tr key={s.id}>
                      <td><Link href={`/teacher/students/${s.id}`} style={{ fontWeight: 500 }}>{s.full_name || "Unnamed"}</Link></td>
                      <td>{memberIds.has(s.id) ? "Member" : "Signed up"}</td>
                      <td>{s.goals || "Not set"}</td>
                      <td>{seen ? formatDate(seen) : "Not yet"}</td>
                      <td>{attendedBy.get(s.id) ?? 0}{groupClasses ? ` of ${groupClasses}` : ""}</td>
                      <td>
                        {!s.active ? <span className="pill" style={{ background: "#eee", color: "#444" }}>Paused</span> : flag ? <span className="pill pill-warn">Check in</span> : <span className="pill">On track</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

type Health = {
  activation: { rate: number | null; joined: number };
  conversion: { rate: number | null; paying: number; total: number };
  renewal: { rate: number | null; eligible: number };
  published30: number;
  top: { id: string; title: string; views: number }[];
};

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : null);

// The success metrics from the product plan: activation, conversion, renewal, publishing and top content.
async function platformHealth(supabase: SupabaseClient, students: { id: string; created_at: string }[]): Promise<Health> {
  const since30 = new Date(Date.now() - 30 * DAY).toISOString();
  const since37 = new Date(Date.now() - 37 * DAY).toISOString();
  const [opened, memberships, enrollments, published, views] = await Promise.all([
    supabase.from("activity").select("student_id, created_at").eq("kind", "video_opened").gte("created_at", since37),
    supabase.from("memberships").select("user_id, ends_at"),
    supabase.from("enrollments").select("user_id").not("payment_id", "is", null),
    supabase.from("videos").select("id", { count: "exact", head: true }).gte("created_at", since30),
    supabase.from("activity").select("ref_id").eq("kind", "video_opened").gte("created_at", since30),
  ]);

  // Activation: of people who joined in the last 30 days, how many watched something within their first week.
  const joined = students.filter((st) => st.created_at >= since30);
  const firstWeek = (st: { id: string; created_at: string }) => {
    const start = new Date(st.created_at).getTime();
    return (opened.data ?? []).some((a) => a.student_id === st.id && new Date(a.created_at).getTime() - start <= 7 * DAY);
  };
  const activated = joined.filter(firstWeek).length;

  // Conversion: students who ever bought a membership or a paid course.
  const studentIds = new Set(students.map((st) => st.id));
  const paying = new Set(
    [...(memberships.data ?? []).map((m) => m.user_id), ...(enrollments.data ?? []).map((e) => e.user_id)].filter((id) => studentIds.has(id))
  );

  // Renewal: of people whose first membership has ended, how many bought another.
  const byUser = new Map<string, string[]>();
  for (const m of memberships.data ?? []) byUser.set(m.user_id, [...(byUser.get(m.user_id) ?? []), m.ends_at]);
  const nowIso = new Date().toISOString();
  const eligible = [...byUser.values()].filter((ends) => [...ends].sort()[0] < nowIso);
  const renewed = eligible.filter((ends) => ends.length > 1).length;

  // Most opened videos in the last 30 days.
  const counts = new Map<string, number>();
  for (const v of views.data ?? []) if (v.ref_id) counts.set(v.ref_id, (counts.get(v.ref_id) ?? 0) + 1);
  const topIds = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const titles = topIds.length
    ? (await supabase.from("videos").select("id, title").in("id", topIds.map(([id]) => id))).data ?? []
    : [];
  const titleOf = new Map(titles.map((t) => [t.id, t.title]));

  return {
    activation: { rate: pct(activated, joined.length), joined: joined.length },
    conversion: { rate: pct(paying.size, students.length), paying: paying.size, total: students.length },
    renewal: { rate: pct(renewed, eligible.length), eligible: eligible.length },
    published30: published.count ?? 0,
    top: topIds.map(([id, n]) => ({ id, title: titleOf.get(id) ?? "Removed video", views: n })),
  };
}

function HealthSection({ health }: { health: Health }) {
  const { activation, conversion, renewal, published30, top } = health;
  return (
    <section className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 24 }}>How the platform is doing</h2>
      <div className="stats">
        <div className="stat">
          <p className="label">Activation</p>
          <p className="num">{activation.rate === null ? "No data" : `${activation.rate}%`}</p>
          <p className="hint">of {activation.joined} new sign-ups watched a video in their first week</p>
        </div>
        <div className="stat">
          <p className="label">Conversion</p>
          <p className="num">{conversion.rate === null ? "No data" : `${conversion.rate}%`}</p>
          <p className="hint">{conversion.paying} of {conversion.total} students became members or bought a course</p>
        </div>
        <div className="stat">
          <p className="label">Renewal</p>
          <p className="num">{renewal.rate === null ? "No data" : `${renewal.rate}%`}</p>
          <p className="hint">{renewal.eligible ? `of ${renewal.eligible} finished memberships were renewed` : "shows once a first membership ends"}</p>
        </div>
        <div className="stat">
          <p className="label">Published, 30 days</p>
          <p className="num">{published30}</p>
          <p className="hint">new videos added to the library</p>
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>Most watched, last 30 days</h3>
        {top.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Watch counts appear once students start practicing.</p>
        ) : (
          top.map((t, i) => (
            <div key={t.id} className="list-item" style={{ borderTop: "1px solid var(--hair)" }}>
              <span style={{ width: 22, color: "var(--muted)" }}>{i + 1}</span>
              <p style={{ flex: 1, minWidth: 0, fontWeight: 500 }}>{t.title}</p>
              <span className="pill">{t.views} {t.views === 1 ? "view" : "views"}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
