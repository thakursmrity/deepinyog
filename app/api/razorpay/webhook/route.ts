import { NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/fulfill";
import { verifyWebhookSignature } from "@/lib/razorpay";

// Backup confirmation from Razorpay, so a purchase is granted even if the
// buyer closes the browser before the payment window returns.
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const event = JSON.parse(raw) as {
    event: string;
    payload?: {
      payment?: { entity?: { id: string; order_id: string } };
      order?: { entity?: { id: string } };
    };
  };

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.order_id ?? event.payload?.order?.entity?.id;
    if (orderId && payment?.id) await fulfillOrder(orderId, payment.id);
  }

  return NextResponse.json({ ok: true });
}
