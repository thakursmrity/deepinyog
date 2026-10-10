import type { SupabaseClient } from "@supabase/supabase-js";

// A program is one way of practising with Deepshikha (Hatha Yoga, Marma Therapy, ...).
// They live in the database ("categories" table) so she can edit them. The list below is
// the starting set, and the site falls back to it until the database has its own rows.

export type Program = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  highlights: string; // one per line
  guidance: string;
  caution: string;
  sort: number;
};

export const PROGRAM_FIELDS = "id, slug, title, tagline, summary, highlights, guidance, caution, sort";

export const DEFAULT_PROGRAMS: Program[] = [
  {
    slug: "hatha-yoga",
    title: "Hatha Yoga",
    tagline: "Strength, ease and balance",
    summary: "Classical postures, held with awareness and paired with the breath. A steady practice for beginners and for anyone coming back to the mat.",
    highlights: "Starting out with yoga\nFlexibility and mobility\nStrength and stamina\nPosture and alignment\nA daily routine",
    guidance: "We begin slowly, with joint warm-ups and simple postures, and build gradually. Every posture has easier and deeper versions, so you practise at the level that suits your body today.",
    caution: "",
    sort: 10,
  },
  {
    slug: "yoga-therapy",
    title: "Yoga Therapy",
    tagline: "Healing, one posture at a time",
    summary: "Gentle, therapeutic practice shaped around a specific concern, alongside the care you already receive.",
    highlights: "Back and neck pain\nKnees and joints\nThyroid\nPCOS and hormonal balance\nDiabetes support\nBlood pressure",
    guidance: "Therapy sessions start with understanding you: your history, your body and what you need. The practice is then built around that, with postures, breath and relaxation chosen for you.",
    caution: "Yoga supports healing but does not replace medical treatment. Please keep following your doctor's advice and share any diagnosis or injury with me before we begin.",
    sort: 20,
  },
  {
    slug: "marma-therapy",
    title: "Marma Therapy",
    tagline: "Release through the body's vital points",
    summary: "An ancient practice that works with vital energy points to release tension, ease pain and restore the flow of energy.",
    highlights: "Stress and tension release\nPain relief\nBetter sleep\nEnergy and vitality\nSimple self-care points",
    guidance: "Sessions combine gentle work on marma points with breath and relaxation. I also share simple points you can use for yourself at home.",
    caution: "For a specific health concern, please book a personal session rather than self-treating.",
    sort: 30,
  },
  {
    slug: "pranayama",
    title: "Pranayama and Breathwork",
    tagline: "The breath is the bridge",
    summary: "Breathing practices to energise the body, calm the nervous system and steady the mind.",
    highlights: "Energy in the morning\nCalm in stressful moments\nBetter lung capacity\nFocus and clarity",
    guidance: "We sit comfortably and first observe the natural breath, then slowly lengthen and guide it. The breath is never strained or forced.",
    caution: "Avoid fast breathing practices in pregnancy or with high blood pressure or heart conditions unless your doctor agrees. Stop if you feel dizzy.",
    sort: 40,
  },
  {
    slug: "meditation",
    title: "Meditation and Yoga Nidra",
    tagline: "Stillness, sleep and clarity",
    summary: "Guided meditation and yoga nidra, deep relaxation practised lying down, for a quieter mind and deeper rest.",
    highlights: "Stress and anxiety\nDeeper sleep\nFocus and clarity\nEmotional balance",
    guidance: "Start with ten minutes, sitting or lying down, and let the guidance carry you. Regular, short practice works better than occasional long sessions.",
    caution: "If anxiety feels overwhelming, please also reach out to a doctor or counsellor.",
    sort: 50,
  },
  {
    slug: "lemurian-yoga",
    title: "Sri Sri Lemurian Yoga",
    tagline: "Return to effortless",
    summary: "Soft, flowing movements that boost energy, ease the joints, calm the busy mind and lead naturally into deep meditation.",
    highlights: "Energy levels\nJoint mobility\nA calmer, quieter mind\nDeep meditation",
    guidance: "There is nothing to achieve here. We move gently and continuously, letting the body find its own rhythm, and then rest in stillness.",
    caution: "",
    sort: 60,
  },
  {
    slug: "womens-wellness",
    title: "Women's Wellness",
    tagline: "For every season of womanhood",
    summary: "Gentle, supportive practice through periods, pregnancy, life after childbirth and hormonal changes.",
    highlights: "Periods and PMS\nPregnancy\nAfter childbirth\nHormonal balance",
    guidance: "Practice changes with each stage: restful and supported on heavier days, gentle and steady in pregnancy, rebuilding slowly after birth.",
    caution: "During pregnancy and after childbirth, please practise only with your doctor's approval.",
    sort: 70,
  },
  {
    slug: "kids-yoga",
    title: "Kids Yoga and Mindfulness",
    tagline: "Calm, focused, joyful children",
    summary: "Playful sessions with stories, animal poses and breathing games that help children settle, focus and feel good in their bodies.",
    highlights: "Focus and attention\nCalm and emotional balance\nPosture and flexibility\nConfidence",
    guidance: "Sessions are short, playful and full of movement, with a quiet moment of rest at the end.",
    caution: "Children should practise with an adult nearby.",
    sort: 80,
  },
  {
    slug: "workplace-wellness",
    title: "Workplace Wellness",
    tagline: "Calmer teams, clearer minds",
    summary: "Yoga, breathwork and stress care for teams, designed around long hours, screens and busy schedules.",
    highlights: "Desk and posture resets\nStress management\nFocus and energy\nTeam wellbeing sessions",
    guidance: "I have guided corporate teams and administrators for over a decade. Sessions can be one-off workshops or a regular series, online or in person.",
    caution: "",
    sort: 90,
  },
  {
    slug: "life-coaching",
    title: "Life Coaching and Soulful Conversations",
    tagline: "Find your way back to yourself",
    summary: "Unhurried one-to-one conversations on stress, purpose, relationships and balance, with practices to take into everyday life.",
    highlights: "Clarity and direction\nHabits that last\nEmotional balance\nPurpose and self-belief",
    guidance: "We talk, we listen, and we find small, steady steps forward, supported by breath and reflection practices you can use every day.",
    caution: "",
    sort: 100,
  },
].map((p) => ({ ...p, id: p.slug }));

