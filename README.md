# Deepinyog

The website and learning platform for Deepinyog.

- **Website**: separate pages for Home, About me, Programs and Connect, plus Log in. Home explains yoga and the practices I teach and points to the other pages. Programs starts with upcoming programs, then what practice works on, paths by need and my videos. Connect takes questions and one-on-one conversation requests. New students register on the login page with name, email and password (or Google); prices appear only on programs and courses, and membership options only after registering.
- **/app** (students): free videos, members library, my courses with day-wise lessons, a pick-up-where-you-left-off panel (continue watching, next program day, a fresh suggestion), streaks, teacher notes, membership and payments.
- **/teacher**: platform health (activation, conversion, renewal, videos published, most watched), sales and revenue, enquiries, courses with waitlists and early-bird prices, video library with access levels, classes and attendance, prices, coaching sessions, and giving access by hand.
- **Payments**: Razorpay checkout for membership passes, courses and coaching packs, confirmed by signature check and a webhook.

Built with Next.js on Vercel and Supabase (database, logins, video storage).

## Setup

Follow `Deepinyog_Setup_Guide.pdf`. In short: create a Supabase project, run `supabase/schema.sql`, make the teacher login, push to GitHub, import into Vercel with the variables in `.env.example`, add the Razorpay webhook, test in Razorpay test mode, then connect deepinyog.com.

## Run on your computer

```
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

## Where things live

- Website text, class cards, free YouTube videos, teacher photo: `lib/content.ts`
- Social links: `lib/links.ts`
- Colors and spacing: `app/globals.css`
- Database, access rules and starting prices: `supabase/schema.sql`
- Payment logic: `lib/razorpay.ts`, `lib/fulfill.ts`, `app/checkout/actions.ts`, `app/api/razorpay/webhook/route.ts`

## Access rules

Free videos: anyone signed in. Members videos: active membership. Course lessons: people enrolled, or members when the course is marked as included. Assigned videos: the students the teacher assigns them to. These rules live in the database, so the video files stay protected even if a page has a bug. Purchases are only ever granted on the server after Razorpay's signature is verified.
