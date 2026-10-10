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

// Patanjali describes yoga as eight limbs. These are the four my classes work with most, in their classical order.
export const YOGA_LIMBS = [
  { limb: "Limb 3 of 8", name: "Asana", via: "Through Hatha yoga", body: "Steady, comfortable postures that build strength, flexibility and balance. Ha is the sun, tha the moon: effort and ease held together." },
  { limb: "Limb 4 of 8", name: "Pranayama", via: "Prana, life force. Ayama, to extend.", body: "Conscious breathing that steadies the mind and brings energy back into the body." },
  { limb: "Limb 5 of 8", name: "Pratyahara", via: "Experienced through Yoga Nidra", body: "Turning the senses gently inward. In Yoga Nidra the body rests completely while you stay softly aware." },
  { limb: "Limb 7 of 8", name: "Dhyana", via: "Meditation", body: "Attention that rests without effort, until the mind grows quiet and clear on its own." },
];

// Marma comes from Ayurveda, yoga's sister science, so it is shown beside yoga rather than inside it.
export const MARMA = {
  title: "Marma",
  via: "From Ayurveda, yoga's sister science",
  body: "The classical texts describe 107 marma points, where muscle, vessels, tendons, bone and joints meet. Gentle touch on these points helps release held tension and restore the flow of prana. I bring Marma into my therapy work alongside yoga.",
};
