"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function toggleWaitlist(courseId: string, slug: string, join: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?mode=register&next=${encodeURIComponent(`/courses/${slug}`)}`);

  if (join) await supabase.from("waitlist").upsert({ user_id: user.id, course_id: courseId }, { onConflict: "user_id,course_id" });
  else await supabase.from("waitlist").delete().eq("user_id", user.id).eq("course_id", courseId);

  revalidatePath(`/courses/${slug}`);
  revalidatePath("/app/courses");
}

export async function enrollFree(courseId: string, slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?mode=register&next=${encodeURIComponent(`/courses/${slug}`)}`);
  await supabase.rpc("enroll_free", { course: courseId });
  revalidatePath(`/courses/${slug}`);
  redirect("/app/courses?welcome=1");
}
