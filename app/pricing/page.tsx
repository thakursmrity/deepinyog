import { redirect } from "next/navigation";
import { MEMBERSHIP_ON } from "@/lib/features";
import { createClient } from "@/lib/supabase/server";

// Membership options live inside the practice space. Visitors are asked to sign up first.
export default async function Pricing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!MEMBERSHIP_ON) redirect("/programs");
  redirect(user ? "/app/membership" : "/login?mode=register&next=/app/membership");
}
