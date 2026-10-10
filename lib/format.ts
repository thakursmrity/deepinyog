// Dates are shown in India time, since the studio runs on it.
const TZ = "Asia/Kolkata";

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short" }).format(new Date(iso));
}

export function todayLong() {
  return new Intl.DateTimeFormat("en-IN", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(
    new Date()
  );
}

export function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { timeZone: TZ, hour: "numeric", hour12: false }).format(new Date()));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Day key in India time, for streaks.
export function dayKey(iso: string | Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
}

// Consecutive days with any practice, ending today or yesterday.
export function streakFrom(timestamps: string[]) {
  const days = new Set(timestamps.map((t) => dayKey(t)));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "there";
}
