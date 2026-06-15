import { useMemo, useState } from "react";
import { KO, SEKKI, SEKKI_BY_ID, koDateRangeFr, sekkiForKo, SEASON_FR, type Ko } from "../data/ko";

// La roue de l'année — an SVG year-wheel. The 72 kō are arranged around a circle
// (one ring), grouped visually by their 24 sekki and four seasons. Today's kō is
// marked; tap any segment to read it. The wheel starts at risshun (~Feb 4) at the
// top and turns clockwise through the year.

interface Props {
  todayIndex: number;
  /** called when the user wants to peek at a kō (not navigate away) */
  onPick?: (ko: Ko) => void;
}

const SIZE = 520;
const C = SIZE / 2;
const R_OUTER = 244;
const R_INNER = 150;
const R_SEKKI_LABEL = 270;

// season tint per key (matches palettes, but as flat hexes for the wheel fills)
const SEASON_FILL: Record<string, string> = {
  printemps: "rgb(118 176 124 / 0.85)",
  ete: "rgb(214 168 78 / 0.85)",
  automne: "rgb(196 118 74 / 0.85)",
  hiver: "rgb(110 152 190 / 0.85)",
};

function polar(angleDeg: number, r: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

function segmentPath(startDeg: number, endDeg: number, rIn: number, rOut: number): string {
  const [x1, y1] = polar(startDeg, rOut);
  const [x2, y2] = polar(endDeg, rOut);
  const [x3, y3] = polar(endDeg, rIn);
  const [x4, y4] = polar(startDeg, rIn);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

export function YearWheel({ todayIndex, onPick }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [selected, setSelected] = useState<number>(todayIndex);

  const segs = useMemo(() => {
    const per = 360 / 72;
    return KO.map((ko, i) => {
      const start = i * per;
      const end = start + per;
      const sekki = sekkiForKo(ko);
      return { ko, start, end, mid: (start + end) / 2, season: sekki.season };
    });
  }, []);

  const active = hover ?? selected;
  const activeKo = KO[active - 1];
  const activeSekki = SEKKI_BY_ID[activeKo.sekkiId];

  // sekki tick angles (every 3 kō)
  const sekkiTicks = SEKKI.map((s, idx) => {
    const angle = idx * (360 / 24);
    return { sekki: s, angle };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-[520px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto select-none">
          {/* faint guide rings */}
          <circle cx={C} cy={C} r={R_OUTER} fill="none" stroke="rgb(var(--alm-line))" strokeWidth="1" />
          <circle cx={C} cy={C} r={R_INNER} fill="none" stroke="rgb(var(--alm-line))" strokeWidth="1" />

          {/* 72 kō segments */}
          {segs.map(({ ko, start, end, season }) => {
            const isToday = ko.index === todayIndex;
            const isActive = ko.index === active;
            const gap = 0.6;
            return (
              <path
                key={ko.index}
                d={segmentPath(start + gap, end - gap, R_INNER, R_OUTER)}
                fill={SEASON_FILL[season]}
                opacity={isActive ? 1 : isToday ? 0.95 : 0.42}
                stroke={isToday ? "rgb(var(--alm-ink))" : "transparent"}
                strokeWidth={isToday ? 2 : 0}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHover(ko.index)}
                onMouseLeave={() => setHover(null)}
                onClick={() => {
                  setSelected(ko.index);
                  onPick?.(ko);
                }}
              >
                <title>{`${ko.fr} — ${koDateRangeFr(ko)}`}</title>
              </path>
            );
          })}

          {/* sekki tick marks + short labels */}
          {sekkiTicks.map(({ sekki, angle }) => {
            const [x1, y1] = polar(angle, R_INNER - 4);
            const [x2, y2] = polar(angle, R_OUTER + 6);
            const [lx, ly] = polar(angle + 7.5, R_SEKKI_LABEL);
            return (
              <g key={sekki.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgb(var(--alm-ink) / 0.35)"
                  strokeWidth="1"
                />
                <text
                  x={lx}
                  y={ly}
                  fontSize="9.5"
                  fill="rgb(var(--alm-muted))"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="Inter, sans-serif"
                  letterSpacing="0.5"
                >
                  {sekki.fr}
                </text>
              </g>
            );
          })}

          {/* center — the active kō reading */}
          <text
            x={C}
            y={C - 30}
            fontSize="13"
            fill="rgb(var(--alm-accent))"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            letterSpacing="2"
          >
            {activeSekki.fr.toUpperCase()}
          </text>
          <text
            x={C}
            y={C - 2}
            fontSize="22"
            fill="rgb(var(--alm-ink))"
            textAnchor="middle"
            fontFamily="'Cormorant Garamond', serif"
            fontWeight="600"
          >
            {activeKo.kanji}
          </text>
          {/* wrap the FR name across lines */}
          {wrap(activeKo.fr, 22).map((ln, i) => (
            <text
              key={i}
              x={C}
              y={C + 26 + i * 18}
              fontSize="14"
              fill="rgb(var(--alm-ink))"
              textAnchor="middle"
              fontFamily="'Cormorant Garamond', serif"
            >
              {ln}
            </text>
          ))}
          <text
            x={C}
            y={C + 26 + wrap(activeKo.fr, 22).length * 18 + 4}
            fontSize="11"
            fill="rgb(var(--alm-muted))"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
          >
            {koDateRangeFr(activeKo)}
          </text>
        </svg>
      </div>

      <p className="text-center text-sm text-muted max-w-md font-sans">
        Survolez ou touchez un pétale pour lire son kō.{" "}
        <span className="text-accent">Aujourd'hui</span> est cerclé.
      </p>
    </div>
  );
}

// naive word-wrap for SVG text into <= maxChars lines
function wrap(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur.trim());
  return lines.slice(0, 3);
}

export { SEASON_FR };
