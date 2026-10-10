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
  "Yoga, breath, meditation and healing, practised with care. Come as you are, and let's find your way back to ease, calm and joy, one breath at a time.";

// A short line in my voice, shown beside my photo.
export const QUOTE = "Yoga, for me, is a way of coming home: to the breath, to the body, and to the quiet place within.";

export const ABOUT = {
  photo: "/pose-fort.jpg",
  heading: "Hi, I'm Deepshikha",
  paragraphs: [
    "For more than a decade, I have taught yoga, meditation and breathwork to students, working professionals, corporate teams and administrators.",
    "My approach is holistic. Hatha yoga, pranayama, meditation, Marma therapy and life coaching come together to care for the body, settle the mind and nourish the spirit.",
    "I see every person individually. Your goals, your body, and anything you share about pain or health shape how we practise together.",
  ],
};

// Words in the band under the opening section.
export const PRACTICE_WORDS = ["Hatha Yoga", "Pranayama", "Meditation", "Yoga Nidra", "Marma", "Yoga Therapy", "Live online"];

// YouTube videos shown on the home page. Add video ids (the part after "v=" in the link).
export const YOUTUBE_VIDEOS: { id: string; title: string }[] = [];

// The practices explained on the home page, with what each word means.
export const YOGA_PRACTICES = [
  { name: "Hatha Yoga", meaning: "Ha, the sun. Tha, the moon.", body: "Postures that balance effort and ease, building strength, flexibility and steadiness." },
  { name: "Pranayama", meaning: "Prana, life force. Ayama, to extend.", body: "Breath practices that steady the mind and bring energy back into the body." },
  { name: "Dhyana", meaning: "Meditation, resting attention.", body: "Learning to sit with the mind gently, until it becomes quiet and clear on its own." },
  { name: "Yoga Nidra", meaning: "Yogic sleep.", body: "Deep, guided rest done lying down, where the body relaxes fully while you stay softly aware." },
  { name: "Marma", meaning: "The body's vital points.", body: "An Ayurvedic practice of gentle touch on points where tissues and energy meet, to release held tension." },
];
