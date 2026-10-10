import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
      <h1 style={{ fontSize: 36 }}>This page isn&apos;t here</h1>
      <Link className="btn" href="/">Back to Deepinyog</Link>
    </main>
  );
}
