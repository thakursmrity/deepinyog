import Link from "next/link";
import { getAccess } from "@/lib/access";
import { requireStudent } from "@/lib/auth";
import { firstName, formatDate, formatDateTime, greeting, streakFrom, todayLong } from "@/lib/format";
import { external } from "@/lib/links";

type ClassRow = { id: string; title: string; kind: string; starts_at: string; duration_minutes: number; meeting_link: string | null };

export default async function StudentToday({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { supabase, profile } = await requireStudent();
  const access = await getAccess(supabase, profile.id);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();

  const [nextClass, monthClasses, attended, assignments, note, details, activity] = await Promise.all([
    supabase
      .from("classes")
      .select("id, title, kind, starts_at, duration_minutes, meeting_link")
      .gte("starts_at", new Date(Date.now() - 60 * 60000).toISOString())
      .order("starts_at")
      .limit(1)
      .maybeSingle<ClassRow>(),
    supabase.from("classes").select("id", { count: "exact", head: true }).gte("starts_at", monthStart).lte("starts_at", now.toISOString()),
    supabase.from("attendance").select("class_id, present, classes!inner(starts_at)").eq("student_id", profile.id).eq("present", true).gte("classes.starts_at", monthStart),
    supabase
      .from("video_assignments")
      .select("id, assigned_at, completed_at, videos(id, title, duration_minutes)")
      .eq("student_id", profile.id)
      .order("assigned_at", { ascending: false })
      .limit(5),
    supabase.from("notes").select("body, created_at").eq("student_id", profile.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("student_details").select("goals").eq("student_id", profile.id).maybeSingle(),
    supabase.from("activity").select("created_at").eq("student_id", profile.id).in("kind", ["video_completed", "class_attended", "video_opened"]).gte("created_at", sixtyDaysAgo),
  ]);

  const held = monthClasses.count ?? 0;
  const went = attended.data?.length ?? 0;
  const streak = streakFrom((activity.data ?? []).map((a) => a.created_at));
  const c = nextClass.data;

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
        <div>
          <p style={{ color: "var(--muted)", marginBottom: 6 }}>{todayLong()}</p>
          <h1 style={{ fontSize: 38 }}>
            {greeting()}, {firstName(profile.full_name)}
          </h1>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        {access.memberUntil ? (
          <span className="pill" style={{ fontSize: 14 }}>Member until {formatDate(access.memberUntil)}</span>
        ) : (
          <Link className="btn btn-outline btn-small" href="/app/membership">Become a member</Link>
        )}
        {streak > 0 ? (
          <p style={{ background: "var(--surface)", padding: "10px 16px", borderRadius: 999, fontWeight: 500 }}>
            {streak} day practice streak
          </p>
        ) : null}
        </div>
      </div>
      {welcome === "member" ? <p className="success" role="status">Welcome, member! The full library is now open to you.</p> : null}

      <div className="row">
        <div className="card" style={{ background: "var(--blush-soft)", borderColor: "var(--blush)", display: "flex", flexDirection: "column", gap: 10 }}>
          <p className="eyebrow" style={{ color: "var(--saffron-ink)" }}>Next class</p>
          {c ? (
            <>
              <p className="display" style={{ fontSize: 28 }}>{c.title}</p>
              <p style={{ color: "var(--soft)" }}>
                {formatDateTime(c.starts_at)}, {c.duration_minutes} minutes, {c.kind}
              </p>
              {c.meeting_link ? (
                <a className="btn" href={c.meeting_link} {...external} style={{ alignSelf: "flex-start", marginTop: 10 }}>
                  Join class
                </a>
              ) : null}
            </>
          ) : (
            <p style={{ color: "var(--soft)" }}>No class scheduled yet. I will add the next one soon.</p>
          )}
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p className="eyebrow">This month</p>
          <p className="display" style={{ fontSize: 28 }}>
            {held > 0 ? `${Math.min(went, held)} of ${held} classes attended` : "Your month starts here"}
          </p>
          {held > 0 ? (
            <div style={{ display: "flex", gap: 6 }} role="img" aria-label={`${Math.min(went, held)} of ${held} classes attended`}>
              {Array.from({ length: Math.min(held, 20) }).map((_, i) => (
                <span key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: i < went ? "var(--sage-ink)" : "var(--line)" }} />
              ))}
            </div>
          ) : null}
          {details.data?.goals ? <p style={{ color: "var(--muted)" }}>Your goal: {details.data.goals}</p> : null}
        </div>
      </div>

      <div className="row">
        <section className="card" style={{ flex: "2 1 420px", display: "flex", flexDirection: "column", gap: 8 }}>
          <h2 style={{ fontSize: 24, marginBottom: 8 }}>Practice picked for you</h2>
          {(assignments.data ?? []).length === 0 ? (
            <p style={{ color: "var(--muted)" }}>
              Nothing picked for you yet. Start with the <Link href="/app/library">practice library</Link>.
            </p>
          ) : (
            (assignments.data ?? []).map((a) => {
              const v = Array.isArray(a.videos) ? a.videos[0] : a.videos;
              if (!v) return null;
              return (
                <div key={a.id} className="list-item">
                  <div className="thumb" aria-hidden="true" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500 }}>{v.title}</p>
                    <p style={{ color: "var(--muted)", fontSize: 14 }}>
                      {v.duration_minutes ? `${v.duration_minutes} min, ` : ""}assigned {formatDate(a.assigned_at)}
                    </p>
                  </div>
                  {a.completed_at ? <span className="pill">Done</span> : <Link href={`/app/videos/${v.id}`} style={{ fontWeight: 700 }}>Watch</Link>}
                </div>
              );
            })
          )}
        </section>

        <section className="card" style={{ background: "var(--sand)", display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ fontSize: 24 }}>A note from me</h2>
          {note.data ? (
            <>
              <p style={{ lineHeight: 1.6, color: "var(--soft)", whiteSpace: "pre-line" }}>{note.data.body}</p>
              <p style={{ fontSize: 14, color: "var(--sand-ink)" }}>{formatDate(note.data.created_at)}</p>
            </>
          ) : (
            <p style={{ color: "var(--sand-ink)" }}>My notes for you will show up here.</p>
          )}
        </section>
      </div>
    </>
  );
}
