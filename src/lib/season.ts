// Season → palette mapping. The whole app re-tints around the season of the
// current kō by writing CSS variables onto :root. Spring greens → summer →
// autumn ochre → winter blue. Each palette keeps the same botanical, paper-calm
// character; only the hue drifts.

import type { SeasonKey } from "../data/ko";

export interface Palette {
  bg: string;
  surface: string;
  line: string;
  ink: string;
  muted: string;
  accent: string;
  accentSoft: string;
  gild: string;
}

// Values are "R G B" strings consumed by rgb(var(--alm-*) / a).
export const PALETTES: Record<SeasonKey, Palette> = {
  printemps: {
    bg: "243 246 238",
    surface: "252 253 248",
    line: "210 222 200",
    ink: "44 58 44",
    muted: "108 130 108",
    accent: "76 130 82",
    accentSoft: "150 188 150",
    gild: "203 160 74",
  },
  ete: {
    bg: "246 244 232",
    surface: "253 251 240",
    line: "224 216 188",
    ink: "58 54 38",
    muted: "130 120 88",
    accent: "199 138 48",
    accentSoft: "224 196 130",
    gild: "176 122 52",
  },
  automne: {
    bg: "245 238 228",
    surface: "251 245 235",
    line: "222 204 180",
    ink: "60 44 32",
    muted: "138 108 82",
    accent: "176 88 44",
    accentSoft: "214 168 122",
    gild: "166 116 52",
  },
  hiver: {
    bg: "235 240 245",
    surface: "247 250 252",
    line: "204 216 226",
    ink: "40 52 64",
    muted: "104 122 138",
    accent: "70 112 150",
    accentSoft: "158 188 212",
    gild: "150 138 110",
  },
};

export function applyPalette(season: SeasonKey): void {
  const p = PALETTES[season];
  const root = document.documentElement;
  root.style.setProperty("--alm-bg", p.bg);
  root.style.setProperty("--alm-surface", p.surface);
  root.style.setProperty("--alm-line", p.line);
  root.style.setProperty("--alm-ink", p.ink);
  root.style.setProperty("--alm-muted", p.muted);
  root.style.setProperty("--alm-accent", p.accent);
  root.style.setProperty("--alm-accent-soft", p.accentSoft);
  root.style.setProperty("--alm-gild", p.gild);
  root.dataset.season = season;
}

export const SEASON_GLYPH: Record<SeasonKey, string> = {
  printemps: "❀",
  ete: "☀",
  automne: "❧",
  hiver: "❄",
};
