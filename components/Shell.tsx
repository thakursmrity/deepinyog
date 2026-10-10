import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { Logo } from "@/components/Logo";

type NavItem = { href: string; label: string };

export function Shell({
  nav,
  dark = false,
  label,
  name,
  children,
}: {
  nav: NavItem[];
  dark?: boolean;
  label: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="shell">
      <aside className={dark ? "side side-dark" : "side"}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo />
        </Link>
        <p style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)" }}>
          {label}: {name}
        </p>
        <nav aria-label={label}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} style={{ marginTop: "auto" }}>
          <button type="submit" className="btn btn-outline btn-small">
            Sign out
          </button>
        </form>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
