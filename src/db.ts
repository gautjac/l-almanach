import Dexie, { type Table } from "dexie";
import type { CardEvocation } from "./api";

// The full, render-ready daily card: the local kō / moon / phenology facts plus
// the (optional) AI evocation. We cache one per ISO date so the day's card is
// stable — open the app twice in a day and it's the same card.

export interface DailyCard {
  /** ISO date "YYYY-MM-DD" — primary key, one card per day */
  date: string;
  koIndex: number;
  koFr: string;
  koKanji: string;
  koRomaji: string;
  koRange: string;
  sekkiFr: string;
  sekkiGloss: string;
  sekkiKanji: string;
  season: string;
  moonPhase: string;
  moonPct: number;
  moonFraction: number;
  /** local fallback line (curated) */
  fallbackLine: string;
  /** local fallback phenology note (Québec default), shown until/unless the AI refines it */
  phenologyFallback: string;
  /** place label used */
  place: string;
  /** AI evocation, if fetched */
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
    this.version(1).stores({
      daily: "date, koIndex",
      saved: "++id, date, koIndex, savedAt",
      settings: "key",
    });
  }
}

export const db = new AlmanachDB();

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

export async function getCachedCard(date: string): Promise<DailyCard | undefined> {
  return db.daily.get(date);
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

export async function isDateSaved(date: string): Promise<SavedCard | undefined> {
  return db.saved.where("date").equals(date).first();
}
