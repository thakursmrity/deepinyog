"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTeacher } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { youtubeId, youtubeTitle } from "@/lib/youtube";

export type FormState = { error?: string; ok?: string; password?: string; email?: string };

const PLANS = ["Group", "1-on-1", "Meditation"];

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

// Easy to read aloud or send on WhatsApp: no look-alike characters.
function makePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[randomInt(chars.length)];
  return out;
}

// ---------- Students ----------

export async function addStudent(_prev: FormState, form: FormData): Promise<FormState> {
  await requireTeacher();
  const fullName = text(form, "full_name");
  const email = text(form, "email").toLowerCase();
  const phone = text(form, "phone");
  const plan = PLANS.includes(text(form, "plan")) ? text(form, "plan") : "Group";
  const goals = text(form, "goals");
  const healthNotes = text(form, "health_notes");

  if (!fullName || !email) return { error: "Name and email are needed." };

  const admin = createAdminClient();
  const password = makePassword();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) {
    const taken = error?.message?.toLowerCase().includes("already");
    return { error: taken ? "A student with this email already exists." : `Couldn't create the login: ${error?.message ?? "unknown error"}` };
  }

  const id = data.user.id;
  await admin.from("profiles").upsert({ id, full_name: fullName, email, phone: phone || null, role: "student" });
  await admin.from("student_details").upsert({ student_id: id, plan, goals, health_notes: healthNotes });

  revalidatePath("/teacher");
  return { ok: `${fullName} is added.`, password, email };
}

export async function updateStudent(studentId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireTeacher();
  const plan = PLANS.includes(text(form, "plan")) ? text(form, "plan") : "Group";

  const { error: e1 } = await supabase
    .from("profiles")
    .update({ full_name: text(form, "full_name"), phone: text(form, "phone") || null })
    .eq("id", studentId);
  const { error: e2 } = await supabase.from("student_details").upsert({
    student_id: studentId,
    plan,
    goals: text(form, "goals"),
    health_notes: text(form, "health_notes"),
    active: form.get("active") === "on",
  });

  if (e1 || e2) return { error: (e1 ?? e2)!.message };
  revalidatePath(`/teacher/students/${studentId}`);
  revalidatePath("/teacher");
  return { ok: "Saved." };
}

export async function resetStudentPassword(studentId: string): Promise<FormState> {
  await requireTeacher();
  const password = makePassword();
  const { error } = await createAdminClient().auth.admin.updateUserById(studentId, { password });
  if (error) return { error: error.message };
  return { ok: "New password created.", password };
}

export async function addNote(studentId: string, form: FormData) {
  const { supabase } = await requireTeacher();
  const body = text(form, "body");
  if (body) await supabase.from("notes").insert({ student_id: studentId, body });
  revalidatePath(`/teacher/students/${studentId}`);
}

export async function assignVideo(studentId: string, form: FormData) {
  const { supabase } = await requireTeacher();
  const videoId = text(form, "video_id");
  if (videoId) {
    await supabase
      .from("video_assignments")
      .upsert({ student_id: studentId, video_id: videoId, assigned_at: new Date().toISOString(), completed_at: null }, { onConflict: "video_id,student_id" });
  }
  revalidatePath(`/teacher/students/${studentId}`);
}

// ---------- Classes and attendance ----------

export async function addClass(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireTeacher();
  const title = text(form, "title");
  const kind = PLANS.includes(text(form, "kind")) ? text(form, "kind") : "Group";
  const date = text(form, "date");
  const time = text(form, "time");
  const duration = Number(text(form, "duration")) || 60;
  const studentId = text(form, "student_id");

  if (!title || !date || !time) return { error: "Title, date and time are needed." };
  if (kind === "1-on-1" && !studentId) return { error: "Pick the student for a 1-on-1 class." };

  // Times are entered in India time.
  const startsAt = new Date(`${date}T${time}:00+05:30`).toISOString();
  const { error } = await supabase.from("classes").insert({
    title,
    kind,
    starts_at: startsAt,
    duration_minutes: duration,
    meeting_link: text(form, "meeting_link") || null,
    student_id: kind === "1-on-1" ? studentId : null,
  });
  if (error) return { error: error.message };

  revalidatePath("/teacher/classes");
  return { ok: "Class added." };
}

