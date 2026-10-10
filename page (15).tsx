import { requireTeacher } from "@/lib/auth";
import { PlanForm, type PlanRow } from "./PlanForm";

export default async function Plans() {
  const { supabase } = await requireTeacher();
  const { data } = await supabase.from("plans").select("id, kind, name, description, price_paise, duration_days, sessions, active").order("sort");
  const plans = (data ?? []) as PlanRow[];

  return (
    <>
      <h1 style={{ fontSize: 38 }}>Membership and coaching prices</h1>
      <p style={{ color: "var(--soft)" }}>Changes show on the website straight away. People who already bought keep what they paid for.</p>
      <h2 style={{ fontSize: 26 }}>Membership</h2>
      {plans.filter((p) => p.kind === "membership").map((p) => <PlanForm key={p.id} plan={p} />)}
      <h2 style={{ fontSize: 26 }}>1-on-1 coaching packs</h2>
      {plans.filter((p) => p.kind === "coaching").map((p) => <PlanForm key={p.id} plan={p} />)}
    </>
  );
}
