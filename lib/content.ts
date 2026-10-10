// Website text that is easy to change without touching the page layout.

export const TEACHER = {
  name: "Deepshikha",
  tagline: "Dive Deeper to Rise Higher",
  focus: "Mind, Yoga and Wellness",
  // Check these with her before launch.
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

// Her own Instagram reels shown on the home page. Add or remove links here.
export const INSTAGRAM_REELS = [
  "https://www.instagram.com/reel/DZJ-m4CRPTG/",
  "https://www.instagram.com/reel/DUpk3EiETeo/",
];

export const ABOUT = {
  // Photo in /public. Replace teacher.jpg with a larger, sharper portrait when she has one.
  photo: "/pose-fort.jpg",
  paragraphs: [
    "For more than a decade, Deepshikha has taught yoga, meditation and breathwork to students, working professionals, corporate teams and administrators.",
    "Her approach is holistic: Hatha yoga, pranayama, meditation, Marma therapy and life coaching come together to care for the body, settle the mind and nourish the spirit.",
    "Every student is seen individually. Your goals, your body, and anything you share about pain or health shape how you practise.",
  ],
};

export const CLASSES = [
  {
    title: "Group classes",
    body: "Live online sessions in a small group. A steady rhythm for building the habit.",
    cta: "Ask about timings",
  },
  {
    title: "1-on-1 sessions",
    body: "A plan built only for you: your goals, your schedule, your body's needs.",
    cta: "Ask about a session",
  },
  {
    title: "Meditation",
    body: "Guided breathwork and meditation to calm a busy mind and sleep better.",
    cta: "Ask about meditation",
  },
];

// Free videos shown on the home page. Add YouTube video ids (the part after "v=" in the link).
// While this list is empty, the section shows a single card that opens her YouTube channel.
export const FREE_VIDEOS: { id: string; title: string }[] = [];