export async function saveAttendance(classId: string, form: FormData) {
  const { supabase } = await requireTeacher();
  const present = new Set(form.getAll("present").map(String));
  const all = form.getAll("student").map(String);

  const rows = all.map((student_id) => ({ class_id: classId, student_id, present: present.has(student_id) }));
  if (rows.length) await supabase.from("attendance").upsert(rows, { onConflict: "class_id,student_id" });

  // Log each attended class once, for streaks and adoption tracking.
  const { data: logged } = await supabase.from("activity").select("student_id").eq("kind", "class_attended").eq("ref_id", classId);
  const already = new Set((logged ?? []).map((r) => r.student_id));
  const fresh = [...present].filter((id) => !already.has(id)).map((student_id) => ({ student_id, kind: "class_attended", ref_id: classId }));
  if (fresh.length) await supabase.from("activity").insert(fresh);

  revalidatePath(`/teacher/classes/${classId}`);
  revalidatePath("/teacher");
  redirect("/teacher/classes?saved=1");
}

export async function deleteClass(classId: string) {
  const { supabase } = await requireTeacher();
  await supabase.from("classes").delete().eq("id", classId);
  revalidatePath("/teacher/classes");
  redirect("/teacher/classes");
}

// ---------- Enquiries ----------

const ENQUIRY_STATUSES = ["new", "contacted", "joined", "closed"];

export async function setEnquiryStatus(enquiryId: string, form: FormData) {
  const { supabase } = await requireTeacher();
  const status = text(form, "status");
  if (ENQUIRY_STATUSES.includes(status)) await supabase.from("enquiries").update({ status }).eq("id", enquiryId);
  revalidatePath("/teacher/enquiries");
  revalidatePath("/teacher");
}

// ---------- Videos ----------

export async function saveVideo(input: {
  title: string;
  description: string;
  duration: number | null;
  storagePath: string;
  access: string;
  courseId: string | null;
  categoryIds?: string[];
}) {
  const { supabase } = await requireTeacher();
  const access = ["free", "members", "course", "assigned"].includes(input.access) ? input.access : "assigned";
  const { data, error } = await supabase.from("videos").insert({
    title: input.title,
    description: input.description,
    duration_minutes: input.duration,
    storage_path: input.storagePath,
    access: access === "course" && !input.courseId ? "assigned" : access,
    course_id: access === "course" ? input.courseId : null,
  }).select("id").single();
  if (!error && data && input.categoryIds?.length) {
    await supabase.from("video_categories").insert(input.categoryIds.map((category_id) => ({ video_id: data.id, category_id })));
  }
  revalidatePath("/teacher/videos");
  return { error: error?.message };
}

export async function deleteVideo(videoId: string) {
  const { supabase } = await requireTeacher();
  const { data } = await supabase.from("videos").select("storage_path").eq("id", videoId).single();
  if (data?.storage_path) await supabase.storage.from("videos").remove([data.storage_path]);
  await supabase.from("videos").delete().eq("id", videoId);
  revalidatePath("/teacher/videos");
}

// ---------- Courses ----------

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "course";
}

