"use server";

import { createAdminClient } from "@/lib/supabase/server";

export type EnquiryState = { ok?: boolean; error?: string };

const INTERESTS = ["Group classes", "1-on-1 sessions", "Yoga therapy or Marma", "Meditation and breathwork", "Team or workplace sessions", "Not sure yet"];

export async function submitEnquiry(_prev: EnquiryState, form: FormData): Promise<EnquiryState> {
  // Hidden field that people never fill in; simple bots do.
  if (String(form.get("website") ?? "")) return { ok: true };

  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const contact = String(form.get("contact") ?? "").trim().slice(0, 160);
  const interestRaw = String(form.get("interest") ?? "");
  const interest = INTERESTS.includes(interestRaw) ? interestRaw : "Not sure yet";
  const message = String(form.get("message") ?? "").trim().slice(0, 2000);

  if (!name || !contact) return { error: "Please add your name and a phone number or email." };

  const { error } = await createAdminClient().from("enquiries").insert({ name, contact, interest, message });
  if (error) return { error: "Something went wrong. Please message on Instagram instead." };
  return { ok: true };
}
