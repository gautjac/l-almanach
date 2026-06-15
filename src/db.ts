import Dexie, { type Table } from "dexie";
import type { CardEvocation } from "./api";
import type { Lang } from "./data/ko";

// The full, render-ready daily card: the local kō / moon / phenology facts plus
// the (optional) AI evocation. We cache one per (ISO date × language) so the
// day's card is stable AND switching language loads/writes the right card —
// open the app twice in a day in the same language and it's the same card.
//
// The card stores BOTH French and English renderings of every local fact so a
// saved archive card displays correctly in either language; the AI evocation is
// language-specific (written in the language the card was fetched for).

export interface DailyCard {
  /** composite cache key "YYYY-MM-DD|lang" — one card per day per language */
  cacheKey: string;
  /** the language this card's AI evocation is written in */
  lang: Lang;
  /** ISO date "YYYY-MM-DD" */
  date: string;
  koIndex: number;
  /** kō name in French */
  koFr: string;
  /** kō name in English */
  koEn: string;
  koKanji: string;
  koRomaji: string;
  /** date-range label in French */
  koRangeFr: string;
  /** date-range label in English */
  koRangeEn: string;
  sekkiFr: string;
  sekkiEn: string;
  sekkiGlossFr: string;
  sekkiGlossEn: string;
  sekkiKanji: string;
  season: string;
  /** moon phase name in French */
  moonPhaseFr: string;
  /** moon phase name in English */
  moonPhaseEn: string;
  moonPct: number;
  moonFraction: number;
  /** local fallback line (curated) in French */
  fallbackLineFr: string;
  /** local fallback line (curated) in English */
  fallbackLineEn: string;
  /** local fallback phenology note in French (Québec default) */
  phenologyFallbackFr: string;
  /** local fallback phenology note in English (Québec default) */
  phenologyFallbackEn: string;
  /** place label used */
  place: string;
  /** AI evocation, if fetched (in `lang`) */
  evocation?: CardEvocation;
  createdAt: number;
}

export interface SavedCard extends DailyCard {
  id?: number;
  savedAt: number;
}

export interface Settings {
  key: "settings";
  language: "fr" | "en";
  /** "auto" attempts geolocation; "quebec" forces the default */
  locationMode: "quebec" | "auto";
  lat?: number;
  lon?: number;
  placeLabel?: string;
  onboarded: boolean;
}

class AlmanachDB extends Dexie {
  daily!: Table<DailyCard, string>;
  saved!: Table<SavedCard, number>;
  settings!: Table<Settings, string>;

  constructor() {
    super("l-almanach");
    // v1: cards keyed by date (single-language, FR-only fields).
    this.version(1).stores({
      daily: "date, koIndex",
      saved: "++id, date, koIndex, savedAt",
      settings: "key",
    });
    // v2: bilingual. Cards keyed by "date|lang"; the schema of stored objects
    // changed substantially, so we drop the old daily cache (it rebuilds for
    // free from local data) and clear saved rows that lack the new bilingual
    // fields rather than render them half-translated.
    this.version(2)
      .stores({
        daily: "cacheKey, date, lang, koIndex",
        saved: "++id, date, lang, koIndex, savedAt",
        settings: "key",
      })
      .upgrade(async (tx) => {
        await tx.table("daily").clear();
        await tx.table("saved").clear();
      });
  }
}

export const db = new AlmanachDB();

/** composite cache key for the daily table. */
export function cardKey(date: string, lang: Lang): string {
  return `${date}|${lang}`;
}

const DEFAULT_SETTINGS: Settings = {
  key: "settings",
  language: "fr",
  locationMode: "quebec",
  placeLabel: "Québec",
  onboarded: false,
};

export async function getSettings(): Promise<Settings> {
  const s = await db.settings.get("settings");
  return s ?? DEFAULT_SETTINGS;
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  const cur = await getSettings();
  await db.settings.put({ ...cur, ...patch, key: "settings" });
}

export async function getCachedCard(
  date: string,
  lang: Lang,
): Promise<DailyCard | undefined> {
  return db.daily.get(cardKey(date, lang));
}

export async function putCachedCard(card: DailyCard): Promise<void> {
  await db.daily.put(card);
}

export async function saveCard(card: DailyCard): Promise<number> {
  return db.saved.add({ ...card, savedAt: Date.now() });
}

export async function unsaveCard(id: number): Promise<void> {
  await db.saved.delete(id);
}

/** A day is "saved" if any language variant of it is in the herbarium. */
export async function isDateSaved(date: string): Promise<SavedCard | undefined> {
  return db.saved.where("date").equals(date).first();
}
