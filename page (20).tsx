import Link from "next/link";
import { notFound } from "next/navigation";
import { YouTubeAdder } from "@/components/YouTubeAdder";
import { requireTeacher } from "@/lib/auth";
import { CATEGORY_FIELDS, groupCategories, type Category } from "@/lib/categories";
import { youtubeThumb } from "@/lib/youtube";
import { addVideoToCategory, removeVideoFromCategory } from "../../actions";
import { Uploader } from "../../videos/Uploader";
import { CategoryForm } from "../CategoryForm";
import { DeleteTopic } from "../DeleteTopic";

type V = { id: string; title: string; access: string; youtube_id: string | null };
const LABEL: Record<string, string> = { free: "Open to all", members: "Members", course: "Course", assigned: "Assigned only" };

export default async function TopicPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const { supabase } = await requireTeacher();

  const { data } = await supabase.from("categories").select(CATEGORY_FIELDS).eq("id", id).maybeSingle();
  if (!data) notFound();
  const cat = data as Category;

  const [{ data: links }, { data: allVideos }, { data: allCats }, { data: courses }] = await Promise.all([
    supabase.from("video_categories").select("videos(id, title, access, youtube_id)").eq("category_id", id),
    supabase.from("videos").select("id, title").order("created_at", { ascending: false }),
    supabase.from("categories").select("id, grp, title, sort").order("sort"),
    supabase.from("courses").select("id, title").order("created_at", { ascending: false }),
  ]);

  const videos = (links ?? []).map((l) => (Array.isArray(l.videos) ? l.videos[0] : l.videos) as V | null).filter((v): v is V => Boolean(v));
  const inTopic = new Set(videos.map((v) => v.id));
  const others = (allVideos ?? []).filter((v) => !inTopic.has(v.id));
  const groups = groupCategories((allCats ?? []) as Category[]).map((g) => g.name);

  return (
    <>
      <Link href="/teacher/categories">All programs</Link>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
        <div>
          <p style={{ color: "var(--muted)" }}>{cat.grp}</p>
          <h1 style={{ fontSize: 38 }}>{cat.title}</h1>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <a href={`/programs/${cat.slug}`} target="_blank" rel="noopener noreferrer">View on website</a>
          <DeleteTopic id={cat.id} title={cat.title} />
        </div>
      </div>
      {isNew ? <p className="success" role="status">Program created. Now add its videos below.</p> : null}

      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Videos in this program ({videos.length})</h2>
        {videos.length === 0 ? <p style={{ color: "var(--muted)" }}>No videos yet. Add some below.</p> : null}
        {videos.map((v) => (
          <div key={v.id} className="list-item" style={{ borderTop: "1px solid var(--hair)" }}>
            <div className="thumb" style={{ overflow: "hidden" }}>
              {v.youtube_id ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={youtubeThumb(v.youtube_id)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : null}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 500 }}>{v.title}</p>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>{v.youtube_id ? "YouTube, open to all" : LABEL[v.access] ?? v.access}</p>
            </div>
            <form action={removeVideoFromCategory.bind(null, cat.id, v.id)}>
              <button className="btn btn-outline btn-small" type="submit">Remove</button>
            </form>
          </div>
        ))}
      </section>

      <div className="row">
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ fontSize: 22 }}>Add videos from YouTube</h2>
          <YouTubeAdder fixedCategoryId={cat.id} />
        </section>
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ fontSize: 22 }}>Add a video already on the site</h2>
          {others.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>Every video is already in this program.</p>
          ) : (
            <form action={addVideoToCategory.bind(null, cat.id)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label className="field">
                <span>Video</span>
                <select name="video_id" required>
                  {others.map((v) => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </select>
              </label>
              <button className="btn btn-small" type="submit" style={{ alignSelf: "flex-start" }}>Add to program</button>
            </form>
          )}
        </section>
      </div>

      <details className="card" style={{ padding: "18px 22px" }}>
        <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 18, minHeight: 32 }}>Upload a members video to this program</summary>
        <div style={{ marginTop: 16 }}>
          <Uploader courses={courses ?? []} categories={allCats ?? []} preselected={[cat.id]} />
        </div>
      </details>

      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 22 }}>Program page details</h2>
        <CategoryForm category={cat} groups={groups} />
      </section>
    </>
  );
}
