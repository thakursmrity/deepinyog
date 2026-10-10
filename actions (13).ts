"use server";

import { revalidatePath } from "next/cache";
import { fulfillOrder } from "@/lib/fulfill";
import { coursePrice } from "@/lib/money";
import { createOrder, publicKeyId, verifyPaymentSignature } from "@/lib/razorpay";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export type CheckoutStart =
  | { ok: true; orderId: string; amount: number; keyId: string; name: string; description: string; email: string; fullName: string }
  | { ok: false; error: string; needsLogin?: boolean };

export async function startCheckout(itemType: "plan" | "course", itemId: string): Promise<CheckoutStart> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first.", needsLogin: true };

  let amount = 0;
  let name = "";

  if (itemType === "plan") {
    const { data: plan } = await supabase.from("plans").select("id, name, price_paise, active").eq("id", itemId).maybeSingle();
    if (!plan || !plan.active) return { ok: false, error: "This plan isn't available right now." };
    amount = plan.price_paise;
    name = plan.name;
  } else {
    const { data: course } = await supabase
      .from("courses")
      .select("id, title, status, price_paise, early_bird_price_paise, early_bird_until")
      .eq("id", itemId)
      .maybeSingle();
    if (!course || course.status !== "open") return { ok: false, error: "This course isn't open for enrollment yet." };
    const { data: owned } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id).eq("course_id", itemId).maybeSingle();
    if (owned) return { ok: false, error: "You already have this course." };
    amount = coursePrice(course);
    name = course.title;
  }

  if (amount < 100) return { ok: false, error: "No payment is needed for this one." };

  try {
    const order = await createOrder({
      amountPaise: amount,
      receipt: `${itemType}-${Date.now()}`.slice(0, 40),
      notes: { user_id: user.id, item_type: itemType, item_id: itemId },
    });

    const { error } = await createAdminClient().from("payments").insert({
      user_id: user.id,
      item_type: itemType,
      item_id: itemId,
      item_name: name,
      amount_paise: amount,
      razorpay_order_id: order.id,
    });
    if (error) return { ok: false, error: "Couldn't start the payment. Please try again." };

    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
    return {
      ok: true,
      orderId: order.id,
      amount,
      keyId: publicKeyId(),
      name: "Deepinyog",
      description: name,
      email: user.email ?? "",
      fullName: profile?.full_name ?? "",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Payment setup failed." };
  }
}

export async function confirmPayment(orderId: string, paymentId: string, signature: string) {
  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    return { ok: false as const, error: "We couldn't verify this payment. If money was taken, it will be confirmed automatically or refunded." };
  }
  await fulfillOrder(orderId, paymentId);
  revalidatePath("/app", "layout");
  return { ok: true as const };
}

export async function markFailed(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await createAdminClient().from("payments").update({ status: "failed" }).eq("razorpay_order_id", orderId).eq("user_id", user.id).eq("status", "created");
}