function rupeesToPaise(v: string) {
  const n = Number(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
}

function courseFields(form: FormData) {
  const early = text(form, "early_bird_price");
  const status = ["upcoming", "open", "closed"].includes(text(form, "status")) ? text(form, "status") : "upcoming";
  return {
    title: text(form, "title"),
    summary: text(form, "summary"),
    description: text(form, "description"),
    status,
    price_paise: rupeesToPaise(text(form, "price")),
    early_bird_price_paise: early ? rupeesToPaise(early) || null : null,
    early_bird_until: text(form, "early_bird_until") || null,
    starts_on: text(form, "starts_on") || null,
    included_in_membership: form.get("included_in_membership") === "on",
    kind: ["course", "program", "workshop"].includes(text(form, "kind")) ? text(form, "kind") : "course",
    schedule: text(form, "schedule"),
    hosts: text(form, "hosts"),
    register_url: /^https?:\/\//.test(text(form, "register_url")) ? text(form, "register_url") : null,
  };
}

export async function createCourse(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireTeacher();
  const fields = courseFields(form);
  if (!fields.title) return { error: "Give the course a title." };
  if (fields.price_paise > 0 && fields.price_paise < 100) return { error: "The price should be at least Rs 1." };

  let slug = slugify(fields.title);
  const { data: clash } = await supabase.from("courses").select("id").eq("slug", slug).maybeSingle();
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const { data, error } = await supabase.from("courses").insert({ ...fields, slug }).select("id").single();
  if (error) return { error: error.message };
  revalidatePath("/teacher/courses");
  redirect(`/teacher/courses/${data.id}?created=1`);
}

export async function updateCourse(courseId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireTeacher();
  const fields = courseFields(form);
  if (!fields.title) return { error: "Give the course a title." };
  const { error } = await supabase.from("courses").update(fields).eq("id", courseId);
  if (error) return { error: error.message };
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath("/courses");
  return { ok: "Saved." };
}

// ---------- Plans and prices ----------

export async function updatePlan(planId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireTeacher();
  const price = rupeesToPaise(text(form, "price"));
  if (price < 100) return { error: "The price should be at least Rs 1." };
  const { error } = await supabase
    .from("plans")
    .update({
      name: text(form, "name"),
      description: text(form, "description"),
      price_paise: price,
      duration_days: Number(text(form, "duration_days")) || null,
      sessions: Number(text(form, "sessions")) || null,
      active: form.get("active") === "on",
    })
    .eq("id", planId);
  if (error) return { error: error.message };
  revalidatePath("/teacher/plans");
  revalidatePath("/pricing");
  return { ok: "Saved." };
}

// ---------- Granting access by hand (offline payments, gifts) ----------

export async function grantMembership(studentId: string, form: FormData) {
  const { supabase } = await requireTeacher();
  const days = Math.min(Math.max(Number(text(form, "days")) || 30, 1), 3650);
  const { data: latest } = await supabase.from("memberships").select("ends_at").eq("user_id", studentId).order("ends_at", { ascending: false }).limit(1).maybeSingle();
  const now = Date.now();
  const start = latest && new Date(latest.ends_at).getTime() > now ? new Date(latest.ends_at).getTime() : now;
  await supabase.from("memberships").insert({
    user_id: studentId,
    starts_at: new Date(start).toISOString(),
    ends_at: new Date(start + days * 86400000).toISOString(),
  });
  revalidatePath(`/teacher/students/${studentId}`);
}

export async function grantCourse(studentId: string, form: FormData) {
  const { supabase } = await requireTeacher();
  const courseId = text(form, "course_id");
  if (courseId) await supabase.from("enrollments").upsert({ user_id: studentId, course_id: courseId }, { onConflict: "user_id,course_id" });
  revalidatePath(`/teacher/students/${studentId}`);
}

export async function grantSessions(studentId: string, form: FormData) {
  const { supabase } = await requireTeacher();
  const n = Math.min(Math.max(Number(text(form, "sessions")) || 1, 1), 100);
  await supabase.from("coaching_credits").insert({ user_id: studentId, sessions_total: n });
  revalidatePath(`/teacher/students/${studentId}`);
}

export async function markSessionUsed(creditId: string, path: string) {
  const { supabase } = await requireTeacher();
  const { data } = await supabase.from("coaching_credits").select("sessions_total, sessions_used").eq("id", creditId).single();
  if (data && data.sessions_used < data.sessions_total) {
    await supabase.from("coaching_credits").update({ sessions_used: data.sessions_used + 1 }).eq("id", creditId);
  }
  revalidatePath(path);
}

// ---------- Video access ----------

export async function updateVideoAccess(videoId: string, form: FormData) {
  const { supabase } = await requireTeacher();
  const access = ["free", "members", "course", "assigned"].includes(text(form, "access")) ? text(form, "access") : "assigned";
  const courseId = access === "course" ? text(form, "course_id") || null : null;
  await supabase
    .from("videos")
    .update({ access: access === "course" && !courseId ? "assigned" : access, course_id: courseId, sort: Number(text(form, "sort")) || 0 })
    .eq("id", videoId);
  revalidatePath("/teacher/videos");
}

// ---------- Practice categories ----------

function categoryFields(form: FormData) {
  return {
    grp: text(form, "grp"),
    title: text(form, "title"),
    summary: text(form, "summary"),
    guidance: text(form, "guidance"),
    caution: text(form, "caution"),
    sort: Number(text(form, "sort")) || 0,
    active: form.get("active") === "on",
  };
}

export async function updateCategory(categoryId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireTeacher();
  const fields = categoryFields(form);
  if (!fields.title || !fields.grp) return { error: "Group and title are needed." };
  const { error } = await supabase.from("categories").update(fields).eq("id", categoryId);
  if (error) return { error: error.message };
  revalidatePath("/teacher/categories");
  revalidatePath("/practice", "layout");
  return { ok: "Saved." };
}

export async function createCategory(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireTeacher();
  const fields = { ...categoryFields(form), active: true };
  if (!fields.title || !fields.grp) return { error: "Group and title are needed." };
  let slug = slugify(fields.title);
  const { data: clash } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const { data, error } = await supabase.from("categories").insert({ ...fields, slug }).select("id").single();
  if (error) return { error: error.message };
  revalidatePath("/teacher/categories");
  revalidatePath("/practice", "layout");
  redirect(`/teacher/categories/${data.id}?new=1`);
}

export async function setVideoCategories(videoId: string, form: FormData) {
  const { supabase } = await requireTeacher();
  const ids = form.getAll("category").map(String).filter(Boolean);
  await supabase.from("video_categories").delete().eq("video_id", videoId);
  if (ids.length) await supabase.from("video_categories").insert(ids.map((category_id) => ({ video_id: videoId, category_id })));
  revalidatePath("/teacher/videos");
  revalidatePath("/practice", "layout");
}

// ---------- YouTube videos (always free) ----------

export async function addYouTubeVideos(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireTeacher();
  const lines = text(form, "links").split(/[\s,]+/).filter(Boolean);
  const categoryIds = form.getAll("category").map(String).filter(Boolean);
  if (lines.length === 0) return { error: "Paste at least one YouTube link." };
  if (lines.length > 100) return { error: "Please add up to 100 links at a time." };

  const ids: string[] = [];
  const unreadable: string[] = [];
  for (const l of lines) {
    const id = youtubeId(l);
    if (id) {
      if (!ids.includes(id)) ids.push(id);
    } else unreadable.push(l);
  }
  if (ids.length === 0) return { error: "Those don't look like YouTube video links. Use the link from a video's Share button." };

  const { data: existing } = await supabase.from("videos").select("id, youtube_id").in("youtube_id", ids);
  const existingByYt = new Map((existing ?? []).map((v) => [v.youtube_id as string, v.id as string]));

  const fresh = ids.filter((id) => !existingByYt.has(id));
  const titles = await Promise.all(fresh.map((id) => youtubeTitle(id)));
  let added = 0;
  const videoIds: string[] = [...existingByYt.values()];
  if (fresh.length) {
    const { data: inserted, error } = await supabase
      .from("videos")
      .insert(fresh.map((id, i) => ({ title: titles[i] ?? "Practice video", youtube_id: id, access: "free" })))
      .select("id");
    if (error) return { error: error.message };
    added = inserted?.length ?? 0;
    videoIds.push(...(inserted ?? []).map((v) => v.id));
  }

  if (categoryIds.length && videoIds.length) {
    await supabase
      .from("video_categories")
      .upsert(videoIds.flatMap((video_id) => categoryIds.map((category_id) => ({ video_id, category_id }))), { onConflict: "video_id,category_id", ignoreDuplicates: true });
  }

  revalidatePath("/teacher/videos");
  revalidatePath("/teacher/categories", "layout");
  revalidatePath("/practice", "layout");
  const parts = [`Added ${added} ${added === 1 ? "video" : "videos"}.`];
  if (existingByYt.size) parts.push(`${existingByYt.size} ${existingByYt.size === 1 ? "was" : "were"} already on the site${categoryIds.length ? " and now also sit in the chosen topics" : ""}.`);
  if (unreadable.length) parts.push(`${unreadable.length} line${unreadable.length === 1 ? "" : "s"} couldn't be read as YouTube links.`);
  return { ok: parts.join(" ") };
}

export async function renameVideo(videoId: string, form: FormData) {
  const { supabase } = await requireTeacher();
  const title = text(form, "title");
  if (title) await supabase.from("videos").update({ title }).eq("id", videoId);
  revalidatePath("/teacher/videos");
  revalidatePath("/teacher/categories", "layout");
}

// ---------- Topic page helpers ----------

export async function deleteCategory(categoryId: string) {
  const { supabase } = await requireTeacher();
  // Removes the topic and its video links. The videos themselves stay in the library.
  await supabase.from("categories").delete().eq("id", categoryId);
  revalidatePath("/teacher/categories");
  revalidatePath("/practice", "layout");
  redirect("/teacher/categories?deleted=1");
}

export async function addVideoToCategory(categoryId: string, form: FormData) {
  const { supabase } = await requireTeacher();
  const videoId = text(form, "video_id");
  if (videoId) await supabase.from("video_categories").upsert({ video_id: videoId, category_id: categoryId }, { onConflict: "video_id,category_id", ignoreDuplicates: true });
  revalidatePath(`/teacher/categories/${categoryId}`);
  revalidatePath("/practice", "layout");
}

export async function removeVideoFromCategory(categoryId: string, videoId: string) {
  const { supabase } = await requireTeacher();
  await supabase.from("video_categories").delete().eq("video_id", videoId).eq("category_id", categoryId);
  revalidatePath(`/teacher/categories/${categoryId}`);
  revalidatePath("/practice", "layout");
}
