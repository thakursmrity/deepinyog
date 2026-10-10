import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LINKS, external } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";

export async function PublicHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="container" style={{ padding: "24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <Link href="/" style={{ textDecoration: "none" }}>
        <Logo tagline />
      </Link>
      <nav aria-label="Main" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 22 }}>
        <Link href="/practice" style={{ textDecoration: "none" }}>Practices</Link>
        <Link href="/courses" style={{ textDecoration: "none" }}>Programs</Link>
        <Link href="/#work-with-me" style={{ textDecoration: "none" }}>Work with me</Link>
        <Link href="/#about" style={{ textDecoration: "none" }}>About</Link>
        {user ? (
          <Link className="btn" href="/app">My practice</Link>
        ) : (
          <>
            <Link href="/login" style={{ textDecoration: "none" }}>Sign in</Link>
            <Link className="btn" href="/signup">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--hair)", background: "var(--white)" }}>
      <div className="container" style={{ paddingTop: 28, paddingBottom: 28, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20, fontSize: 15 }}>
        <Logo tagline />
        <nav aria-label="Social" style={{ display: "flex", flexWrap: "wrap", gap: 22 }}>
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
