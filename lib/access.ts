import type { SupabaseClient } from "@supabase/supabase-js";

export type Access = {
  memberUntil: string | null;
  enrolled: Set<string>;
  waitlisted: Set<string>;
  assigned: Set<string>;
};

export async function getAccess(supabase: SupabaseClient, userId: string): Promise<Access> {
  const nowIso = new Date().toISOString();
  const [membership, enrollments, waitlist, assignments] = await Promise.all([
    supabase.from("memberships").select("ends_at").eq("user_id", userId).lte("starts_at", nowIso).gt("ends_at", nowIso).order("ends_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("enrollments").select("course_id").eq("user_id", userId),
    supabase.from("waitlist").select("course_id").eq("user_id", userId),
    supabase.from("video_assignments").select("video_id").eq("student_id", userId),
  ]);

  // A renewal bought in advance starts later; show the furthest end date.
  let memberUntil = membership.data?.ends_at ?? null;
  if (memberUntil) {
    const { data: future } = await supabase.from("memberships").select("ends_at").eq("user_id", userId).order("ends_at", { ascending: false }).limit(1).maybeSingle();
    memberUntil = future?.ends_at ?? memberUntil;
  }

  return {
    memberUntil,
    enrolled: new Set((enrollments.data ?? []).map((e) => e.course_id)),
    waitlisted: new Set((waitlist.data ?? []).map((w) => w.course_id)),
    assigned: new Set((assignments.data ?? []).map((a) => a.video_id)),
  };
}

export type VideoMeta = {
  id: string;
  access: "free" | "members" | "course" | "assigned";
  course_id: string | null;
};

export type CourseMeta = { id: string; included_in_membership: boolean };

// Mirrors the database rule, for showing locks. The database still has the final say.
export function canWatch(v: VideoMeta, a: Access, coursesById: Map<string, CourseMeta>) {
  if (v.access === "free") return true;
  if (a.assigned.has(v.id)) return true;
  if (v.access === "members") return Boolean(a.memberUntil);
  if (v.course_id) {
    if (a.enrolled.has(v.course_id)) return true;
    return Boolean(a.memberUntil && coursesById.get(v.course_id)?.included_in_membership);
  }
  return false;
}
