// Checkbox list of categories, grouped. Used in the uploader and the video list.
export type PickCategory = { id: string; grp: string; title: string; sort: number };

export function CategoryPicker({ categories, selected = [], compact = false }: { categories: PickCategory[]; selected?: string[]; compact?: boolean }) {
  const groups = new Map<string, PickCategory[]>();
  for (const c of [...categories].sort((a, b) => a.sort - b.sort)) {
    if (!groups.has(c.grp)) groups.set(c.grp, []);
    groups.get(c.grp)!.push(c);
  }
  const chosen = new Set(selected);

  return (
    <details style={{ border: "1px solid var(--line)", borderRadius: 12, padding: compact ? "8px 12px" : "12px 14px", background: "#fff" }}>
      <summary style={{ cursor: "pointer", fontWeight: 500, minHeight: 28 }}>
        Topics {chosen.size ? `(${chosen.size} chosen)` : "(none yet)"}
      </summary>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 12 }}>
        {[...groups.entries()].map(([grp, items]) => (
          <fieldset key={grp} style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <legend style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>{grp}</legend>
            {items.map((c) => (
              <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32, fontSize: 15 }}>
                <input type="checkbox" name="category" value={c.id} defaultChecked={chosen.has(c.id)} style={{ width: 18, height: 18 }} />
                {c.title}
              </label>
            ))}
          </fieldset>
        ))}
      </div>
    </details>
  );
}
