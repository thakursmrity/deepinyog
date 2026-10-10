"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirmPayment, markFailed, startCheckout } from "@/app/checkout/actions";

type RazorpayResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (event: string, cb: (r: unknown) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function BuyButton({
  itemType,
  itemId,
  label,
  successPath,
  signedIn,
  className = "btn",
}: {
  itemType: "plan" | "course";
  itemId: string;
  label: string;
  successPath: string;
  signedIn: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function buy() {
    if (!signedIn) {
      router.push(`/login?mode=register&next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setBusy(true);
    setMessage(null);

    const ready = await loadCheckout();
    if (!ready || !window.Razorpay) {
      setBusy(false);
      return setMessage("The payment window couldn't load. Check your connection and try again.");
    }

    const start = await startCheckout(itemType, itemId);
    if (!start.ok) {
      setBusy(false);
      if (start.needsLogin) return router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return setMessage(start.error);
    }

    const rz = new window.Razorpay({
      key: start.keyId,
      amount: start.amount,
      currency: "INR",
      name: start.name,
      description: start.description,
      order_id: start.orderId,
      prefill: { name: start.fullName, email: start.email },
      theme: { color: "#C98D93" },
      handler: async (r: RazorpayResponse) => {
        setMessage("Confirming your payment");
        const result = await confirmPayment(r.razorpay_order_id, r.razorpay_payment_id, r.razorpay_signature);
        setBusy(false);
        if (result.ok) router.push(successPath);
        else setMessage(result.error);
      },
      modal: {
        ondismiss: () => setBusy(false),
      },
    });
    rz.on("payment.failed", () => {
      void markFailed(start.orderId);
      setBusy(false);
      setMessage("The payment didn't go through. No money was taken; you can try again.");
    });
    rz.open();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button type="button" className={className} onClick={buy} disabled={busy}>
        {busy ? "Please wait" : label}
      </button>
      {message ? (
        <p role="status" style={{ fontSize: 14 }} className={message.startsWith("Confirming") ? "success" : "error"}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
