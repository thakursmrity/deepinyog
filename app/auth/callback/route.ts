import { NextResponse, type NextRequest } from "next/server";
import { finishSignIn } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/server";

// Where Google sign-in and email confirmation links land.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const target = await finishSignIn(data.user.id, next);
      return NextResponse.redirect(new URL(target, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
