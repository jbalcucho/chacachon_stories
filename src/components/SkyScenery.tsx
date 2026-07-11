/** Fondo decorativo: estrellas, nubes y colinas (solo visual). */

type FieldStar = {
  top: string;
  left: string;
  size: "sm" | "md" | "lg";
  twinkle: "a" | "b" | "c" | "d" | "e" | "f";
};

const FIELD_STARS: FieldStar[] = [
  { top: "6%", left: "8%", size: "md", twinkle: "a" },
  { top: "4%", left: "22%", size: "sm", twinkle: "b" },
  { top: "11%", left: "35%", size: "lg", twinkle: "c" },
  { top: "3%", left: "48%", size: "sm", twinkle: "d" },
  { top: "9%", left: "58%", size: "md", twinkle: "e" },
  { top: "5%", left: "72%", size: "lg", twinkle: "f" },
  { top: "13%", left: "84%", size: "sm", twinkle: "a" },
  { top: "7%", left: "93%", size: "md", twinkle: "b" },
  { top: "16%", left: "15%", size: "sm", twinkle: "c" },
  { top: "14%", left: "28%", size: "md", twinkle: "d" },
  { top: "18%", left: "42%", size: "sm", twinkle: "e" },
  { top: "12%", left: "52%", size: "lg", twinkle: "f" },
  { top: "17%", left: "66%", size: "sm", twinkle: "a" },
  { top: "15%", left: "78%", size: "md", twinkle: "b" },
  { top: "20%", left: "88%", size: "sm", twinkle: "c" },
  { top: "22%", left: "6%", size: "md", twinkle: "d" },
  { top: "24%", left: "38%", size: "sm", twinkle: "e" },
  { top: "21%", left: "62%", size: "md", twinkle: "f" },
  { top: "25%", left: "95%", size: "sm", twinkle: "a" },
];

const BRIGHT_FIELD_STARS = [
  { top: "10%", left: "18%", twinkle: "b" as const },
  { top: "8%", left: "45%", twinkle: "d" as const },
  { top: "14%", left: "70%", twinkle: "f" as const },
  { top: "6%", left: "82%", twinkle: "a" as const },
  { top: "19%", left: "55%", twinkle: "c" as const },
];

export default function SkyScenery() {
  return (
    <>
      <div className="sky-scenery" aria-hidden="true">
        <div className="sky-starfield">
          {FIELD_STARS.map((star, index) => (
            <span
              key={`field-${index}`}
              className={`sky-starfield__dot sky-starfield__dot--${star.size} sky-star--twinkle-${star.twinkle}`}
              style={{ top: star.top, left: star.left }}
            />
          ))}
          {BRIGHT_FIELD_STARS.map((star, index) => (
            <span
              key={`bright-field-${index}`}
              className={`sky-starfield__bright sky-star--twinkle-${star.twinkle}`}
              style={{ top: star.top, left: star.left }}
            >
              ✦
            </span>
          ))}
        </div>

        <svg
        className="sky-scenery__svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hill-back" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a4468" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1a2f4c" stopOpacity="0.78" />
          </linearGradient>
          <linearGradient id="hill-mid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a6554" stopOpacity="0.52" />
            <stop offset="100%" stopColor="#274a3d" stopOpacity="0.84" />
          </linearGradient>
          <linearGradient id="hill-front" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#458568" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#1c5340" stopOpacity="0.92" />
          </linearGradient>
        </defs>

        <path
          fill="url(#hill-back)"
          d="M0 720 Q180 640 360 680 T720 660 T1080 700 T1440 650 L1440 900 L0 900 Z"
        />
        <path
          fill="url(#hill-mid)"
          d="M0 760 Q240 700 480 740 T960 720 T1440 760 L1440 900 L0 900 Z"
        />
        <path
          fill="url(#hill-front)"
          d="M0 800 Q200 740 400 770 Q640 810 880 760 Q1120 720 1440 790 L1440 900 L0 900 Z"
        />

        <g className="sky-cloud sky-cloud--a" opacity="0.68">
          <ellipse cx="220" cy="180" rx="95" ry="38" fill="rgba(255,248,242,0.28)" />
          <ellipse cx="290" cy="168" rx="72" ry="30" fill="rgba(255,248,242,0.22)" />
          <ellipse cx="160" cy="192" rx="58" ry="24" fill="rgba(240,230,216,0.22)" />
        </g>

        <g className="sky-cloud sky-cloud--b" opacity="0.62">
          <ellipse cx="1080" cy="140" rx="110" ry="42" fill="rgba(255,248,242,0.26)" />
          <ellipse cx="980" cy="155" rx="70" ry="28" fill="rgba(255,233,184,0.18)" />
          <ellipse cx="1160" cy="158" rx="65" ry="26" fill="rgba(240,230,216,0.2)" />
        </g>

        <g className="sky-cloud sky-cloud--c" opacity="0.55">
          <ellipse cx="620" cy="110" rx="88" ry="34" fill="rgba(255,248,242,0.22)" />
          <ellipse cx="700" cy="100" rx="55" ry="22" fill="rgba(255,233,184,0.16)" />
        </g>

        <g className="sky-cloud sky-cloud--d" opacity="0.5">
          <ellipse cx="480" cy="260" rx="75" ry="30" fill="rgba(255,248,242,0.2)" />
          <ellipse cx="540" cy="250" rx="50" ry="20" fill="rgba(255,233,184,0.14)" />
        </g>
      </svg>
      </div>

      <div className="sky-shooting-layer" aria-hidden="true">
        <span className="sky-shooting-star sky-shooting-star--a" />
        <span className="sky-shooting-star sky-shooting-star--b" />
        <span className="sky-shooting-star sky-shooting-star--c" />
      </div>
    </>
  );
}
