// Reads the Supabase settings and tidies them, so a pasted value like
// "https://abc.supabase.co/rest/v1/" or one with spaces still works.
// NEXT_PUBLIC_ values are written out in full so Next.js can include them in the browser build.

function cleanUrl(raw: string | undefined) {
  const value = (raw ?? "").trim().replace(/^["']|["']$/g, "");
  if (!value) return "";
  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`).origin;
  } catch {
    return value.replace(/\/+$/, "");
  }
}

export const SUPABASE_URL = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/^["']|["']$/g, "");
