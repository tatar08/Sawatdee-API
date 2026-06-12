import { useStore } from "../../store/useStore";
import styles from "./BackgroundDecor.module.css";

/* Pattern ID map for the SVG fill */
const PATTERN_MAP: Record<string, string> = {
  dog: "seigaiha",
  cat: "sakura",
  rabbit: "kumo",
  panda: "bamboo",
  elephant: "lotus",
  kitsune: "torii",
  dragon: "dragonscale",
  deer: "maple",
  koi: "wave",
  owl: "crescent",
  turtle: "hexshell",
  butterfly: "wingpetal",
  crane: "origami",
  naga: "flamescale",
  tiger: "tigerstripe",
  suvarnabhumi: "royalgold",
  ayutthaya: "blueprintgrid",
  bangkok: "neoncircuit",
  cybersiam: "siammatrix",
};

export function BackgroundDecor() {
  const themePattern = useStore((s) => s.settings.themePattern ?? "none");

  if (themePattern === "none") return null;

  const patternId = PATTERN_MAP[themePattern] ?? "seigaiha";

  return (
    <>
      <div className={styles.container}>
        <svg className={styles.pattern} width="100%" height="100%">
          <defs>
            {/* Shiba Inu: Japanese Seigaiha Waves */}
            <pattern
              id="pattern-seigaiha"
              width="60"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 0 30 A 30 30 0 0 1 60 30 M -30 15 A 30 30 0 0 1 30 15 M 30 15 A 30 30 0 0 1 90 15 M 0 0 A 30 30 0 0 1 60 0 M -30 45 A 30 30 0 0 1 30 45 M 30 45 A 30 30 0 0 1 90 45"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </pattern>

            {/* Maneki-Neko: Sakura Blossoms */}
            <pattern
              id="pattern-sakura"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 20 C 18 10, 28 10, 26 20 C 24 30, 20 20, 20 20 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                transform="rotate(0, 20, 20)"
              />
              <path
                d="M 20 20 C 18 10, 28 10, 26 20 C 24 30, 20 20, 20 20 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                transform="rotate(72, 20, 20)"
              />
              <path
                d="M 20 20 C 18 10, 28 10, 26 20 C 24 30, 20 20, 20 20 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                transform="rotate(144, 20, 20)"
              />
              <path
                d="M 20 20 C 18 10, 28 10, 26 20 C 24 30, 20 20, 20 20 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                transform="rotate(216, 20, 20)"
              />
              <path
                d="M 20 20 C 18 10, 28 10, 26 20 C 24 30, 20 20, 20 20 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                transform="rotate(288, 20, 20)"
              />
              <path
                d="M 60 50 C 65 42, 70 45, 68 52 C 66 59, 60 56, 60 56 Z"
                fill="currentColor"
                opacity="0.3"
                transform="rotate(25, 64, 52)"
              />
              <path
                d="M 50 15 C 55 7, 60 10, 58 17 C 56 24, 50 21, 50 21 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                transform="rotate(-45, 54, 17)"
              />
              <path
                d="M 15 60 C 20 52, 25 55, 23 62 C 21 69, 15 66, 15 66 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                transform="rotate(115, 19, 62)"
              />
            </pattern>

            {/* Usagi: Traditional Japanese Clouds (Kumo) */}
            <pattern
              id="pattern-kumo"
              width="100"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 15 35 Q 25 22 35 35 Q 45 22 55 35 Q 62 42 55 50 L 15 50 Q 8 42 15 35 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                transform="translate(5, 5)"
              />
              <path
                d="M 15 35 Q 25 22 35 35 Q 45 22 55 35 Q 62 42 55 50 L 15 50 Q 8 42 15 35 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                transform="translate(50, 40) scale(0.7)"
              />
            </pattern>

            {/* Panda: Bamboo Leaves */}
            <pattern
              id="pattern-bamboo"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 15 0 L 15 80 M 55 0 L 55 80"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="14, 2"
              />
              <path
                d="M 15 25 C 22 23, 32 15, 38 10 C 35 18, 25 24, 15 25 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <path
                d="M 15 25 C 20 28, 28 32, 34 35 C 29 34, 22 30, 15 25 Z"
                fill="currentColor"
                opacity="0.3"
              />
              <path
                d="M 55 45 C 48 43, 38 35, 32 30 C 35 38, 45 44, 55 45 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <path
                d="M 55 45 C 50 48, 42 52, 36 55 C 41 54, 48 50, 55 45 Z"
                fill="currentColor"
                opacity="0.3"
              />
            </pattern>

            {/* Thai Elephant: Lotus Flowers & Ripples */}
            <pattern
              id="pattern-lotus"
              width="90"
              height="90"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="45" cy="45" r="35" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6, 6" />
              <circle cx="45" cy="45" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
              <g transform="translate(45, 45) scale(0.65)">
                <path d="M 0 -20 C -4 -10, -8 -5, 0 10 C 8 -5, 4 -10, 0 -20 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M 0 10 C -10 8, -18 0, -12 -5 C -8 0, -4 4, 0 10 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M 0 10 C 10 8, 18 0, 12 -5 C 8 0, 4 4, 0 10 Z" fill="none" stroke="currentColor" strokeWidth="1" />
              </g>
            </pattern>

            {/* ===== NEW PATTERNS ===== */}

            {/* Kitsune: Torii Gate Outlines */}
            <pattern id="pattern-torii" width="80" height="80" patternUnits="userSpaceOnUse">
              <g transform="translate(40, 40) scale(0.5)">
                <path d="M -40 -20 L 40 -20 L 44 -28 L -44 -28 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M -32 -20 L -32 30 M 32 -20 L 32 30" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M -28 -8 L 28 -8" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </g>
              <circle cx="15" cy="15" r="3" fill="currentColor" opacity="0.2" />
              <circle cx="65" cy="65" r="2" fill="currentColor" opacity="0.15" />
            </pattern>

            {/* Dragon: Interlocking Scales */}
            <pattern id="pattern-dragonscale" width="48" height="28" patternUnits="userSpaceOnUse">
              <path d="M 0 28 A 24 24 0 0 1 48 28 M -24 14 A 24 24 0 0 1 24 14 M 24 14 A 24 24 0 0 1 72 14" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="24" cy="24" r="1.5" fill="currentColor" opacity="0.25" />
              <circle cx="0" cy="10" r="1" fill="currentColor" opacity="0.2" />
              <circle cx="48" cy="10" r="1" fill="currentColor" opacity="0.2" />
            </pattern>

            {/* Deer: Maple Leaves */}
            <pattern id="pattern-maple" width="80" height="80" patternUnits="userSpaceOnUse">
              <g transform="translate(20, 20) scale(0.55)">
                <path d="M 0 -25 L 8 -12 L 22 -12 L 10 0 L 14 15 L 0 6 L -14 15 L -10 0 L -22 -12 L -8 -12 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M 0 6 L 0 30" fill="none" stroke="currentColor" strokeWidth="1" />
              </g>
              <g transform="translate(60, 60) scale(0.35) rotate(25)">
                <path d="M 0 -25 L 8 -12 L 22 -12 L 10 0 L 14 15 L 0 6 L -14 15 L -10 0 L -22 -12 L -8 -12 Z" fill="currentColor" opacity="0.15" />
                <path d="M 0 6 L 0 30" fill="none" stroke="currentColor" strokeWidth="1" />
              </g>
            </pattern>

            {/* Koi: Wave Ripples */}
            <pattern id="pattern-wave" width="80" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 20 Q 10 10 20 20 Q 30 30 40 20 Q 50 10 60 20 Q 70 30 80 20" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M 0 30 Q 10 20 20 30 Q 30 40 40 30 Q 50 20 60 30 Q 70 40 80 30" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4,3" />
              <circle cx="25" cy="12" r="2" fill="currentColor" opacity="0.2" />
              <circle cx="65" cy="28" r="1.5" fill="currentColor" opacity="0.15" />
            </pattern>

            {/* Owl: Crescent Moons & Stars */}
            <pattern id="pattern-crescent" width="70" height="70" patternUnits="userSpaceOnUse">
              <g transform="translate(35, 35)">
                <path d="M 8 -18 A 18 18 0 1 0 8 18 A 14 14 0 1 1 8 -18" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </g>
              <g transform="translate(12, 15) scale(0.5)">
                <path d="M 0 -8 L 2 -2 L 8 -2 L 3 2 L 5 8 L 0 4 L -5 8 L -3 2 L -8 -2 L -2 -2 Z" fill="currentColor" opacity="0.25" />
              </g>
              <g transform="translate(58, 55) scale(0.4)">
                <path d="M 0 -8 L 2 -2 L 8 -2 L 3 2 L 5 8 L 0 4 L -5 8 L -3 2 L -8 -2 L -2 -2 Z" fill="currentColor" opacity="0.2" />
              </g>
            </pattern>

            {/* Turtle: Hexagonal Shell */}
            <pattern id="pattern-hexshell" width="60" height="52" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 60 15 L 60 39 L 30 52 L 0 39 L 0 15 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
              <path d="M 30 0 L 30 52 M 0 15 L 60 39 M 60 15 L 0 39" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            </pattern>

            {/* Butterfly: Wing Petals */}
            <pattern id="pattern-wingpetal" width="80" height="80" patternUnits="userSpaceOnUse">
              <g transform="translate(40, 25)">
                <path d="M 0 0 C -20 -15 -25 5 -8 12" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M 0 0 C 20 -15 25 5 8 12" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M 0 0 C -12 8 -18 22 -6 18" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <path d="M 0 0 C 12 8 18 22 6 18" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.3" />
              </g>
              <g transform="translate(10, 65) scale(0.5) rotate(-20)">
                <path d="M 0 0 C -20 -15 -25 5 -8 12" fill="currentColor" opacity="0.12" />
                <path d="M 0 0 C 20 -15 25 5 8 12" fill="currentColor" opacity="0.12" />
              </g>
            </pattern>

            {/* Crane: Origami Folds */}
            <pattern id="pattern-origami" width="80" height="80" patternUnits="userSpaceOnUse">
              <g transform="translate(40, 30) scale(0.55)">
                <path d="M 0 -30 L 30 10 L 15 10 L 40 30 L -40 30 L -15 10 L -30 10 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M 0 -30 L 0 30" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <path d="M 0 -10 L 18 10 M 0 -10 L -18 10" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3,2" />
              </g>
            </pattern>

            {/* Naga: Flame Scales */}
            <pattern id="pattern-flamescale" width="60" height="50" patternUnits="userSpaceOnUse">
              <path d="M 15 50 Q 15 30 30 15 Q 45 30 45 50" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M 30 15 Q 22 5 30 0 Q 38 5 30 15" fill="currentColor" opacity="0.2" />
              <path d="M 0 50 Q 0 35 -15 20 Q -15 30 0 50" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
              <path d="M 60 50 Q 60 35 75 20 Q 75 30 60 50" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
            </pattern>

            {/* Tiger: Stripes */}
            <pattern id="pattern-tigerstripe" width="40" height="60" patternUnits="userSpaceOnUse">
              <path d="M 8 0 Q 12 15 6 30 Q 2 42 10 60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
              <path d="M 24 0 Q 28 18 22 35 Q 18 48 26 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.25" />
              <path d="M 36 5 Q 34 20 38 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
            </pattern>

            {/* ===== THAI DESIGN PATTERNS ===== */}

            {/* Suvarnabhumi: Royal Gold Radial */}
            <pattern id="pattern-royalgold" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
              <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
              <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.15" />
              <path d="M 20 2 L 20 10 M 20 30 L 20 38 M 2 20 L 10 20 M 30 20 L 38 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
              <path d="M 6 6 L 12 12 M 28 6 L 22 12 M 6 34 L 12 28 M 28 34 L 22 28" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
            </pattern>

            {/* Ayutthaya: Blueprint Grid */}
            <pattern id="pattern-blueprintgrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect width="60" height="60" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.15" />
              <rect x="10" y="10" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.2" />
              <circle cx="30" cy="30" r="12" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" strokeDasharray="3,3" />
              <path d="M 0 30 L 60 30 M 30 0 L 30 60" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
              <circle cx="10" cy="10" r="1.5" fill="currentColor" opacity="0.12" />
              <circle cx="50" cy="50" r="1.5" fill="currentColor" opacity="0.12" />
            </pattern>

            {/* Bangkok: Neon Circuit Board */}
            <pattern id="pattern-neoncircuit" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 0 30 L 15 30 L 20 20 L 30 20 L 30 10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
              <path d="M 30 50 L 30 40 L 40 40 L 45 30 L 60 30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
              <circle cx="30" cy="10" r="2" fill="currentColor" opacity="0.3" />
              <circle cx="30" cy="50" r="2" fill="currentColor" opacity="0.2" />
              <circle cx="0" cy="30" r="1.5" fill="currentColor" opacity="0.2" />
              <circle cx="60" cy="30" r="1.5" fill="currentColor" opacity="0.2" />
              <rect x="25" y="25" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.15" />
            </pattern>

            {/* Cyber Siam: Digital Matrix */}
            <pattern id="pattern-siammatrix" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 10 50" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
              <path d="M 25 0 L 25 50" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
              <path d="M 40 0 L 40 50" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
              <path d="M 10 8 L 25 8 L 25 18" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
              <path d="M 25 32 L 40 32 L 40 42" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
              <circle cx="10" cy="8" r="2" fill="currentColor" opacity="0.25" />
              <circle cx="25" cy="18" r="1.5" fill="currentColor" opacity="0.2" />
              <circle cx="40" cy="42" r="2" fill="currentColor" opacity="0.25" />
              <rect x="22" y="30" width="6" height="4" fill="currentColor" opacity="0.1" rx="1" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill={`url(#pattern-${patternId})`} />
        </svg>
      </div>

      <div className={styles.mascotWrapper}>
        {themePattern === "dog" && <ShibaMascot />}
        {themePattern === "cat" && <NekoMascot />}
        {themePattern === "rabbit" && <UsagiMascot />}
        {themePattern === "panda" && <PandaMascot />}
        {themePattern === "elephant" && <ChangMascot />}
        {themePattern === "kitsune" && <KitsuneMascot />}
        {themePattern === "dragon" && <DragonMascot />}
        {themePattern === "deer" && <DeerMascot />}
        {themePattern === "koi" && <KoiMascot />}
        {themePattern === "owl" && <OwlMascot />}
        {themePattern === "turtle" && <TurtleMascot />}
        {themePattern === "butterfly" && <ButterflyMascot />}
        {themePattern === "crane" && <CraneMascot />}
        {themePattern === "naga" && <NagaMascot />}
        {themePattern === "tiger" && <TigerMascot />}
        {themePattern === "suvarnabhumi" && <SuvarnabhumiMascot />}
        {themePattern === "ayutthaya" && <AyutthayaMascot />}
        {themePattern === "bangkok" && <BangkokMascot />}
        {themePattern === "cybersiam" && <CyberSiamMascot />}
      </div>
    </>
  );
}

