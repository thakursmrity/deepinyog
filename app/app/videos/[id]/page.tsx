import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { Player } from "./Player";

export default async function WatchVideo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireStudent();

  const { data: video } = await supabase.from("videos").select("id, title, description, storage_path, youtube_id, access, course_id").eq("id", id).maybeSingle();
  if (!video) notFound();

  const { data: allowed } = await supabase.rpc("can_watch", { vid: video.id, uid: profile.id });

  if (!allowed) {
    const course = video.course_id ? (await supabase.from("courses").select("slug, title").eq("id", video.course_id).maybeSingle()).data : null;
    return (
      <>
        <Link href="/app/library">Back to library</Link>
        <h1 style={{ fontSize: 34 }}>{video.title}</h1>
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {course ? (
            <>
              <p>This practice is part of the course <strong>{course.title}</strong>.</p>
              <Link className="btn" href={`/courses/${course.slug}`} style={{ alignSelf: "flex-start" }}>See the course</Link>
            </>
          ) : (
            <>
              <p>This practice is in the members library.</p>
              <Link className="btn" href="/pricing" style={{ alignSelf: "flex-start" }}>Become a member</Link>
            </>
          )}
        </section>
      </>
    );
  }

  const [{ data: signed }, { data: assignment }] = await Promise.all([
    video.storage_path
      ? supabase.storage.from("videos").createSignedUrl(video.storage_path, 60 * 60 * 2)
      : Promise.resolve({ data: null as { signedUrl: string } | null }),
    supabase.from("video_assignments").select("id, completed_at").eq("student_id", profile.id).eq("video_id", video.id).maybeSingle(),
  ]);
  await supabase.from("activity").insert({ student_id: profile.id, kind: "video_opened", ref_id: video.id });

  return (
    <>
      <Link href={video.course_id ? "/app/courses" : "/app/library"}>Back</Link>
      <h1 style={{ fontSize: 34 }}>{video.title}</h1>
      {video.description ? <p style={{ color: "var(--soft)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{video.description}</p> : null}
      {video.youtube_id || signed?.signedUrl ? (
        <Player src={signed?.signedUrl} youtubeId={video.youtube_id} assignmentId={assignment?.id ?? null} videoId={video.id} done={Boolean(assignment?.completed_at)} />
      ) : (
        <p className="error">This video couldn&apos;t be loaded. Please try again in a moment.</p>
      )}
    </>
  );
}
