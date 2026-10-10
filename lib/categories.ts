export type Category = {
  id: string;
  slug: string;
  grp: string;
  title: string;
  summary: string;
  guidance: string;
  caution: string;
  sort: number;
  active: boolean;
};

export const CATEGORY_FIELDS = "id, slug, grp, title, summary, guidance, caution, sort, active";

// Groups in the order of their first category.
export function groupCategories<T extends { grp: string; sort: number }>(cats: T[]) {
  const sorted = [...cats].sort((a, b) => a.sort - b.sort);
  const groups = new Map<string, T[]>();
  for (const c of sorted) {
    if (!groups.has(c.grp)) groups.set(c.grp, []);
    groups.get(c.grp)!.push(c);
  }
  return [...groups.entries()].map(([name, items]) => ({ name, items }));
}

// One line for each group, shown on the practice pages.
export const GROUP_BLURB: Record<string, string> = {
  Body: "Yoga and mindful movement for strength, ease and mobility.",
  Breath: "Pranayama to energise, calm and balance.",
  Mind: "Meditation and mindfulness for a quieter, clearer mind.",
  Soul: "Practices for inner peace, joy and growth.",
  Healing: "Yoga therapy and Marma care, alongside your treatment.",
  "Women and family": "Support through every stage, for you and your little ones.",
  "Everyday wellness": "Small rituals for calmer days at home and at work.",
};

// The three pillars shown on the home page.
export const PILLARS = [
  { name: "Body", line: "Move with ease", groups: ["Body", "Healing"] },
  { name: "Mind", line: "Breathe and be still", groups: ["Breath", "Mind"] },
  { name: "Soul", line: "Return to yourself", groups: ["Soul", "Everyday wellness"] },
];
