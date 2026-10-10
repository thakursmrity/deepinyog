import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { CATEGORY_FIELDS, GROUP_BLURB, PILLARS, groupCategories, type Category } from "@/lib/categories";
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
  const byName = new Map(groups.map((g) => [g.name, g]));
  const placed = new Set(PILLARS.flatMap((p) => p.groups));
  const extra = groups.filter((g) => !placed.has(g.name));

  const sections = [
    ...PILLARS.map((p) => ({ ...p, list: p.groups.map((n) => byName.get(n)).filter((g): g is NonNullable<typeof g> => Boolean(g)) })),
    ...(extra.length ? [{ slug: "more", name: "More practices", line: "", blurb: "", tint: "#ffffff", groups: [], list: extra }] : []),
  ].filter((s) => s.list.length > 0);

  return (
    <>
      <PublicHeader />
      <main>
        <section className="container" style={{ paddingTop: 40, paddingBottom: 40, display: "flex", flexDirection: "column", gap: 14 }}>
          <p className="eyebrow">Practices</p>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 54px)", lineHeight: 1.1, maxWidth: 760 }}>Practices for mind, body and soul</h1>
          <p style={{ fontSize: 18, color: "var(--soft)", lineHeight: 1.6, maxWidth: 640 }}>
            Yoga, breathwork, meditation and healing, gathered by what you need. Each topic has a short guide from me and the practices I&apos;ve made for it.
          </p>
          {sections.length > 0 ? (
            <nav aria-label="Jump to" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
              {sections.map((s) => (
                <a key={s.slug} className="chip" href={`#${s.slug}`}>{s.name}</a>
              ))}
            </nav>
          ) : null}
        </section>

        {sections.length === 0 ? (
          <section className="container" style={{ paddingBottom: 88 }}>
            <div className="card">
              <p style={{ color: "var(--soft)" }}>New practices are being added. Please check back soon.</p>
            </div>
          </section>
        ) : null}

        {sections.map((s, i) => (
          <section key={s.slug} id={s.slug} className={i % 2 === 0 ? "wash" : undefined} style={{ scrollMarginTop: 16 }}>
            <div className="container" style={{ paddingTop: 56, paddingBottom: 56, display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 680 }}>
                <h2 style={{ fontSize: "clamp(30px, 4vw, 40px)" }}>{s.name}</h2>
                {s.line ? <p style={{ color: "var(--saffron-ink)", fontWeight: 500 }}>{s.line}</p> : null}
                {s.blurb ? <p style={{ color: "var(--soft)", lineHeight: 1.6 }}>{s.blurb}</p> : null}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                {s.list.map((g) => (
                  <div key={g.name} className="card" style={{ display: "flex", flexDirection: "column", gap: 12, background: s.tint }}>
                    <div>
                      <h3 style={{ fontSize: 24 }}>{g.name}</h3>
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
                            {counts.get(c.id) ? `${counts.get(c.id)} ${counts.get(c.id) === 1 ? "practice" : "practices"}` : "Guide"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>
      <PublicFooter />
    </>
  );
}
