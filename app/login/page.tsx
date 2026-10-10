import Link from "next/link";
import { GoogleButton, SignInForm, SignUpForm } from "@/components/AuthForms";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Log in | Deepinyog" };

const ERRORS: Record<string, string> = {
  google: "Google sign-in didn't work. Please try again, or use email.",
  link: "That link has expired or was already used. Please log in.",
};

// One door in: log in, or register as a new student with name, email and password.
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; mode?: string }> }) {
  const { next = "", error, mode } = await searchParams;
  const register = mode === "register";
  const google = process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "on";
  const q = (m?: string) => {
    const p = new URLSearchParams();
    if (m) p.set("mode", m);
    if (next) p.set("next", next);
    const s = p.toString();
    return s ? `/login?${s}` : "/login";
  };
  const tab = (on: boolean) => ({
    flex: 1,
    textAlign: "center" as const,
    padding: "10px 12px",
    borderRadius: 999,
    fontWeight: 600,
    textDecoration: "none",
    color: "var(--ink)",
    background: on ? "#fff" : "transparent",
    boxShadow: on ? "0 2px 10px rgba(90, 63, 71, 0.12)" : "none",
  });

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(180deg, #fff 0%, var(--saffron-mist) 100%)" }}>
      <div className="card" style={{ width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 22 }}>
        <Link href="/" style={{ textDecoration: "none" }}><Logo /></Link>

        <nav aria-label="Log in or register" style={{ display: "flex", gap: 4, background: "var(--tint)", borderRadius: 999, padding: 4 }}>
          <Link href={q()} style={tab(!register)} aria-current={!register ? "page" : undefined}>Log in</Link>
          <Link href={q("register")} style={tab(register)} aria-current={register ? "page" : undefined}>New here? Register</Link>
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 style={{ fontSize: 30 }}>{register ? "Begin your practice" : "Welcome back"}</h1>
          <p style={{ color: "var(--muted)" }}>
            {register ? "Create your practice space with your name, email and a password." : "Log in to continue your practice."}
          </p>
        </div>
        {error && ERRORS[error] ? <p className="error" role="alert">{ERRORS[error]}</p> : null}
        {google ? (
          <>
            <GoogleButton next={next} />
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14 }}>or with email</p>
          </>
        ) : null}
        {register ? <SignUpForm next={next} /> : <SignInForm next={next} />}
        <p style={{ color: "var(--muted)" }}>
          {register ? (
            <>Already have an account? <Link href={q()}>Log in</Link></>
          ) : (
            <>New to Deepinyog? <Link href={q("register")}>Register here</Link></>
          )}
        </p>
      </div>
    </main>
  );
}