/* --- Original Mascot SVG Components --- */

function ShibaMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="75" ry="12" fill="rgba(50, 37, 26, 0.15)" />
      <path d="M 55 140 C 55 110, 145 110, 145 140 L 160 200 L 40 200 Z" fill="#e27d3c" />
      <path d="M 60 142 C 75 130, 125 130, 140 142 L 135 155 C 115 145, 85 145, 65 155 Z" fill="#cf3c3c" />
      <circle cx="75" cy="143" r="3" fill="#ffffff" />
      <circle cx="95" cy="140" r="3" fill="#ffffff" />
      <circle cx="115" cy="141" r="3" fill="#ffffff" />
      <circle cx="125" cy="144" r="3" fill="#ffffff" />
      <circle cx="85" cy="148" r="3" fill="#ffffff" />
      <circle cx="105" cy="147" r="3" fill="#ffffff" />
      <ellipse cx="100" cy="95" rx="60" ry="50" fill="#e27d3c" />
      <path d="M 45 95 C 45 125, 75 140, 100 140 C 125 140, 155 125, 155 95 C 155 75, 135 60, 100 60 C 65 60, 45 75, 45 95 Z" fill="#e27d3c" />
      <path d="M 46 102 C 48 122, 65 138, 100 138 C 135 138, 152 122, 154 102 C 145 88, 125 88, 100 88 C 75 88, 55 88, 46 102 Z" fill="#ffffff" />
      <path d="M 48 65 L 25 28 C 22 23, 32 20, 38 25 L 68 53 Z" fill="#e27d3c" />
      <path d="M 50 60 L 33 34 C 31 31, 37 30, 41 33 L 64 51 Z" fill="#fce8dc" />
      <path d="M 152 65 L 175 28 C 178 23, 168 20, 162 25 L 132 53 Z" fill="#e27d3c" />
      <path d="M 150 60 L 167 34 C 169 31, 163 30, 159 33 L 136 51 Z" fill="#fce8dc" />
      <path d="M 68 90 Q 78 82 85 90" fill="none" stroke="#32251a" strokeWidth="4" strokeLinecap="round" />
      <path d="M 132 90 Q 122 82 115 90" fill="none" stroke="#32251a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="58" cy="108" r="10" fill="#e76f8e" opacity="0.65" />
      <circle cx="142" cy="108" r="10" fill="#e76f8e" opacity="0.65" />
      <ellipse cx="100" cy="100" rx="8" ry="5" fill="#32251a" />
      <path d="M 92 107 Q 100 115 100 107 Q 100 115 108 107" fill="none" stroke="#32251a" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="78" cy="74" rx="7" ry="5" fill="#ffffff" />
      <ellipse cx="122" cy="74" rx="7" ry="5" fill="#ffffff" />
    </svg>
  );
}

function NekoMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="70" ry="10" fill="rgba(42, 22, 34, 0.12)" />
      <path d="M 60 135 C 50 115, 150 115, 140 135 L 155 200 L 45 200 Z" fill="#ffffff" stroke="#e76f8e" strokeWidth="2" />
      <path d="M 50 155 C 55 145, 68 150, 72 165 C 65 175, 55 170, 50 155 Z" fill="#e27d3c" />
      <path d="M 148 145 C 138 140, 132 152, 136 165 C 145 168, 150 158, 148 145 Z" fill="#4a4269" />
      <path d="M 65 138 Q 100 152 135 138" fill="none" stroke="#cf3c3c" strokeWidth="7" strokeLinecap="round" />
      <circle cx="100" cy="148" r="12" fill="#f3be32" stroke="#b08511" strokeWidth="1.5" />
      <circle cx="100" cy="146" r="3" fill="#32251a" />
      <path d="M 96 151 L 104 151" stroke="#32251a" strokeWidth="2" />
      <circle cx="100" cy="90" r="50" fill="#ffffff" stroke="#e76f8e" strokeWidth="2" />
      <path d="M 115 45 C 125 45, 145 65, 140 85 C 130 90, 120 70, 115 45 Z" fill="#e27d3c" />
      <path d="M 65 48 C 55 52, 53 72, 62 82 C 72 78, 70 58, 65 48 Z" fill="#4a4269" />
      <path d="M 55 70 L 45 35 C 43 30, 52 28, 58 34 L 78 60 Z" fill="#ffffff" stroke="#e76f8e" strokeWidth="2" />
      <path d="M 54 62 L 49 39 C 48 37, 53 36, 56 39 L 68 55 Z" fill="#ffd6e7" />
      <path d="M 145 70 L 155 35 C 157 30, 148 28, 142 34 L 122 60 Z" fill="#ffffff" stroke="#e76f8e" strokeWidth="2" />
      <path d="M 146 62 L 151 39 C 152 37, 147 36, 144 39 L 132 55 Z" fill="#ffd6e7" />
      <path d="M 70 88 Q 80 94 90 88" fill="none" stroke="#2a1622" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 130 88 Q 120 94 110 88" fill="none" stroke="#2a1622" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="45" y1="92" x2="60" y2="92" stroke="#9a7d8e" strokeWidth="2" strokeLinecap="round" />
      <line x1="47" y1="98" x2="59" y2="100" stroke="#9a7d8e" strokeWidth="2" strokeLinecap="round" />
      <line x1="155" y1="92" x2="140" y2="92" stroke="#9a7d8e" strokeWidth="2" strokeLinecap="round" />
      <line x1="153" y1="98" x2="141" y2="100" stroke="#9a7d8e" strokeWidth="2" strokeLinecap="round" />
      <circle cx="68" cy="98" r="7" fill="#e76f8e" opacity="0.6" />
      <circle cx="132" cy="98" r="7" fill="#e76f8e" opacity="0.6" />
      <polygon points="100,94 96,91 104,91" fill="#2a1622" />
      <path d="M 95 97 Q 100 103 100 97 Q 100 103 105 97" fill="none" stroke="#2a1622" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 40 135 C 32 135, 25 115, 30 105 C 35 95, 52 105, 50 120 Z" fill="#ffffff" stroke="#e76f8e" strokeWidth="2" />
      <line x1="36" y1="108" x2="38" y2="114" stroke="#e76f8e" strokeWidth="1.5" />
      <line x1="42" y1="106" x2="44" y2="112" stroke="#e76f8e" strokeWidth="1.5" />
    </svg>
  );
}

function UsagiMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="65" ry="9" fill="rgba(26, 21, 45, 0.12)" />
      <path d="M 50 145 C 40 120, 160 120, 150 145 L 160 200 L 40 200 Z" fill="#ffffff" />
      <ellipse cx="100" cy="100" rx="55" ry="46" fill="#ffffff" />
      <path d="M 62 65 Q 40 10, 52 5 Q 68 -2, 80 56 Z" fill="#ffffff" />
      <path d="M 64 58 Q 50 20, 56 16 Q 66 12, 74 52 Z" fill="#ffd6e7" />
      <path d="M 138 65 Q 160 10, 148 5 Q 132 -2, 120 56 Z" fill="#ffffff" />
      <path d="M 136 58 Q 150 20, 144 16 Q 134 12, 126 52 Z" fill="#ffd6e7" />
      <circle cx="75" cy="105" r="5.5" fill="#1a152d" />
      <circle cx="73.5" cy="103" r="2" fill="#ffffff" />
      <circle cx="125" cy="105" r="5.5" fill="#1a152d" />
      <circle cx="123.5" cy="103" r="2" fill="#ffffff" />
      <circle cx="62" cy="115" r="9" fill="#ff9ec4" opacity="0.7" />
      <circle cx="138" cy="115" r="9" fill="#ff9ec4" opacity="0.7" />
      <path d="M 96 110 L 104 118 M 104 110 L 96 118" fill="none" stroke="#1a152d" strokeWidth="2.5" strokeLinecap="round" />
      <g transform="translate(132, 75) scale(0.4)">
        <circle cx="20" cy="20" r="10" fill="#e76f8e" />
        <circle cx="10" cy="12" r="8" fill="#ff9ec4" />
        <circle cx="30" cy="12" r="8" fill="#ff9ec4" />
        <circle cx="10" cy="28" r="8" fill="#ff9ec4" />
        <circle cx="30" cy="28" r="8" fill="#ff9ec4" />
        <circle cx="20" cy="20" r="3" fill="#f3be32" />
      </g>
    </svg>
  );
}

function PandaMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="72" ry="11" fill="rgba(23, 36, 28, 0.15)" />
      <path d="M 50 140 C 45 110, 155 110, 150 140 L 160 200 L 40 200 Z" fill="#ffffff" />
      <path d="M 40 160 Q 60 140 85 155" fill="none" stroke="#17241c" strokeWidth="14" strokeLinecap="round" />
      <path d="M 160 160 Q 140 140 115 155" fill="none" stroke="#17241c" strokeWidth="14" strokeLinecap="round" />
      <ellipse cx="100" cy="95" rx="60" ry="50" fill="#ffffff" stroke="#17241c" strokeWidth="2.5" />
      <circle cx="50" cy="52" r="22" fill="#17241c" />
      <circle cx="50" cy="52" r="14" fill="#28392f" />
      <circle cx="150" cy="52" r="22" fill="#17241c" />
      <circle cx="150" cy="52" r="14" fill="#28392f" />
      <g transform="translate(72, 95) rotate(-15)">
        <ellipse cx="0" cy="0" rx="14" ry="19" fill="#17241c" />
        <circle cx="-2" cy="-4" r="5" fill="#ffffff" />
        <circle cx="-3" cy="-5" r="1.8" fill="#17241c" />
      </g>
      <g transform="translate(128, 95) rotate(15)">
        <ellipse cx="0" cy="0" rx="14" ry="19" fill="#17241c" />
        <circle cx="2" cy="-4" r="5" fill="#ffffff" />
        <circle cx="3" cy="-5" r="1.8" fill="#17241c" />
      </g>
      <circle cx="54" cy="115" r="8" fill="#ff9ec4" opacity="0.6" />
      <circle cx="146" cy="115" r="8" fill="#ff9ec4" opacity="0.6" />
      <ellipse cx="100" cy="110" rx="12" ry="8" fill="#f4faf4" />
      <ellipse cx="100" cy="108" rx="6" ry="4" fill="#17241c" />
      <path d="M 95 113 Q 100 118 100 113 Q 100 118 105 113" fill="none" stroke="#17241c" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 82 120 Q 94 116 102 114" fill="none" stroke="#5ca37b" strokeWidth="3" strokeLinecap="round" />
      <path d="M 76 116 C 74 122, 80 123, 82 120 Z" fill="#5ca37b" />
      <path d="M 85 113 C 81 109, 87 108, 90 112 Z" fill="#5ca37b" />
    </svg>
  );
}

function ChangMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="76" ry="11" fill="rgba(22, 36, 44, 0.15)" />
      <path d="M 55 135 C 45 105, 155 105, 145 135 L 160 200 L 40 200 Z" fill="#a4c6d6" />
      <circle cx="70" cy="190" r="6" fill="#ffffff" />
      <circle cx="85" cy="192" r="6" fill="#ffffff" />
      <circle cx="100" cy="193" r="6" fill="#ffffff" />
      <circle cx="115" cy="192" r="6" fill="#ffffff" />
      <circle cx="130" cy="190" r="6" fill="#ffffff" />
      <ellipse cx="40" cy="100" rx="35" ry="40" fill="#a4c6d6" transform="rotate(-10, 40, 100)" />
      <ellipse cx="43" cy="100" rx="25" ry="30" fill="#fcdbdc" transform="rotate(-10, 43, 100)" />
      <ellipse cx="160" cy="100" rx="35" ry="40" fill="#a4c6d6" transform="rotate(10, 160, 100)" />
      <ellipse cx="157" cy="100" rx="25" ry="30" fill="#fcdbdc" transform="rotate(10, 157, 100)" />
      <ellipse cx="100" cy="98" rx="52" ry="46" fill="#a4c6d6" />
      <circle cx="78" cy="96" r="6" fill="#16242c" />
      <circle cx="76.5" cy="94" r="2" fill="#ffffff" />
      <circle cx="122" cy="96" r="6" fill="#16242c" />
      <circle cx="120.5" cy="94" r="2" fill="#ffffff" />
      <circle cx="62" cy="109" r="8" fill="#e76f8e" opacity="0.6" />
      <circle cx="138" cy="109" r="8" fill="#e76f8e" opacity="0.6" />
      <path d="M 92 108 Q 90 138 100 138 Q 112 138 106 122 Q 102 112 112 110 Q 118 108 116 102 Q 110 100 106 106 Q 100 116 98 108 Z" fill="#a4c6d6" />
      <path d="M 94 116 Q 100 118 102 116" fill="none" stroke="#799cb6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 93 124 Q 101 126 103 124" fill="none" stroke="#799cb6" strokeWidth="2.5" strokeLinecap="round" />
      <g transform="translate(100, 48) scale(0.55)">
        <path d="M 0 -18 C -3 -8, -6 -3, 0 10 C 6 -3, 3 -8, 0 -18 Z" fill="#e76f8e" />
        <path d="M 0 10 C -8 8, -14 0, -10 -4 C -6 0, -3 3, 0 10 Z" fill="#ff9ec4" />
        <path d="M 0 10 C 8 8, 14 0, 10 -4 C 6 0, 3 3, 0 10 Z" fill="#ff9ec4" />
        <circle cx="0" cy="5" r="2" fill="#f3be32" />
      </g>
    </svg>
  );
}

/* =============== NEW MASCOTS =============== */

function KitsuneMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="70" ry="10" fill="rgba(46, 26, 14, 0.15)" />
      <path d="M 55 140 C 55 115, 145 115, 145 140 L 155 200 L 45 200 Z" fill="#d4622a" />
      <path d="M 70 150 C 80 142, 120 142, 130 150 L 135 200 L 65 200 Z" fill="#fff5e6" />
      <ellipse cx="100" cy="90" rx="55" ry="45" fill="#d4622a" />
      <path d="M 55 100 C 60 120, 80 132, 100 132 C 120 132, 140 120, 145 100 C 135 88, 115 85, 100 85 C 85 85, 65 88, 55 100 Z" fill="#fff5e6" />
      <path d="M 50 62 L 22 15 C 20 10, 30 8, 36 14 L 72 50 Z" fill="#d4622a" />
      <path d="M 54 56 L 32 22 C 31 19, 36 18, 40 22 L 66 48 Z" fill="#fce0c8" />
      <path d="M 150 62 L 178 15 C 180 10, 170 8, 164 14 L 128 50 Z" fill="#d4622a" />
      <path d="M 146 56 L 168 22 C 169 19, 164 18, 160 22 L 134 48 Z" fill="#fce0c8" />
      <path d="M 68 92 L 88 88" fill="none" stroke="#2e1a0e" strokeWidth="4" strokeLinecap="round" />
      <path d="M 132 92 L 112 88" fill="none" stroke="#2e1a0e" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="105" r="8" fill="#e76f8e" opacity="0.55" />
      <circle cx="140" cy="105" r="8" fill="#e76f8e" opacity="0.55" />
      <ellipse cx="100" cy="98" rx="6" ry="4" fill="#2e1a0e" />
      <path d="M 94 104 Q 100 112 100 104 Q 100 112 106 104" fill="none" stroke="#2e1a0e" strokeWidth="3" strokeLinecap="round" />
      <path d="M 145 155 Q 170 130, 175 110 Q 180 95, 170 85 Q 165 90, 168 100 Q 170 115, 148 140" fill="#d4622a" />
      <path d="M 170 85 Q 168 92, 171 100 Q 173 108, 165 115" fill="#fff5e6" />
    </svg>
  );
}

function DragonMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="72" ry="10" fill="rgba(45, 32, 11, 0.15)" />
      <path d="M 55 140 C 50 112, 150 112, 145 140 L 158 200 L 42 200 Z" fill="#c4841e" />
      <path d="M 72 148 C 82 140, 118 140, 128 148 L 132 200 L 68 200 Z" fill="#fae5b4" />
      <ellipse cx="100" cy="90" rx="55" ry="48" fill="#c4841e" />
      <path d="M 60 55 L 38 18 C 36 12, 42 10, 48 16 L 70 48 Z" fill="#8b560a" />
      <path d="M 140 55 L 162 18 C 164 12, 158 10, 152 16 L 130 48 Z" fill="#8b560a" />
      <ellipse cx="100" cy="108" rx="28" ry="18" fill="#fae5b4" />
      <path d="M 55 72 Q 65 65 75 72" fill="none" stroke="#a86c12" strokeWidth="2" strokeLinecap="round" />
      <path d="M 125 72 Q 135 65 145 72" fill="none" stroke="#a86c12" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="72" cy="88" rx="8" ry="7" fill="#fef9ed" />
      <circle cx="74" cy="88" r="4" fill="#8b560a" />
      <circle cx="73" cy="87" r="1.5" fill="#ffffff" />
      <ellipse cx="128" cy="88" rx="8" ry="7" fill="#fef9ed" />
      <circle cx="126" cy="88" r="4" fill="#8b560a" />
      <circle cx="127" cy="87" r="1.5" fill="#ffffff" />
      <circle cx="92" cy="104" r="3" fill="#a86c12" />
      <circle cx="108" cy="104" r="3" fill="#a86c12" />
      <path d="M 86 115 Q 100 125 114 115" fill="none" stroke="#8b560a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 56 95 Q 45 90 38 92" fill="none" stroke="#e8b84a" strokeWidth="2" strokeLinecap="round" />
      <path d="M 56 102 Q 42 102 36 105" fill="none" stroke="#e8b84a" strokeWidth="2" strokeLinecap="round" />
      <path d="M 144 95 Q 155 90 162 92" fill="none" stroke="#e8b84a" strokeWidth="2" strokeLinecap="round" />
      <path d="M 144 102 Q 158 102 164 105" fill="none" stroke="#e8b84a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="100" cy="62" r="8" fill="#f3be32" opacity="0.9" />
      <circle cx="98" cy="60" r="3" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

function DeerMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="68" ry="10" fill="rgba(28, 37, 15, 0.12)" />
      <path d="M 55 140 C 52 115, 148 115, 145 140 L 155 200 L 45 200 Z" fill="#b89060" />
      <circle cx="70" cy="158" r="5" fill="#ffffff" opacity="0.5" />
      <circle cx="90" cy="152" r="4" fill="#ffffff" opacity="0.4" />
      <circle cx="120" cy="155" r="5" fill="#ffffff" opacity="0.5" />
      <circle cx="105" cy="165" r="4" fill="#ffffff" opacity="0.4" />
      <ellipse cx="100" cy="95" rx="50" ry="42" fill="#b89060" />
      <ellipse cx="100" cy="108" rx="22" ry="14" fill="#f5f0e6" />
      <path d="M 62 58 L 48 25 M 48 25 L 38 18 M 48 25 L 55 15 M 48 25 L 42 30" fill="none" stroke="#7a5c3a" strokeWidth="3" strokeLinecap="round" />
      <path d="M 138 58 L 152 25 M 152 25 L 162 18 M 152 25 L 145 15 M 152 25 L 158 30" fill="none" stroke="#7a5c3a" strokeWidth="3" strokeLinecap="round" />
      <path d="M 52 72 C 40 62, 38 52, 48 48 C 54 50, 58 58, 58 68 Z" fill="#b89060" />
      <path d="M 54 68 C 46 62, 45 55, 50 52 C 54 54, 56 60, 56 66 Z" fill="#dab090" />
      <path d="M 148 72 C 160 62, 162 52, 152 48 C 146 50, 142 58, 142 68 Z" fill="#b89060" />
      <path d="M 146 68 C 154 62, 155 55, 150 52 C 146 54, 144 60, 144 66 Z" fill="#dab090" />
      <circle cx="78" cy="92" r="6" fill="#1c250f" />
      <circle cx="76.5" cy="90" r="2.2" fill="#ffffff" />
      <circle cx="122" cy="92" r="6" fill="#1c250f" />
      <circle cx="120.5" cy="90" r="2.2" fill="#ffffff" />
      <circle cx="64" cy="104" r="7" fill="#e76f8e" opacity="0.5" />
      <circle cx="136" cy="104" r="7" fill="#e76f8e" opacity="0.5" />
      <ellipse cx="100" cy="102" rx="5" ry="3.5" fill="#1c250f" />
      <path d="M 95 108 Q 100 114 100 108 Q 100 114 105 108" fill="none" stroke="#1c250f" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function KoiMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="70" ry="10" fill="rgba(17, 32, 46, 0.12)" />
      <path d="M 55 175 Q 70 160 85 175 Q 100 160 115 175 Q 130 160 145 175" fill="none" stroke="#92b5e2" strokeWidth="2" opacity="0.4" />
      <ellipse cx="100" cy="105" rx="60" ry="42" fill="#ffffff" stroke="#d4e2f6" strokeWidth="2" />
      <path d="M 55 85 C 65 75, 85 78, 90 95 C 95 105, 80 115, 65 110 C 50 105, 48 92, 55 85 Z" fill="#e8824a" opacity="0.9" />
      <path d="M 120 80 C 140 72, 155 85, 145 100 C 138 112, 125 105, 120 95 Z" fill="#e8824a" opacity="0.8" />
      <path d="M 32 100 C 15 80, 10 115, 25 120 C 18 108, 20 90, 32 100 Z" fill="#ffffff" stroke="#d4e2f6" strokeWidth="1.5" />
      <path d="M 80 65 Q 90 52 100 62" fill="none" stroke="#4478b6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 75 138 C 80 148, 95 150, 100 142" fill="none" stroke="#92b5e2" strokeWidth="2" />
      <circle cx="140" cy="98" r="7" fill="#ffffff" stroke="#11202e" strokeWidth="1.5" />
      <circle cx="142" cy="98" r="4" fill="#11202e" />
      <circle cx="141" cy="96" r="1.5" fill="#ffffff" />
      <circle cx="148" cy="110" r="5" fill="#e76f8e" opacity="0.5" />
      <path d="M 155 102 Q 162 108 155 110" fill="none" stroke="#11202e" strokeWidth="2" strokeLinecap="round" />
      <path d="M 158 98 Q 172 92 178 88" fill="none" stroke="#92b5e2" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 158 105 Q 175 106 182 108" fill="none" stroke="#92b5e2" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function OwlMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="68" ry="10" fill="rgba(36, 26, 15, 0.12)" />
      <path d="M 50 135 C 45 108, 155 108, 150 135 L 160 200 L 40 200 Z" fill="#8b6934" />
      <path d="M 68 148 C 78 140, 122 140, 132 148 L 135 200 L 65 200 Z" fill="#e8d7c0" />
      <path d="M 78 160 Q 100 155 122 160" fill="none" stroke="#c4a67a" strokeWidth="1.5" />
      <path d="M 75 170 Q 100 165 125 170" fill="none" stroke="#c4a67a" strokeWidth="1.5" />
      <ellipse cx="100" cy="88" rx="58" ry="48" fill="#8b6934" />
      <path d="M 48 55 L 30 20 C 28 15, 38 14, 42 20 L 62 48 Z" fill="#8b6934" />
      <path d="M 50 50 L 38 28 C 37 25, 42 24, 45 28 L 58 46 Z" fill="#c4a67a" />
      <path d="M 152 55 L 170 20 C 172 15, 162 14, 158 20 L 138 48 Z" fill="#8b6934" />
      <path d="M 150 50 L 162 28 C 163 25, 158 24, 155 28 L 142 46 Z" fill="#c4a67a" />
      <path d="M 48 95 C 50 120, 70 132, 100 132 C 130 132, 150 120, 152 95 C 142 78, 120 75, 100 75 C 80 75, 58 78, 48 95 Z" fill="#e8d7c0" />
      <circle cx="75" cy="95" r="16" fill="#fef9ed" stroke="#5d431c" strokeWidth="2" />
      <circle cx="75" cy="95" r="8" fill="#241a0f" />
      <circle cx="72" cy="92" r="3" fill="#ffffff" />
      <circle cx="125" cy="95" r="16" fill="#fef9ed" stroke="#5d431c" strokeWidth="2" />
      <circle cx="125" cy="95" r="8" fill="#241a0f" />
      <circle cx="122" cy="92" r="3" fill="#ffffff" />
      <path d="M 95 108 L 100 118 L 105 108 Z" fill="#e8a13a" />
      <circle cx="58" cy="108" r="6" fill="#e76f8e" opacity="0.5" />
      <circle cx="142" cy="108" r="6" fill="#e76f8e" opacity="0.5" />
    </svg>
  );
}

function TurtleMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="72" ry="10" fill="rgba(14, 36, 21, 0.12)" />
      <ellipse cx="100" cy="130" rx="65" ry="42" fill="#3a9255" />
      <ellipse cx="100" cy="128" rx="58" ry="36" fill="#2d7a45" />
      <path d="M 100 92 L 100 164" fill="none" stroke="#226237" strokeWidth="2" />
      <path d="M 55 128 L 145 128" fill="none" stroke="#226237" strokeWidth="2" />
      <path d="M 66 105 L 134 151" fill="none" stroke="#226237" strokeWidth="1.5" />
      <path d="M 134 105 L 66 151" fill="none" stroke="#226237" strokeWidth="1.5" />
      <circle cx="100" cy="128" r="12" fill="#f3be32" opacity="0.4" />
      <ellipse cx="100" cy="130" rx="65" ry="42" fill="none" stroke="#82c492" strokeWidth="2" />
      <ellipse cx="45" cy="155" rx="14" ry="10" fill="#3a9255" transform="rotate(-20, 45, 155)" />
      <ellipse cx="155" cy="155" rx="14" ry="10" fill="#3a9255" transform="rotate(20, 155, 155)" />
      <ellipse cx="50" cy="115" rx="12" ry="8" fill="#3a9255" transform="rotate(-15, 50, 115)" />
      <ellipse cx="150" cy="115" rx="12" ry="8" fill="#3a9255" transform="rotate(15, 150, 115)" />
      <ellipse cx="100" cy="80" rx="28" ry="24" fill="#3a9255" />
      <circle cx="88" cy="76" r="5" fill="#0e2415" />
      <circle cx="87" cy="74.5" r="1.8" fill="#ffffff" />
      <circle cx="112" cy="76" r="5" fill="#0e2415" />
      <circle cx="111" cy="74.5" r="1.8" fill="#ffffff" />
      <circle cx="80" cy="86" r="6" fill="#e76f8e" opacity="0.5" />
      <circle cx="120" cy="86" r="6" fill="#e76f8e" opacity="0.5" />
      <path d="M 94 88 Q 100 94 106 88" fill="none" stroke="#0e2415" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 160 145 Q 172 148 175 142" fill="none" stroke="#3a9255" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function ButterflyMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="65" ry="9" fill="rgba(37, 20, 40, 0.1)" />
      <path d="M 100 95 C 60 40, 15 55, 30 95 C 40 115, 70 118, 100 105 Z" fill="#a260b0" opacity="0.85" />
      <path d="M 100 95 C 140 40, 185 55, 170 95 C 160 115, 130 118, 100 105 Z" fill="#a260b0" opacity="0.85" />
      <path d="M 100 105 C 55 115, 40 150, 60 165 C 75 175, 90 155, 100 130 Z" fill="#d1a4d9" opacity="0.8" />
      <path d="M 100 105 C 145 115, 160 150, 140 165 C 125 175, 110 155, 100 130 Z" fill="#d1a4d9" opacity="0.8" />
      <circle cx="62" cy="80" r="12" fill="#ffffff" opacity="0.3" />
      <circle cx="138" cy="80" r="12" fill="#ffffff" opacity="0.3" />
      <circle cx="65" cy="140" r="8" fill="#ffffff" opacity="0.25" />
      <circle cx="135" cy="140" r="8" fill="#ffffff" opacity="0.25" />
      <ellipse cx="100" cy="115" rx="8" ry="30" fill="#723882" />
      <circle cx="100" cy="78" r="15" fill="#723882" />
      <path d="M 92 66 Q 80 45 75 38" fill="none" stroke="#723882" strokeWidth="2" strokeLinecap="round" />
      <circle cx="75" cy="38" r="3" fill="#d1a4d9" />
      <path d="M 108 66 Q 120 45 125 38" fill="none" stroke="#723882" strokeWidth="2" strokeLinecap="round" />
      <circle cx="125" cy="38" r="3" fill="#d1a4d9" />
      <circle cx="94" cy="76" r="4" fill="#ffffff" />
      <circle cx="94" cy="76" r="2" fill="#251428" />
      <circle cx="106" cy="76" r="4" fill="#ffffff" />
      <circle cx="106" cy="76" r="2" fill="#251428" />
      <circle cx="88" cy="84" r="4" fill="#e76f8e" opacity="0.6" />
      <circle cx="112" cy="84" r="4" fill="#e76f8e" opacity="0.6" />
      <path d="M 96 84 Q 100 88 104 84" fill="none" stroke="#251428" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CraneMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="65" ry="9" fill="rgba(38, 24, 18, 0.1)" />
      <ellipse cx="100" cy="135" rx="48" ry="35" fill="#ffffff" stroke="#dca890" strokeWidth="1.5" />
      <path d="M 52 125 C 40 110, 35 135, 50 155 C 60 165, 70 155, 65 140 Z" fill="#f2e7e1" stroke="#dca890" strokeWidth="1" />
      <path d="M 148 125 C 160 110, 165 135, 150 155 C 140 165, 130 155, 135 140 Z" fill="#f2e7e1" stroke="#dca890" strokeWidth="1" />
      <path d="M 55 165 Q 40 180 35 190" fill="none" stroke="#261812" strokeWidth="3" strokeLinecap="round" />
      <path d="M 60 168 Q 48 185 45 192" fill="none" stroke="#57403a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 95 100 Q 96 75 98 60" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
      <path d="M 105 100 Q 104 75 102 60" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
      <circle cx="100" cy="50" r="20" fill="#ffffff" />
      <circle cx="100" cy="35" r="7" fill="#cf3c3c" />
      <path d="M 115 50 L 140 46 L 115 54 Z" fill="#e8a13a" />
      <circle cx="108" cy="48" r="3.5" fill="#261812" />
      <circle cx="107" cy="47" r="1.2" fill="#ffffff" />
      <circle cx="106" cy="56" r="4" fill="#e76f8e" opacity="0.5" />
      <path d="M 88 168 L 85 192 M 85 192 L 78 195 M 85 192 L 92 195" fill="none" stroke="#907870" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 112 168 L 115 192 M 115 192 L 108 195 M 115 192 L 122 195" fill="none" stroke="#907870" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function NagaMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="68" ry="10" fill="rgba(16, 37, 16, 0.12)" />
      <path d="M 120 185 Q 160 175 165 150 Q 170 125 140 115 Q 110 108 80 118 Q 50 128 50 148 Q 50 170 80 175 Q 100 178 110 170" fill="none" stroke="#4a9738" strokeWidth="16" strokeLinecap="round" />
      <path d="M 120 185 Q 155 175 162 152 Q 168 130 142 118 Q 115 110 85 120 Q 58 130 56 148 Q 55 165 78 172" fill="none" stroke="#8ec87a" strokeWidth="6" strokeLinecap="round" />
      <path d="M 148 130 Q 155 135 148 140" fill="none" stroke="#2c6622" strokeWidth="1.5" opacity="0.5" />
      <path d="M 95 115 Q 102 120 95 125" fill="none" stroke="#2c6622" strokeWidth="1.5" opacity="0.5" />
      <path d="M 85 100 C 65 70, 75 40, 100 35 C 125 30, 140 55, 130 85 C 125 100, 115 110, 100 112 C 90 112, 82 108, 85 100 Z" fill="#4a9738" />
      <path d="M 88 95 C 72 70, 82 48, 100 44 C 118 40, 132 58, 126 82 C 122 95, 115 105, 100 107 Z" fill="#8ec87a" opacity="0.5" />
      <path d="M 92 40 L 100 28 L 108 40" fill="none" stroke="#f3be32" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="100" cy="42" r="5" fill="#f3be32" />
      <circle cx="99" cy="41" r="2" fill="#ffffff" opacity="0.5" />
      <circle cx="88" cy="70" r="5" fill="#fef9ed" />
      <circle cx="89" cy="70" r="3" fill="#102510" />
      <circle cx="88" cy="69" r="1.2" fill="#ffffff" />
      <circle cx="112" cy="70" r="5" fill="#fef9ed" />
      <circle cx="111" cy="70" r="3" fill="#102510" />
      <circle cx="112" cy="69" r="1.2" fill="#ffffff" />
      <circle cx="82" cy="80" r="5" fill="#e76f8e" opacity="0.5" />
      <circle cx="118" cy="80" r="5" fill="#e76f8e" opacity="0.5" />
      <path d="M 94 85 Q 100 90 106 85" fill="none" stroke="#102510" strokeWidth="2" strokeLinecap="round" />
      <path d="M 99 88 Q 96 96 98 100 M 101 88 Q 104 96 102 100" fill="none" stroke="#cf3c3c" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TigerMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="72" ry="10" fill="rgba(42, 28, 8, 0.15)" />
      <path d="M 55 140 C 50 112, 150 112, 145 140 L 158 200 L 42 200 Z" fill="#c87820" />
      <path d="M 70 150 C 80 142, 120 142, 130 150 L 135 200 L 65 200 Z" fill="#fff5e6" />
      <path d="M 58 145 Q 65 138 72 148" fill="none" stroke="#2a1c08" strokeWidth="3" strokeLinecap="round" />
      <path d="M 128 148 Q 135 138 142 145" fill="none" stroke="#2a1c08" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="100" cy="88" rx="58" ry="48" fill="#c87820" />
      <path d="M 48 98 C 52 120, 72 135, 100 135 C 128 135, 148 120, 152 98 C 140 85, 120 82, 100 82 C 80 82, 60 85, 48 98 Z" fill="#fff5e6" />
      <path d="M 48 58 L 32 28 C 30 24, 38 22, 44 26 L 66 50 Z" fill="#c87820" />
      <path d="M 50 54 L 38 32 C 37 30, 42 29, 46 32 L 62 48 Z" fill="#fae0bb" />
      <path d="M 152 58 L 168 28 C 170 24, 162 22, 156 26 L 134 50 Z" fill="#c87820" />
      <path d="M 150 54 L 162 32 C 163 30, 158 29, 154 32 L 138 48 Z" fill="#fae0bb" />
      <path d="M 82 60 Q 88 52 94 60" fill="none" stroke="#2a1c08" strokeWidth="3" strokeLinecap="round" />
      <path d="M 106 60 Q 112 52 118 60" fill="none" stroke="#2a1c08" strokeWidth="3" strokeLinecap="round" />
      <path d="M 94 55 Q 100 48 106 55" fill="none" stroke="#2a1c08" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 48 82 Q 55 78 60 85" fill="none" stroke="#2a1c08" strokeWidth="2" strokeLinecap="round" />
      <path d="M 50 90 Q 56 86 62 92" fill="none" stroke="#2a1c08" strokeWidth="2" strokeLinecap="round" />
      <path d="M 152 82 Q 145 78 140 85" fill="none" stroke="#2a1c08" strokeWidth="2" strokeLinecap="round" />
      <path d="M 150 90 Q 144 86 138 92" fill="none" stroke="#2a1c08" strokeWidth="2" strokeLinecap="round" />
      <circle cx="76" cy="92" r="6" fill="#2a1c08" />
      <circle cx="74.5" cy="90" r="2.2" fill="#ffffff" />
      <circle cx="124" cy="92" r="6" fill="#2a1c08" />
      <circle cx="122.5" cy="90" r="2.2" fill="#ffffff" />
      <circle cx="60" cy="105" r="8" fill="#e76f8e" opacity="0.55" />
      <circle cx="140" cy="105" r="8" fill="#e76f8e" opacity="0.55" />
      <ellipse cx="100" cy="100" rx="7" ry="4.5" fill="#2a1c08" />
      <path d="M 93 107 Q 100 115 100 107 Q 100 115 107 107" fill="none" stroke="#2a1c08" strokeWidth="3" strokeLinecap="round" />
      <line x1="48" y1="100" x2="65" y2="100" stroke="#2a1c08" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="108" x2="64" y2="110" stroke="#2a1c08" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="152" y1="100" x2="135" y2="100" stroke="#2a1c08" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="150" y1="108" x2="136" y2="110" stroke="#2a1c08" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* =============== THAI DESIGN MASCOTS =============== */

function SuvarnabhumiMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="70" ry="10" fill="rgba(212, 175, 55, 0.15)" />
      {/* Temple Base */}
      <path d="M 40 185 L 55 120 L 145 120 L 160 185 Z" fill="#d4af37" opacity="0.85" />
      <path d="M 50 185 L 60 130 L 140 130 L 150 185 Z" fill="#f4d068" opacity="0.7" />
      {/* Steps */}
      <path d="M 55 155 L 60 140 L 140 140 L 145 155 Z" fill="#aa882c" opacity="0.5" />
      <path d="M 58 170 L 62 155 L 138 155 L 142 170 Z" fill="#aa882c" opacity="0.35" />
      {/* Main Spire */}
      <path d="M 85 120 L 100 25 L 115 120 Z" fill="#d4af37" />
      <path d="M 90 120 L 100 40 L 110 120 Z" fill="#f4d068" opacity="0.8" />
      {/* Spire Crown */}
      <circle cx="100" cy="25" r="5" fill="#f4d068" stroke="#aa882c" strokeWidth="1" />
      <path d="M 100 20 L 98 12 L 100 8 L 102 12 Z" fill="#d4af37" />
      {/* Side Spires */}
      <path d="M 60 120 L 70 65 L 80 120 Z" fill="#aa882c" opacity="0.7" />
      <path d="M 120 120 L 130 65 L 140 120 Z" fill="#aa882c" opacity="0.7" />
      {/* Decorative Lines */}
      <path d="M 65 100 L 70 75" fill="none" stroke="#f4d068" strokeWidth="1" opacity="0.6" />
      <path d="M 135 100 L 130 75" fill="none" stroke="#f4d068" strokeWidth="1" opacity="0.6" />
      {/* Golden Orb */}
      <circle cx="100" cy="85" r="8" fill="#f4d068" opacity="0.5" />
      <circle cx="100" cy="85" r="4" fill="#d4af37" opacity="0.8" />
      {/* Stars around spire */}
      <circle cx="75" cy="50" r="2" fill="#f4d068" opacity="0.4" />
      <circle cx="125" cy="55" r="1.5" fill="#f4d068" opacity="0.3" />
      <circle cx="85" cy="38" r="1" fill="#f4d068" opacity="0.5" />
    </svg>
  );
}

function AyutthayaMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="72" ry="10" fill="rgba(224, 122, 95, 0.12)" />
      {/* Ancient Ruins Base */}
      <rect x="30" y="150" width="140" height="35" fill="#e07a5f" opacity="0.3" rx="2" />
      <rect x="35" y="155" width="130" height="25" fill="#f4f1de" opacity="0.4" rx="1" />
      {/* Columns */}
      <rect x="45" y="75" width="12" height="75" fill="#e07a5f" opacity="0.7" rx="2" />
      <rect x="48" y="78" width="6" height="69" fill="#f2cc8f" opacity="0.5" rx="1" />
      <rect x="75" y="55" width="12" height="95" fill="#e07a5f" opacity="0.8" rx="2" />
      <rect x="78" y="58" width="6" height="89" fill="#f2cc8f" opacity="0.5" rx="1" />
      <rect x="113" y="55" width="12" height="95" fill="#e07a5f" opacity="0.8" rx="2" />
      <rect x="116" y="58" width="6" height="89" fill="#f2cc8f" opacity="0.5" rx="1" />
      <rect x="143" y="75" width="12" height="75" fill="#e07a5f" opacity="0.7" rx="2" />
      <rect x="146" y="78" width="6" height="69" fill="#f2cc8f" opacity="0.5" rx="1" />
      {/* Broken column top */}
      <path d="M 45 75 L 42 70 L 57 70 L 58 75 Z" fill="#e07a5f" opacity="0.6" />
      <path d="M 143 75 L 140 68 L 155 72 L 156 75 Z" fill="#e07a5f" opacity="0.5" />
      {/* Pediment / Lintel */}
      <path d="M 70 55 L 100 32 L 130 55 Z" fill="#e07a5f" opacity="0.6" />
      <path d="M 78 55 L 100 38 L 122 55 Z" fill="#f4f1de" opacity="0.3" />
      {/* Green vine accents */}
      <path d="M 58 90 Q 64 85 68 92 Q 72 98 66 102" fill="none" stroke="#81b29a" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M 140 88 Q 136 82 130 86" fill="none" stroke="#81b29a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Leaf */}
      <ellipse cx="68" cy="103" rx="4" ry="2.5" fill="#81b29a" opacity="0.4" transform="rotate(-20, 68, 103)" />
      {/* Small Buddha silhouette */}
      <circle cx="100" cy="115" r="6" fill="#3d405b" opacity="0.25" />
      <path d="M 94 121 L 106 121 L 106 135 L 94 135 Z" fill="#3d405b" opacity="0.2" rx="2" />
    </svg>
  );
}

function BangkokMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="68" ry="10" fill="rgba(0, 240, 255, 0.1)" />
      {/* City Base */}
      <rect x="30" y="160" width="140" height="25" fill="#1f2937" opacity="0.8" rx="2" />
      {/* Skyscraper Towers */}
      <rect x="38" y="80" width="18" height="80" fill="#111827" stroke="#00f0ff" strokeWidth="0.5" opacity="0.9" rx="1" />
      <rect x="40" y="85" width="4" height="6" fill="#00f0ff" opacity="0.4" rx="0.5" />
      <rect x="48" y="90" width="4" height="6" fill="#00f0ff" opacity="0.3" rx="0.5" />
      <rect x="40" y="100" width="4" height="6" fill="#7000ff" opacity="0.4" rx="0.5" />
      <rect x="48" y="105" width="4" height="6" fill="#00f0ff" opacity="0.3" rx="0.5" />
      <rect x="62" y="55" width="22" height="105" fill="#111827" stroke="#00f0ff" strokeWidth="0.5" opacity="0.9" rx="1" />
      <rect x="65" y="60" width="5" height="5" fill="#00f0ff" opacity="0.5" rx="0.5" />
      <rect x="74" y="60" width="5" height="5" fill="#f43f5e" opacity="0.4" rx="0.5" />
      <rect x="65" y="72" width="5" height="5" fill="#7000ff" opacity="0.4" rx="0.5" />
      <rect x="74" y="72" width="5" height="5" fill="#00f0ff" opacity="0.3" rx="0.5" />
      <rect x="65" y="84" width="5" height="5" fill="#00f0ff" opacity="0.4" rx="0.5" />
      <rect x="74" y="84" width="5" height="5" fill="#f43f5e" opacity="0.3" rx="0.5" />
      {/* Main Tower (tallest) */}
      <rect x="90" y="35" width="20" height="125" fill="#111827" stroke="#00f0ff" strokeWidth="0.8" opacity="0.95" rx="1" />
      <path d="M 95 35 L 100 22 L 105 35" fill="#00f0ff" opacity="0.6" />
      <circle cx="100" cy="22" r="3" fill="#00f0ff" opacity="0.5" />
      <rect x="93" y="42" width="4" height="4" fill="#00f0ff" opacity="0.6" rx="0.5" />
      <rect x="103" y="42" width="4" height="4" fill="#7000ff" opacity="0.5" rx="0.5" />
      <rect x="93" y="52" width="4" height="4" fill="#f43f5e" opacity="0.4" rx="0.5" />
      <rect x="103" y="52" width="4" height="4" fill="#00f0ff" opacity="0.4" rx="0.5" />
      <rect x="93" y="62" width="4" height="4" fill="#00f0ff" opacity="0.5" rx="0.5" />
      <rect x="103" y="62" width="4" height="4" fill="#f43f5e" opacity="0.3" rx="0.5" />
      {/* Right Towers */}
      <rect x="116" y="65" width="18" height="95" fill="#111827" stroke="#7000ff" strokeWidth="0.5" opacity="0.85" rx="1" />
      <rect x="119" y="70" width="4" height="5" fill="#7000ff" opacity="0.4" rx="0.5" />
      <rect x="127" y="75" width="4" height="5" fill="#00f0ff" opacity="0.3" rx="0.5" />
      <rect x="140" y="90" width="16" height="70" fill="#111827" stroke="#f43f5e" strokeWidth="0.5" opacity="0.8" rx="1" />
      <rect x="143" y="95" width="4" height="5" fill="#f43f5e" opacity="0.4" rx="0.5" />
      {/* Neon glow lines */}
      <line x1="30" y1="158" x2="170" y2="158" stroke="#00f0ff" strokeWidth="1" opacity="0.4" />
      <line x1="35" y1="162" x2="165" y2="162" stroke="#7000ff" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

function CyberSiamMascot() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <ellipse cx="100" cy="185" rx="65" ry="10" fill="rgba(0, 255, 204, 0.08)" />
      {/* Holographic Pyramid */}
      <path d="M 100 25 L 155 155 L 45 155 Z" fill="none" stroke="#00ffcc" strokeWidth="1.5" opacity="0.6" />
      <path d="M 100 25 L 155 155 L 45 155 Z" fill="#00ffcc" opacity="0.04" />
      {/* Inner pyramid */}
      <path d="M 100 50 L 140 140 L 60 140 Z" fill="none" stroke="#00ffcc" strokeWidth="0.8" opacity="0.3" />
      {/* Cross lines */}
      <path d="M 100 25 L 100 155" fill="none" stroke="#00ffcc" strokeWidth="0.5" opacity="0.2" />
      <path d="M 45 155 L 128 90 M 155 155 L 72 90" fill="none" stroke="#00ffcc" strokeWidth="0.4" opacity="0.15" />
      {/* Central Eye / Core */}
      <circle cx="100" cy="100" r="18" fill="none" stroke="#00ffcc" strokeWidth="1.2" opacity="0.5" />
      <circle cx="100" cy="100" r="10" fill="none" stroke="#ff007f" strokeWidth="0.8" opacity="0.4" />
      <circle cx="100" cy="100" r="4" fill="#00ffcc" opacity="0.6" />
      <circle cx="99" cy="99" r="1.5" fill="#ffffff" opacity="0.5" />
      {/* Orbital Rings */}
      <ellipse cx="100" cy="100" rx="30" ry="8" fill="none" stroke="#7928ca" strokeWidth="0.8" opacity="0.3" transform="rotate(25, 100, 100)" />
      <ellipse cx="100" cy="100" rx="30" ry="8" fill="none" stroke="#ff007f" strokeWidth="0.6" opacity="0.2" transform="rotate(-25, 100, 100)" />
      {/* Data Points */}
      <circle cx="72" cy="92" r="2.5" fill="#ff007f" opacity="0.5" />
      <circle cx="128" cy="108" r="2.5" fill="#00ffcc" opacity="0.5" />
      <circle cx="85" cy="130" r="2" fill="#7928ca" opacity="0.4" />
      <circle cx="115" cy="70" r="2" fill="#39ff14" opacity="0.4" />
      {/* Circuit traces from center */}
      <path d="M 118 100 L 135 100 L 140 90" fill="none" stroke="#00ffcc" strokeWidth="0.8" opacity="0.3" />
      <path d="M 82 100 L 65 100 L 60 110" fill="none" stroke="#ff007f" strokeWidth="0.8" opacity="0.3" />
      <path d="M 100 118 L 100 135 L 110 145" fill="none" stroke="#7928ca" strokeWidth="0.8" opacity="0.3" />
      {/* Corner anchor nodes */}
      <rect x="138" y="88" width="4" height="4" fill="#00ffcc" opacity="0.3" rx="1" />
      <rect x="58" y="108" width="4" height="4" fill="#ff007f" opacity="0.3" rx="1" />
      <rect x="108" y="143" width="4" height="4" fill="#7928ca" opacity="0.3" rx="1" />
    </svg>
  );
}
