import { Shell } from "@/components/Shell";
import { MEMBERSHIP_ON } from "@/lib/features";
import { requireStudent } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireStudent();
  return (
    <Shell
      label="Student"
      name={profile.full_name || "You"}
      nav={[
        { href: "/app", label: "Today" },
        { href: "/app/library", label: "Video library" },
        { href: "/app/courses", label: "My courses" },
        { href: "/programs", label: "All programs" },
        { href: "/courses", label: "Live sessions" },
        ...(MEMBERSHIP_ON ? [{ href: "/app/membership", label: "Membership" }] : []),
        { href: "/app/account", label: "My account" },
      ]}
    >
      {children}
    </Shell>
  );
}
