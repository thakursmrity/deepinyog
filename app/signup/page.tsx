import Link from "next/link";
import { GoogleButton, SignUpForm } from "@/components/AuthForms";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Create your free account | Deepinyog" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "" } = await searchParams;
  const google = process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "on";

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card" style={{ width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 22 }}>
        <Link href="/" style={{ textDecoration: "none" }}><Logo /></Link>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 style={{ fontSize: 32 }}>Start practicing, free</h1>
          <ul style={{ margin: 0, paddingLeft: 20, color: "var(--soft)", lineHeight: 1.8 }}>
            <li>Free guided practice videos</li>
            <li>Your streak and progress, tracked for you</li>
            <li>A look inside every course and the full library</li>
          </ul>
        </div>
        {google ? (
          <>
            <GoogleButton next={next} />
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14 }}>or with email</p>
          </>
        ) : null}
        <SignUpForm next={next} />
        <p style={{ color: "var(--muted)" }}>
          Already have an account? <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}
