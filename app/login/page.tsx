import Link from "next/link";
import { GoogleButton, SignInForm } from "@/components/AuthForms";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Sign in | Deepinyog" };

const ERRORS: Record<string, string> = {
  google: "Google sign-in didn't work. Please try again, or use email.",
  link: "That link has expired or was already used. Please sign in.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = "", error } = await searchParams;
  const google = process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "on";

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 22 }}>
        <Link href="/" style={{ textDecoration: "none" }}><Logo /></Link>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 style={{ fontSize: 32 }}>Welcome back</h1>
          <p style={{ color: "var(--muted)" }}>Sign in to continue your practice.</p>
        </div>
        {error && ERRORS[error] ? <p className="error" role="alert">{ERRORS[error]}</p> : null}
        {google ? (
          <>
            <GoogleButton next={next} />
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14 }}>or with email</p>
          </>
        ) : null}
        <SignInForm next={next} />
        <p style={{ color: "var(--muted)" }}>
          New here? <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Sign up</Link>
        </p>
      </div>
    </main>
  );
}
