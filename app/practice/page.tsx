import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { CATEGORY_FIELDS, GROUP_BLURB, groupCategories, type Category } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Practices for mind, body and soul | Deepinyog" };
export const dynamic = "force-dynamic";

export default async function Practice() {
  const supabase = await createClient();
  const [{ data: cats }, { data: links }] = await Promise.all([
    supabase.from("categories").select(CATEGORY_FIELDS).eq("active", true),
    supabase.from("video_categories").select("category_id"),
  ]);
  const counts = new Map<string, number>();
  for (const l of links ?? []) counts.set(l.category_id, (counts.get(l.category_id) ?? 0) + 1);
  const groups = groupCategories((cats ?? []) as Category[]);

  return (
    <>
      <PublicHeader />
      <main>
        <section className="container" style={{ paddingTop: 40, paddingBottom: 48, display: "flex", flexDirection: "column", gap: 14, maxWidth: 1200 }}>
          <p className="eyebrow">Practices</p>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 54px)", lineHeight: 1.1, maxWidth: 760 }}>Practices for mind, body and soul</h1>
          <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.6, maxWidth: 640 }}>
            Yoga, breathwork, meditation and healing, gathered by what you need. Each topic has a short guide and the practices made for it.
          </p>
        </section>

        <section className="wash">
          <div className="container" style={{ paddingTop: 56, paddingBottom: 80, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {groups.map((g) => (
              <div key={g.name} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <h2 style={{ fontSize: 26 }}>{g.name}</h2>
                  {GROUP_BLURB[g.name] ? <p style={{ color: "var(--muted)", marginTop: 4 }}>{GROUP_BLURB[g.name]}</p> : null}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {g.items.map((c) => (
                    <Link
                      key={c.id}
                      href={`/practice/${c.slug}`}
                      style={{ textDecoration: "none", color: "var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 0", borderTop: "1px solid var(--hair)", minHeight: 44 }}
                    >
                      <span style={{ fontWeight: 500 }}>{c.title}</span>
                      <span style={{ color: "var(--muted)", fontSize: 14, whiteSpace: "nowrap" }}>
                        {counts.get(c.id) ? `${counts.get(c.id)} ${counts.get(c.id) === 1 ? "video" : "videos"}` : "Guide"}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
