import { CategoryPicker } from "@/components/CategoryPicker";
import { YouTubeAdder } from "@/components/YouTubeAdder";
import { requireTeacher } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { youtubeThumb } from "@/lib/youtube";
import { deleteVideo, renameVideo, setVideoCategories, updateVideoAccess } from "../actions";
import { Uploader } from "./Uploader";

const ACCESS_LABEL: Record<string, string> = {
  free: "Free",
  members: "Members",
  course: "Course",
  assigned: "Assigned only",
};

const selectStyle = { font: "inherit", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--line)", background: "#fff" } as const;

export default async function VideoLibrary() {
  const { supabase } = await requireTeacher();
  const [videos, assignments, courses, views, cats, links] = await Promise.all([
    supabase.from("videos").select("id, title, duration_minutes, created_at, access, course_id, sort, youtube_id").order("created_at", { ascending: false }),
    supabase.from("video_assignments").select("video_id"),
    supabase.from("courses").select("id, title").order("created_at", { ascending: false }),
    supabase.from("activity").select("ref_id, student_id").eq("kind", "video_opened").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    supabase.from("categories").select("id, grp, title, sort").order("sort"),
    supabase.from("video_categories").select("video_id, category_id"),
  ]);
  const categories = cats.data ?? [];
  const tagsByVideo = new Map<string, string[]>();
  for (const l of links.data ?? []) tagsByVideo.set(l.video_id, [...(tagsByVideo.get(l.video_id) ?? []), l.category_id]);
  const catTitle = new Map(categories.map((c) => [c.id, c.title]));
  const assigned = new Map<string, number>();
  for (const a of assignments.data ?? []) assigned.set(a.video_id, (assigned.get(a.video_id) ?? 0) + 1);
  const viewers = new Map<string, Set<string>>();
  for (const v of views.data ?? []) {
    if (!v.ref_id) continue;
    if (!viewers.has(v.ref_id)) viewers.set(v.ref_id, new Set());
    viewers.get(v.ref_id)!.add(v.student_id);
  }
  const courseList = courses.data ?? [];
  const courseName = new Map(courseList.map((c) => [c.id, c.title]));

  return (
    <>
      <h1 style={{ fontSize: 38 }}>Video library</h1>
      <div className="row">
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <h2 style={{ fontSize: 24 }}>Free videos from YouTube</h2>
            <p style={{ color: "var(--muted)", marginTop: 4 }}>Paste links from her channel. Nothing to upload.</p>
          </div>
          <YouTubeAdder categories={categories} />
        </section>
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <h2 style={{ fontSize: 24 }}>Paid videos: upload privately</h2>
            <p style={{ color: "var(--muted)", marginTop: 4 }}>For members, courses or single students. Don&apos;t put these on YouTube, since YouTube links can be shared.</p>
          </div>
          <Uploader courses={courseList} categories={categories} />
        </section>
      </div>

      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>All videos ({(videos.data ?? []).length})</h2>
        {(videos.data ?? []).length === 0 ? <p style={{ color: "var(--muted)" }}>No videos yet.</p> : null}
        {(videos.data ?? []).map((v) => {
          const tags = tagsByVideo.get(v.id) ?? [];
          return (
            <div key={v.id} style={{ borderTop: "1px solid var(--hair)", padding: "14px 0", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                <div className="thumb" style={{ overflow: "hidden" }}>
                  {v.youtube_id ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={youtubeThumb(v.youtube_id)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : null}
                </div>
                <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                  <p style={{ fontWeight: 500 }}>
                    {v.title}{" "}
                    <span className="pill" style={{ marginLeft: 4 }}>
                      {v.youtube_id ? "Free · YouTube" : `${ACCESS_LABEL[v.access] ?? v.access}${v.course_id ? `: ${courseName.get(v.course_id) ?? ""}` : ""}`}
                    </span>
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: 14 }}>
                    {v.duration_minutes ? `${v.duration_minutes} min · ` : ""}added {formatDate(v.created_at)} · {viewers.get(v.id)?.size ?? 0} viewers in 30 days
                    {assigned.get(v.id) ? ` · assigned to ${assigned.get(v.id)}` : ""}
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>
                    {tags.length ? `Topics: ${tags.map((id) => catTitle.get(id)).filter(Boolean).join(", ")}` : "No topics yet"}
                  </p>
                </div>
              </div>

              <details>
                <summary style={{ cursor: "pointer", color: "var(--brand)", fontWeight: 500, minHeight: 32 }}>Edit</summary>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
                  <form action={renameVideo.bind(null, v.id)} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <input name="title" defaultValue={v.title} aria-label="Title" style={{ ...selectStyle, flex: "1 1 260px" }} />
                    <button className="btn btn-outline btn-small" type="submit">Rename</button>
                  </form>

                  <form action={setVideoCategories.bind(null, v.id)} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ flex: "1 1 320px", minWidth: 0 }}>
                      <CategoryPicker categories={categories} selected={tags} compact />
                    </div>
                    <button className="btn btn-outline btn-small" type="submit">Save topics</button>
                  </form>

                  {!v.youtube_id ? (
                    <form action={updateVideoAccess.bind(null, v.id)} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      <select name="access" defaultValue={v.access} aria-label="Who can watch" style={selectStyle}>
                        <option value="free">Free</option>
                        <option value="members">Members</option>
                        <option value="course">Course</option>
                        <option value="assigned">Assigned only</option>
                      </select>
                      <select name="course_id" defaultValue={v.course_id ?? ""} aria-label="Course" style={selectStyle}>
                        <option value="">No course</option>
                        {courseList.map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                      <input name="sort" type="number" defaultValue={v.sort} aria-label="Order in course" title="Order in course" style={{ ...selectStyle, width: 70 }} />
                      <button className="btn btn-outline btn-small" type="submit">Save access</button>
                    </form>
                  ) : null}

                  <form action={deleteVideo.bind(null, v.id)}>
                    <button className="btn btn-outline btn-small" type="submit">Delete video</button>
                  </form>
                </div>
              </details>
            </div>
          );
        })}
      </section>
    </>
  );
}
