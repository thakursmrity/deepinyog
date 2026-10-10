"use server";

import { ENQUIRY_INTERESTS } from "@/lib/content";
import { createAdminClient } from "@/lib/supabase/server";

export type EnquiryState = { ok?: boolean; error?: string };


export async function submitEnquiry(_prev: EnquiryState, form: FormData): Promise<EnquiryState> {
  // Hidden field that people never fill in; simple bots do.
  if (String(form.get("website") ?? "")) return { ok: true };

  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const contact = String(form.get("contact") ?? "").trim().slice(0, 160);
  const interestRaw = String(form.get("interest") ?? "");
  const interest = ENQUIRY_INTERESTS.includes(interestRaw) ? interestRaw : "Something else";
  const message = String(form.get("message") ?? "").trim().slice(0, 2000);

  if (!name || !contact) return { error: "Please add your name and a phone number or email." };

  const { error } = await createAdminClient().from("enquiries").insert({ name, contact, interest, message });
  if (error) return { error: "Something went wrong. Please message me on Instagram instead." };
  return { ok: true };
}
