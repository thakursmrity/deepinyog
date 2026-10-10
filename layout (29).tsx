import { Shell } from "@/components/Shell";
import { requireTeacher } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireTeacher();
  return (
    <Shell
      dark
      label="Teacher"
      name={profile.full_name || "Deepinyog"}
      nav={[
        { href: "/teacher", label: "Overview" },
        { href: "/teacher/sales", label: "Sales" },
        { href: "/teacher/enquiries", label: "Enquiries" },
        { href: "/teacher/courses", label: "Live sessions and courses" },
        { href: "/teacher/videos", label: "Video library" },
        { href: "/teacher/categories", label: "Programs" },
        { href: "/teacher/classes", label: "Classes and attendance" },
        { href: "/teacher/plans", label: "Prices" },
        { href: "/teacher/students/new", label: "Add a student" },
      ]}
    >
      {children}
    </Shell>
  );
}
