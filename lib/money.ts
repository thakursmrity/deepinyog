export function inr(paise: number) {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
  }).format(rupees);
}

export type CoursePricing = {
  price_paise: number;
  early_bird_price_paise: number | null;
  early_bird_until: string | null;
};

// India date (YYYY-MM-DD) for comparing with early-bird end dates.
function todayIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export function earlyBirdActive(c: CoursePricing) {
  return Boolean(c.early_bird_price_paise != null && c.early_bird_until && c.early_bird_until >= todayIndia());
}

export function coursePrice(c: CoursePricing) {
  return earlyBirdActive(c) ? (c.early_bird_price_paise as number) : c.price_paise;
}
