import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MenuCloser } from "@/components/MenuCloser";
import { LINKS, external } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";

// A short, calm menu. Each item is its own page.
export async function PublicHeader() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  return (
    <header className="site-header">
      <MenuCloser />
      <div className="container site-header-inner">
        <Link href="/" style={{ textDecoration: "none" }} aria-label="Deepinyog home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="site-nav">
          <Link className="nav-link" href="/about">About me</Link>
          <Link className="nav-link" href="/programs">Programs</Link>
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
        <Logo />
        <nav aria-label="Elsewhere" style={{ display: "flex", flexWrap: "wrap", gap: 22 }}>
          <Link href="/about">About me</Link>
          <Link href="/programs">Programs</Link>
          <Link href="/connect">Connect</Link>
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
