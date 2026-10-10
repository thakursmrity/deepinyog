import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  role: "teacher" | "student";
  full_name: string;
  email: string | null;
  phone: string | null;
};

// Returns the signed-in person's profile, or sends them to /login.
export async function requireProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, phone")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile) redirect("/login?error=profile");

  return { supabase, profile };
}

export async function requireTeacher() {
  const ctx = await requireProfile();
  if (ctx.profile.role !== "teacher") redirect("/app");
  return ctx;
}

export async function requireStudent() {
  const ctx = await requireProfile();
  if (ctx.profile.role === "teacher") redirect("/teacher");
  return ctx;
}
