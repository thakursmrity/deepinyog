import Link from "next/link";
import { formatDate } from "@/lib/format";
import { coursePrice, earlyBirdActive, inr } from "@/lib/money";

export type CourseRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: "upcoming" | "open" | "closed";
  price_paise: number;
  early_bird_price_paise: number | null;
  early_bird_until: string | null;
  starts_on: string | null;
  included_in_membership: boolean;
  kind: "course" | "program" | "workshop";
  schedule: string;
  hosts: string;
  register_url: string | null;
};

export const COURSE_FIELDS =
  "id, slug, title, summary, status, price_paise, early_bird_price_paise, early_bird_until, starts_on, included_in_membership, kind, schedule, hosts, register_url";

export const KIND_LABEL: Record<CourseRow["kind"], string> = { course: "Course", program: "Live program", workshop: "Workshop" };

export function StatusPill({ status }: { status: CourseRow["status"] }) {
  if (status === "upcoming") return <span className="pill pill-warn">Upcoming</span>;
  if (status === "open") return <span className="pill">Open now</span>;
  return <span className="pill" style={{ background: "#eee", color: "#444" }}>Closed</span>;
}

// Prices and membership details only show to people who are signed in.
export function CourseCard({ c, owned = false, showPrice = false }: { c: CourseRow; owned?: boolean; showPrice?: boolean }) {
  const early = earlyBirdActive(c);
  return (
    <Link href={`/courses/${c.slug}`} className="card" style={{ textDecoration: "none", color: "var(--ink)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <span className="pill" style={{ background: "var(--blush-soft)", color: "var(--ink)" }}>{KIND_LABEL[c.kind] ?? "Course"}</span>
        <StatusPill status={c.status} />
        {owned ? <span className="pill">Yours</span> : null}
        {showPrice && c.included_in_membership ? <span className="pill">Included in membership</span> : null}
      </div>
      <h3 style={{ fontSize: 26 }}>{c.title}</h3>
      {c.summary ? <p style={{ color: "var(--soft)", lineHeight: 1.6 }}>{c.summary}</p> : null}
      {c.schedule ? <p style={{ fontWeight: 500 }}>{c.schedule}</p> : null}
      {c.hosts ? <p style={{ color: "var(--muted)", fontSize: 15 }}>With {c.hosts}</p> : null}
      <div style={{ marginTop: "auto", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "baseline" }}>
        {showPrice && c.price_paise > 0 ? (
          <>
            <span className="display" style={{ fontSize: 24 }}>{inr(coursePrice(c))}</span>
            {early ? <span style={{ textDecoration: "line-through", color: "var(--muted)" }}>{inr(c.price_paise)}</span> : null}
            {early && c.early_bird_until ? <span style={{ fontSize: 14, color: "var(--saffron-ink)", fontWeight: 700 }}>Early bird until {formatDate(c.early_bird_until)}</span> : null}
          </>
        ) : null}
        {c.starts_on && !c.schedule ? <span style={{ fontSize: 14, color: "var(--muted)" }}>Starts {formatDate(c.starts_on)}</span> : null}
        <span style={{ fontWeight: 500, color: "var(--brand)" }}>{c.status === "upcoming" ? "Find out more" : "Learn more"}</span>
      </div>
    </Link>
  );
}