function normalise(rows: Partial<Program>[]): Program[] {
  return rows
    .map((r) => ({
      id: r.id ?? r.slug ?? "",
      slug: r.slug ?? "",
      title: r.title ?? "",
      tagline: r.tagline ?? "",
      summary: r.summary ?? "",
      highlights: r.highlights ?? "",
      guidance: r.guidance ?? "",
      caution: r.caution ?? "",
      sort: r.sort ?? 0,
    }))
    .sort((a, b) => a.sort - b.sort);
}

// Programs from the database, or the starting set if the database has none yet.
export async function getPrograms(supabase: SupabaseClient): Promise<{ programs: Program[]; fromDb: boolean }> {
  const { data, error } = await supabase.from("categories").select(PROGRAM_FIELDS).eq("active", true);
  if (!error && data && data.length > 0) return { programs: normalise(data as Partial<Program>[]), fromDb: true };
  return { programs: DEFAULT_PROGRAMS, fromDb: false };
}

export async function getProgram(supabase: SupabaseClient, slug: string): Promise<{ program: Program | null; fromDb: boolean }> {
  const { data, error } = await supabase.from("categories").select(PROGRAM_FIELDS).eq("slug", slug).eq("active", true).maybeSingle();
  if (!error && data) return { program: normalise([data as Partial<Program>])[0], fromDb: true };
  return { program: DEFAULT_PROGRAMS.find((p) => p.slug === slug) ?? null, fromDb: false };
}

export function highlightList(p: Program) {
  return p.highlights.split("\n").map((s) => s.trim()).filter(Boolean);
}
