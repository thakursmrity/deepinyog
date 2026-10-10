import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MenuCloser } from "@/components/MenuCloser";
import { ProgramMotif } from "@/components/ProgramMotif";
import { LINKS, external } from "@/lib/links";
import { getPrograms } from "@/lib/programs";
import { createClient } from "@/lib/supabase/server";

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" style={{ transition: "transform 0.2s" }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export async function PublicHeader() {
  const supabase = await createClient();
  const [{ data: auth }, { programs }] = await Promise.all([supabase.auth.getUser(), getPrograms(supabase)]);
  const user = auth.user;

  return (
    <header className="site-header">
      <MenuCloser />
      <div className="container site-header-inner">
        <Link href="/" style={{ textDecoration: "none" }} aria-label="Deepinyog home">
          <Logo tagline />
        </Link>
        <nav aria-label="Main" className="site-nav">
          <details className="nav-menu">
            <summary>
              Programs <Chevron />
            </summary>
            <div className="nav-menu-panel">
              {programs.map((p) => (
                <Link key={p.slug} href={`/programs/${p.slug}`}>
                  <span className="menu-icon"><ProgramMotif slug={p.slug} size={24} /></span>
                  <span>
                    <span style={{ display: "block", fontWeight: 600 }}>{p.title}</span>
                    <span style={{ display: "block", fontSize: 14, color: "var(--muted)" }}>{p.tagline}</span>
                  </span>
                </Link>
              ))}
              <Link href="/courses" className="menu-foot">
                <span style={{ fontWeight: 600 }}>Upcoming live sessions</span>
                <span style={{ color: "var(--saffron-ink)" }}>See dates</span>
              </Link>
            </div>
          </details>
          <Link className="nav-link" href="/#about">About</Link>
          {user ? (
            <Link className="btn-login" href="/app">My practice</Link>
          ) : (
            <Link className="btn-login" href="/login">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--hair)", background: "var(--white)" }}>
      <div className="container" style={{ paddingTop: 28, paddingBottom: 28, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20, fontSize: 15 }}>
        <Logo tagline />
        <nav aria-label="Elsewhere" style={{ display: "flex", flexWrap: "wrap", gap: 22 }}>
          <Link href="/programs">Programs</Link>
          <Link href="/courses">Live sessions</Link>
          <a href={LINKS.instagram} {...external}>Instagram</a>
          <a href={LINKS.youtube} {...external}>YouTube</a>
          <a href={LINKS.facebook} {...external}>Facebook</a>
        </nav>
        <span style={{ color: "var(--muted)" }}>
          Platform by <a href={LINKS.builtBy} {...external}>Smrity</a>
        </span>
      </div>
    </footer>
  );
}
