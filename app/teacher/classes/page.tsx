import Link from "next/link";
import { requireTeacher } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { AddClassForm } from "./AddClassForm";

export default async function Classes({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const { supabase } = await requireTeacher();
  const now = new Date().toISOString();
  const since = new Date(Date.now() - 21 * 86400000).toISOString();

  const [upcoming, recent, students, marked] = await Promise.all([
    supabase.from("classes").select("id, title, kind, starts_at, duration_minutes").gte("starts_at", now).order("starts_at").limit(20),
    supabase.from("classes").select("id, title, kind, starts_at, duration_minutes").lt("starts_at", now).gte("starts_at", since).order("starts_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name").eq("role", "student").order("full_name"),
    supabase.from("attendance").select("class_id").gte("marked_at", since),
  ]);

  const markedIds = new Set((marked.data ?? []).map((m) => m.class_id));

  return (
    <>
      <h1 style={{ fontSize: 38 }}>Classes and attendance</h1>
      {saved ? <p className="success" role="status">Attendance saved.</p> : null}

      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ fontSize: 24 }}>Mark attendance</h2>
        {(recent.data ?? []).length === 0 ? <p style={{ color: "var(--muted)" }}>Classes from the last three weeks will show here.</p> : null}
        {(recent.data ?? []).map((c) => (
          <div key={c.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, borderTop: "1px solid var(--hair)", paddingTop: 10 }}>
            <span><strong>{c.title}</strong> · {c.kind} · {formatDateTime(c.starts_at)}</span>
            <Link className={markedIds.has(c.id) ? "btn btn-outline btn-small" : "btn btn-small"} href={`/teacher/classes/${c.id}`}>
              {markedIds.has(c.id) ? "Edit attendance" : "Mark attendance"}
            </Link>
          </div>
        ))}
      </section>

      <div className="row">
        <section className="card" style={{ flex: "2 1 460px", display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 24 }}>Add a class</h2>
          <AddClassForm students={students.data ?? []} />
        </section>
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ fontSize: 24 }}>Upcoming</h2>
          {(upcoming.data ?? []).length === 0 ? <p style={{ color: "var(--muted)" }}>No upcoming classes.</p> : null}
          {(upcoming.data ?? []).map((c) => (
            <div key={c.id} style={{ borderTop: "1px solid var(--hair)", paddingTop: 10 }}>
              <Link href={`/teacher/classes/${c.id}`} style={{ fontWeight: 500 }}>{c.title}</Link>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>{formatDateTime(c.starts_at)} · {c.duration_minutes} min · {c.kind}</p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
