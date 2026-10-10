"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; info?: string };
export type LoginState = AuthState;

// Only same-site paths, never another website.
function safePath(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "";
}

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function homeFor(userId: string, next: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  const isTeacher = profile?.role === "teacher";
  if (!isTeacher) await supabase.from("activity").insert({ student_id: userId, kind: "login" });
  const target = safePath(next);
  if (isTeacher) return target.startsWith("/teacher") ? target : "/teacher";
  return target && !target.startsWith("/teacher") ? target : "/app";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    if (error?.message?.toLowerCase().includes("confirm")) return { error: "Please confirm your email first. Check your inbox for the link." };
    return { error: "That email and password don't match." };
  }
  redirect(await homeFor(data.user.id, next));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  // New members see the welcome and membership page first, unless they came from somewhere specific.
  const next = safePath(String(formData.get("next") ?? "")) || "/app/membership?welcome=1";
  if (!fullName || !email) return { error: "Please add your name and email." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
    },
  });
  if (error) {
    if (error.message.toLowerCase().includes("registered")) return { error: "This email already has an account. Please sign in." };
    return { error: error.message };
  }
  // With email confirmation off, the person is signed in straight away.
  if (data.session && data.user) redirect(await homeFor(data.user.id, next));
  return { info: "Almost done. I've sent a confirmation link to your email; open it to begin." };
}

export async function signInWithGoogle(formData: FormData) {
  const next = safePath(String(formData.get("next") ?? ""));
  const supabase = await createClient();
  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}` },
  });
  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}

export async function finishSignIn(userId: string, next: string, isNew = false) {
  return homeFor(userId, next || (isNew ? "/app/membership?welcome=1" : ""));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
