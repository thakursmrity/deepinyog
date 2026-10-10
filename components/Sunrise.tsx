// Hero illustration: a seated figure in front of a soft sunrise and faint mountains,
// echoing the Himalayan banner and the sun in the logo.
export function Sunrise({ label = "Illustration of a person meditating at sunrise in the mountains" }: { label?: string }) {
  return (
    <svg viewBox="0 0 400 400" style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={label}>
      <defs>
        <radialGradient id="sr-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb53a" />
          <stop offset="35%" stopColor="#ffd27a" />
          <stop offset="65%" stopColor="#ffe9bf" />
          <stop offset="100%" stopColor="#fff6e6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sr-far" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f9dcd5" />
          <stop offset="100%" stopColor="#fdf0ec" />
        </linearGradient>
        <linearGradient id="sr-near" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d6e6d2" />
          <stop offset="100%" stopColor="#eef5ec" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="170" r="150" fill="url(#sr-sun)" />
      <path d="M0 300 L70 220 L120 255 L190 185 L250 240 L300 205 L400 285 L400 400 L0 400 Z" fill="url(#sr-far)" />
      <path d="M0 330 L90 270 L160 305 L230 262 L310 300 L400 270 L400 400 L0 400 Z" fill="url(#sr-near)" />
      <g fill="#8f6470">
        <circle cx="200" cy="208" r="16" />
        <path d="M200 228 C222 228 232 254 230 288 L170 288 C168 254 178 228 200 228 Z" />
        <path d="M128 312 C150 288 176 284 200 294 C224 284 250 288 272 312 C250 318 226 316 200 308 C174 316 150 318 128 312 Z" />
        <path d="M172 250 C160 262 150 276 146 292 L156 294 C160 280 168 268 178 260 Z" />
        <path d="M228 250 C240 262 250 276 254 292 L244 294 C240 280 232 268 222 260 Z" />
      </g>
    </svg>
  );
}
