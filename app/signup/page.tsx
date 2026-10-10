import { redirect } from "next/navigation";

// Registration now lives on the login page. Older links land there.
export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  redirect(`/login?mode=register${next ? `&next=${encodeURIComponent(next)}` : ""}`);
}
