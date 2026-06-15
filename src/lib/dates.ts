// Small date helpers. The almanac works on the user's LOCAL calendar day.

import type { Lang } from "../data/ko";

const DAYS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** ISO "YYYY-MM-DD" in local time (not UTC) so the day flips at local midnight. */
export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "samedi 14 juin" */
export function dateLabelFr(d: Date): string {
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

/** "Saturday 14 June" */
export function dateLabelEn(d: Date): string {
  return `${DAYS_EN[d.getDay()]} ${d.getDate()} ${MONTHS_EN[d.getMonth()]}`;
}

/** lang-aware short date label */
export function dateLabel(d: Date, lang: Lang): string {
  return lang === "en" ? dateLabelEn(d) : dateLabelFr(d);
}

/** "14 juin 2026" */
export function fullDateFr(d: Date): string {
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

/** "14 June 2026" */
export function fullDateEn(d: Date): string {
  return `${d.getDate()} ${MONTHS_EN[d.getMonth()]} ${d.getFullYear()}`;
}

/** lang-aware full date */
export function fullDate(d: Date, lang: Lang): string {
  return lang === "en" ? fullDateEn(d) : fullDateFr(d);
}

/** day-of-year, 1..366 — used as a stable seed for offline word selection. */
export function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}
