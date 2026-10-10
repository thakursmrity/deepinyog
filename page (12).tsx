import { COURSE_FIELDS, CourseCard, type CourseRow } from "@/components/CourseCard";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Live sessions | Deepinyog" };
export const dynamic = "force-dynamic";

export default async function Courses() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase.from("courses").select(COURSE_FIELDS).neq("status", "closed").order("created_at", { ascending: false });
  const courses = (data ?? []) as CourseRow[];
  const owned = new Set<string>();
  if (user) {
    const { data: e } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id);
    (e ?? []).forEach((r) => owned.add(r.course_id));
  }

  const open = courses.filter((c) => c.status === "open");
  const upcoming = courses.filter((c) => c.status === "upcoming");

  return (
    <>
      <PublicHeader />
      <main className="container" style={{ paddingTop: 40, paddingBottom: 88, display: "flex", flexDirection: "column", gap: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 680 }}>
                    <h1 style={{ fontSize: "clamp(36px, 5vw, 52px)", lineHeight: 1.1 }}>Live sessions</h1>
          <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.6 }}>Join me live in programs and workshops, or learn at your own pace with recorded courses. For upcoming ones, join the waitlist and I will let you know as soon as they open.</p>
        </div>

        {courses.length === 0 ? <p style={{ color: "var(--muted)" }}>New sessions are on the way. Sign up to hear about them first.</p> : null}

        {open.length > 0 ? (
          <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 32 }}>Open now</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              {open.map((c) => <CourseCard key={c.id} c={c} owned={owned.has(c.id)} showPrice={Boolean(user)} />)}
            </div>
          </section>
        ) : null}

        {upcoming.length > 0 ? (
          <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 32 }}>Coming soon</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              {upcoming.map((c) => <CourseCard key={c.id} c={c} showPrice={Boolean(user)} />)}
            </div>
          </section>
        ) : null}
      </main>
      <PublicFooter />
    </>
  );
}
