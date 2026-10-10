// Website text that is easy to change without touching the page layout.
// The site speaks in Deepshikha's own voice, so copy is written in the first person.

export const TEACHER = {
  name: "Deepshikha",
  tagline: "Dive Deeper to Rise Higher",
  focus: "Mind, Yoga and Wellness",
  // Confirm these before launch.
  credentials: [
    "Sri Sri Yoga faculty, Art of Living",
    "Level 3 Yoga Instructor",
    "Professional Yoga Therapist",
    "Marma Therapist",
    "Certified Life Coach",
  ],
};

export const PHOTOS = {
  hero: "/meditation-river.jpg",
  pose: "/pose-fort.jpg",
  nature: "/forest-walk.jpg",
};

// Instagram reels shown on the home page. Add or remove links here.
export const INSTAGRAM_REELS = [
  "https://www.instagram.com/reel/DZJ-m4CRPTG/",
  "https://www.instagram.com/reel/DUpk3EiETeo/",
];

export const HERO_TEXT =
  "Holistic wellness for mind, body and soul. I share yoga, breathwork, meditation and healing practices to help you move with ease, find calm, and come home to yourself.";

export const ABOUT = {
  photo: "/pose-fort.jpg",
  heading: "Hi, I'm Deepshikha",
  paragraphs: [
    "For more than a decade, I have been teaching yoga, meditation and breathwork to students, working professionals, corporate teams and administrators.",
    "My approach is holistic. Hatha yoga, pranayama, meditation, Marma therapy and life coaching come together to care for the body, settle the mind and nourish the spirit.",
    "I see every person individually. Your goals, your body, and anything you share about pain or health shape how we practise together.",
  ],
};

// "Work with me": personal and group offerings. No prices here; every card leads to a conversation.
export const WORK_WITH_ME = [
  {
    title: "Live group classes",
    body: "Practise with me live, in small online groups. A steady rhythm that makes the habit easy to keep.",
    cta: "Ask about timings",
    interest: "Live group classes",
  },
  {
    title: "1:1 guidance",
    body: "Personal yoga therapy, Marma care or life coaching, shaped around your body, your goals and your pace.",
    cta: "Start a conversation",
    interest: "1:1 guidance",
  },
  {
    title: "Soulful conversations",
    body: "Unhurried conversations on stress, purpose, relationships and finding balance, with practices to take home.",
    cta: "Reach out",
    interest: "Soulful conversations",
  },
  {
    title: "For organisations",
    body: "I have guided corporate teams, schools and groups. Sessions on stress, posture, breath and focus, designed for your people.",
    cta: "Plan a session",
    interest: "Sessions for an organisation",
  },
];

// The choices in the enquiry form. Keep in sync with WORK_WITH_ME interests.
export const ENQUIRY_INTERESTS = [
  "Live group classes",
  "1:1 guidance",
  "Soulful conversations",
  "Sessions for an organisation",
  "Something else",
];

// YouTube videos shown on the home page. Add video ids (the part after "v=" in the link).
// While this list is empty, the section shows a single card that opens the YouTube channel.
export const FREE_VIDEOS: { id: string; title: string }[] = [];
