// Local moon-phase math — no network. Computes the Moon's age, illuminated
// fraction, and phase name for a given date, using a compact astronomical
// approximation good to ~a few hours, which is ample for a daily almanac.
//
// Method: compute the Julian Day, then the Moon's age in days since the last
// new moon via the mean synodic relationship anchored at a known new moon
// (2000-01-06 18:14 UTC, JD 2451550.1). Illumination ≈ (1 − cos(phase angle))/2.

const SYNODIC = 29.530588853; // mean synodic month, days
const KNOWN_NEW_MOON_JD = 2451550.1; // 2000-01-06 18:14 UTC

export type PhaseKey =
  | "nouvelle"
  | "premier-croissant"
  | "premier-quartier"
  | "gibbeuse-croissante"
  | "pleine"
  | "gibbeuse-decroissante"
  | "dernier-quartier"
  | "dernier-croissant";

export interface MoonInfo {
  /** age in days since last new moon, 0..29.53 */
  age: number;
  /** 0..1 illuminated fraction of the disc */
  illumination: number;
  /** 0..1 around the cycle (0 = new, 0.5 = full) */
  phaseFraction: number;
  phase: PhaseKey;
  /** French phase name */
  nameFr: string;
  /** English phase name */
  nameEn: string;
  /** true while waxing (illumination growing) */
  waxing: boolean;
}

function toJulianDay(date: Date): number {
  // Use UTC to keep the anchor consistent.
  const Y = date.getUTCFullYear();
  const M = date.getUTCMonth() + 1;
  const D =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;
  let y = Y;
  let m = M;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    D +
    B -
    1524.5
  );
}

const PHASE_NAMES: Record<PhaseKey, string> = {
  nouvelle: "nouvelle lune",
  "premier-croissant": "premier croissant",
  "premier-quartier": "premier quartier",
  "gibbeuse-croissante": "lune gibbeuse croissante",
  pleine: "pleine lune",
  "gibbeuse-decroissante": "lune gibbeuse décroissante",
  "dernier-quartier": "dernier quartier",
  "dernier-croissant": "dernier croissant",
};

const PHASE_NAMES_EN: Record<PhaseKey, string> = {
  nouvelle: "new moon",
  "premier-croissant": "waxing crescent",
  "premier-quartier": "first quarter",
  "gibbeuse-croissante": "waxing gibbous",
  pleine: "full moon",
  "gibbeuse-decroissante": "waning gibbous",
  "dernier-quartier": "last quarter",
  "dernier-croissant": "waning crescent",
};

export function moonName(phase: PhaseKey, lang: "fr" | "en"): string {
  return lang === "en" ? PHASE_NAMES_EN[phase] : PHASE_NAMES[phase];
}

function phaseFromFraction(f: number): PhaseKey {
  // f in [0,1): 0 new, .25 first quarter, .5 full, .75 last quarter.
  // Narrow windows for the four cardinal phases, wide for the in-betweens.
  const eps = 0.02;
  if (f < eps || f > 1 - eps) return "nouvelle";
  if (Math.abs(f - 0.25) < eps) return "premier-quartier";
  if (Math.abs(f - 0.5) < eps) return "pleine";
  if (Math.abs(f - 0.75) < eps) return "dernier-quartier";
  if (f < 0.25) return "premier-croissant";
  if (f < 0.5) return "gibbeuse-croissante";
  if (f < 0.75) return "gibbeuse-decroissante";
  return "dernier-croissant";
}

export function moonForDate(date: Date): MoonInfo {
  const jd = toJulianDay(date);
  const daysSince = jd - KNOWN_NEW_MOON_JD;
  let age = daysSince % SYNODIC;
  if (age < 0) age += SYNODIC;

  const phaseFraction = age / SYNODIC;
  // phase angle 0..2π; illumination of the lunar disc
  const angle = phaseFraction * 2 * Math.PI;
  const illumination = (1 - Math.cos(angle)) / 2;
  const waxing = phaseFraction < 0.5;
  const phase = phaseFromFraction(phaseFraction);

  return {
    age,
    illumination,
    phaseFraction,
    phase,
    nameFr: PHASE_NAMES[phase],
    nameEn: PHASE_NAMES_EN[phase],
    waxing,
  };
}

export function illuminationPercent(m: MoonInfo): number {
  return Math.round(m.illumination * 100);
}
