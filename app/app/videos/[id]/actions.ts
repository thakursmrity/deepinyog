"use server";

import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/auth";

export async function markDone(assignmentId: string | null, videoId: string) {
  const { supabase, profile } = await requireStudent();
  if (assignmentId) await supabase.rpc("complete_assignment", { assignment: assignmentId });
  await supabase.from("activity").insert({ student_id: profile.id, kind: "video_completed", ref_id: videoId });
  revalidatePath("/app", "layout");
}
