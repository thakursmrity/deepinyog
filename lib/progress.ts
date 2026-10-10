import type { SupabaseClient } from "@supabase/supabase-js";
import { canWatch, type Access, type CourseMeta, type VideoMeta } from "@/lib/access";

// Progress for one student: what they finished, where to pick up, and what to try next.
// Built from the activity log, so it works for every video, not only assigned ones.

export type LessonVideo = VideoMeta & { title: string; duration_minutes: number | null; youtube_id: string | null; sort: number; created_at: string };

export type ProgramProgress = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  total: number;
  finished: number;
  next: (LessonVideo & { day: number }) | null;
};

export type NextSteps = {
  done: Set<string>;
  continueVideo: LessonVideo | null;
  programs: ProgramProgress[];
  recommended: LessonVideo | null;
};

const VIDEO_FIELDS = "id, title, duration_minutes, access, course_id, youtube_id, sort, created_at";

type CourseRow = CourseMeta & { slug: string; title: string; kind: string; status: string };

export function myCourseIds(courses: CourseRow[], access: Access) {
  return courses.filter((c) => access.enrolled.has(c.id) || (access.memberUntil && c.included_in_membership && c.status !== "upcoming"));
}

export async function getNextSteps(supabase: SupabaseClient, userId: string, access: Access): Promise<NextSteps> {
  const [activityRes, coursesRes, catalogRes] = await Promise.all([
    supabase
      .from("activity")
      .select("kind, ref_id, created_at")
      .eq("student_id", userId)
      .in("kind", ["video_opened", "video_completed"])
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("courses").select("id, slug, title, kind, status, included_in_membership"),
    supabase
      .from("videos")
      .select(VIDEO_FIELDS)
      .in("access", ["free", "members", "course"])
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const activity = activityRes.data ?? [];
  const done = new Set(activity.filter((a) => a.kind === "video_completed" && a.ref_id).map((a) => a.ref_id as string));
  const courses = (coursesRes.data ?? []) as CourseRow[];
  const byId = new Map<string, CourseRow>(courses.map((c) => [c.id, c]));
  const catalog = (catalogRes.data ?? []) as LessonVideo[];
  const catalogById = new Map(catalog.map((v) => [v.id, v]));

  // Programs and courses the student has, in lesson order.
  const mine = myCourseIds(courses, access);
  const lessons = catalog
    .filter((v) => v.course_id && mine.some((c) => c.id === v.course_id))
    .sort((a, b) => a.sort - b.sort || a.created_at.localeCompare(b.created_at));
  const programs: ProgramProgress[] = mine.map((c) => {
    const list = lessons.filter((l) => l.course_id === c.id);
    const idx = list.findIndex((l) => !done.has(l.id));
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      kind: c.kind,
      total: list.length,
      finished: list.filter((l) => done.has(l.id)).length,
      next: idx >= 0 ? { ...list[idx], day: idx + 1 } : null,
    };
  });

  // The most recent video they opened but did not finish.
  let continueVideo: LessonVideo | null = null;
  for (const a of activity) {
    if (a.kind !== "video_opened" || !a.ref_id || done.has(a.ref_id)) continue;
    const v = catalogById.get(a.ref_id);
    if (v && canWatch(v, access, byId)) {
      continueVideo = v;
      break;
    }
  }

  // Something new they can watch right now, newest first, not already suggested above.
  const taken = new Set<string>([continueVideo?.id ?? "", ...programs.map((p) => p.next?.id ?? "")]);
  const recommended =
    catalog.find((v) => !done.has(v.id) && !taken.has(v.id) && !v.course_id && canWatch(v, access, byId)) ?? null;

  return { done, continueVideo, programs, recommended };
}
