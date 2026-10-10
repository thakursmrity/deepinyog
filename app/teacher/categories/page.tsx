import Link from "next/link";
import { requireTeacher } from "@/lib/auth";
import { CATEGORY_FIELDS, groupCategories, type Category } from "@/lib/categories";
import { CategoryForm } from "./CategoryForm";

export default async function TeacherCategories({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;
  const { supabase } = await requireTeacher();
  const [{ data }, { data: links }] = await Promise.all([
    supabase.from("categories").select(CATEGORY_FIELDS),
    supabase.from("video_categories").select("category_id"),
  ]);
  const cats = (data ?? []) as Category[];
  const groups = groupCategories(cats);
  const counts = new Map<string, number>();
  for (const l of links ?? []) counts.set(l.category_id, (counts.get(l.category_id) ?? 0) + 1);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 38 }}>Programs</h1>
        <p style={{ color: "var(--soft)", maxWidth: 720 }}>
          Open a program to add or remove its videos and edit its page. Programs appear on the website in the Programs menu and on the home page.
        </p>
      </div>
      {deleted ? <p className="success" role="status">Program deleted. Its videos are still in your video library.</p> : null}

      <details className="card" style={{ padding: "18px 22px" }}>
        <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 18, minHeight: 32 }}>Add a program</summary>
        <div style={{ marginTop: 16 }}>
          <CategoryForm groups={groups.map((g) => g.name)} />
        </div>
      </details>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {groups.map((g) => (
          <section key={g.name} className="card" style={{ display: "flex", flexDirection: "column", gap: 4, padding: 24 }}>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>{g.name}</h2>
            {g.items.map((c) => (
              <Link
                key={c.id}
                href={`/teacher/categories/${c.id}`}
                style={{ textDecoration: "none", color: "var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "12px 0", borderTop: "1px solid var(--hair)", minHeight: 44 }}
              >
                <span style={{ fontWeight: 500 }}>
                  {c.title} {!c.active ? <span className="pill" style={{ background: "var(--tint)", color: "var(--muted)", marginLeft: 4 }}>Hidden</span> : null}
                </span>
                <span style={{ color: "var(--muted)", fontSize: 14, whiteSpace: "nowrap" }}>
                  {counts.get(c.id) ?? 0} {counts.get(c.id) === 1 ? "video" : "videos"}
                </span>
              </Link>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
