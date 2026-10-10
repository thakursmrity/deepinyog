import { AddStudentForm } from "./AddStudentForm";

export default async function NewStudent({ searchParams }: { searchParams: Promise<{ name?: string; email?: string; phone?: string }> }) {
  const { name = "", email = "", phone = "" } = await searchParams;
  return (
    <>
      <h1 style={{ fontSize: 38 }}>Add a student</h1>
      <AddStudentForm defaults={{ name, email, phone }} />
    </>
  );
}
