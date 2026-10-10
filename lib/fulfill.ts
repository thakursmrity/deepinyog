import { createAdminClient } from "@/lib/supabase/server";

const DAY = 86400000;

// Grants what was bought. Safe to call more than once for the same order:
// only the first call that flips the payment to "paid" grants anything.
export async function fulfillOrder(orderId: string, paymentId: string) {
  const admin = createAdminClient();

  const { data: claimed } = await admin
    .from("payments")
    .update({ status: "paid", razorpay_payment_id: paymentId, paid_at: new Date().toISOString() })
    .eq("razorpay_order_id", orderId)
    .neq("status", "paid")
    .select("id, user_id, item_type, item_id")
    .maybeSingle();

  if (!claimed) return { alreadyDone: true };

  if (claimed.item_type === "course") {
    await admin
      .from("enrollments")
      .upsert({ user_id: claimed.user_id, course_id: claimed.item_id, payment_id: claimed.id }, { onConflict: "user_id,course_id" });
    await admin.from("waitlist").delete().eq("user_id", claimed.user_id).eq("course_id", claimed.item_id);
    return { granted: "course" as const };
  }

  const { data: plan } = await admin.from("plans").select("id, kind, duration_days, sessions").eq("id", claimed.item_id).single();
  if (!plan) return { error: "plan missing" };

  if (plan.kind === "membership") {
    // A renewal starts when the current membership ends, so no days are lost.
    const { data: latest } = await admin
      .from("memberships")
      .select("ends_at")
      .eq("user_id", claimed.user_id)
      .order("ends_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const now = Date.now();
    const start = latest && new Date(latest.ends_at).getTime() > now ? new Date(latest.ends_at).getTime() : now;
    await admin.from("memberships").insert({
      user_id: claimed.user_id,
      plan_id: plan.id,
      payment_id: claimed.id,
      starts_at: new Date(start).toISOString(),
      ends_at: new Date(start + (plan.duration_days ?? 30) * DAY).toISOString(),
    });
    return { granted: "membership" as const };
  }

  await admin.from("coaching_credits").insert({
    user_id: claimed.user_id,
    plan_id: plan.id,
    payment_id: claimed.id,
    sessions_total: plan.sessions ?? 1,
  });
  return { granted: "coaching" as const };
}
