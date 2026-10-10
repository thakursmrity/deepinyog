import Link from "next/link";
import { ProgramMotif } from "@/components/ProgramMotif";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { getPrograms } from "@/lib/programs";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Programs | Deepinyog" };
export const dynamic = "force-dynamic";

export default async function Programs() {
  const supabase = await createClient();
  const { programs } = await getPrograms(supabase);

  return (
    <>
      <PublicHeader />
      <main className="container" style={{ paddingTop: 48, paddingBottom: 96, display: "flex", flexDirection: "column", gap: 36 }}>
        <div style={{ maxWidth: 660, display: "flex", flexDirection: "column", gap: 14 }}>
          <h1 style={{ fontSize: "clamp(42px, 6vw, 68px)", lineHeight: 1.02 }}>Find your practice</h1>
          <p style={{ fontSize: 19, color: "var(--soft)", lineHeight: 1.6, margin: 0 }}>
            Each program is a different doorway in. Open one to see what it helps with and how we practise together.
          </p>
        </div>
        <ul className="program-index">
          {programs.map((p) => (
            <li key={p.slug}>
              <Link href={`/programs/${p.slug}`}>
                <span className="motif"><ProgramMotif slug={p.slug} size={30} /></span>
                <span>
                  <span className="title" style={{ display: "block" }}>{p.title}</span>
                  <span className="tag" style={{ display: "block" }}>{p.tagline}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <PublicFooter />
    </>
  );
}
