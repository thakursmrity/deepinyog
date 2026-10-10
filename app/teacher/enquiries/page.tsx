import Link from "next/link";
import { requireTeacher } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { setEnquiryStatus } from "../actions";

const LABELS: Record<string, string> = { new: "New", contacted: "Contacted", joined: "Joined", closed: "Closed" };

export default async function Enquiries() {
  const { supabase } = await requireTeacher();
  const { data } = await supabase
    .from("enquiries")
    .select("id, name, contact, interest, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = data ?? [];
  const total = rows.length;
  const joined = rows.filter((r) => r.status === "joined").length;

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
        <h1 style={{ fontSize: 38 }}>Enquiries</h1>
        {total > 0 ? (
          <p style={{ color: "var(--muted)" }}>
            {joined} of {total} joined ({Math.round((joined / total) * 100)}%)
          </p>
        ) : null}
      </div>

      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {rows.length === 0 ? <p style={{ color: "var(--muted)" }}>Messages from the website&apos;s enquiry form will show here.</p> : null}
        {rows.map((r) => {
          const isEmail = r.contact.includes("@");
          const prefill = new URLSearchParams({ name: r.name, [isEmail ? "email" : "phone"]: r.contact });
          return (
            <div key={r.id} style={{ borderTop: "1px solid var(--hair)", padding: "14px 0", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <p style={{ fontWeight: 700 }}>
                  {r.name} {r.status === "new" ? <span className="pill pill-warn" style={{ marginLeft: 6 }}>New</span> : null}
                </p>
                <p>
                  {isEmail ? <a href={`mailto:${r.contact}`}>{r.contact}</a> : <a href={`tel:${r.contact.replace(/\s/g, "")}`}>{r.contact}</a>} · {r.interest}
                </p>
                {r.message ? <p style={{ color: "var(--soft)", whiteSpace: "pre-line" }}>{r.message}</p> : null}
                <p style={{ color: "var(--muted)", fontSize: 13 }}>{formatDateTime(r.created_at)}</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <form action={setEnquiryStatus.bind(null, r.id)} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13 }}>Status</span>
                    <select name="status" defaultValue={r.status}>
                      {Object.entries(LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </label>
                  <button className="btn btn-outline btn-small" type="submit">Save</button>
                </form>
                {r.status !== "joined" ? (
                  <Link className="btn btn-small" href={`/teacher/students/new?${prefill.toString()}`}>Add as student</Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
