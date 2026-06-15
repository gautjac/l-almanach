// Assemble a DailyCard from purely LOCAL facts (kō, moon, phenology, fallback
// line + word). The AI evocation is layered on later. This guarantees a complete,
// beautiful card with zero network.

import { koForDate, sekkiForKo, koDateRangeFr, SEASON_FR } from "../data/ko";
import { moonForDate, illuminationPercent } from "./moon";
import { phenologyForDate } from "../data/phenology";
import { lineForKo } from "../data/lines";
import { isoDate, dayOfYear } from "./dates";
import type { DailyCard } from "../db";

export function buildLocalCard(date: Date, place: string): DailyCard {
  const ko = koForDate(date);
  const sekki = sekkiForKo(ko);
  const moon = moonForDate(date);
  const phen = phenologyForDate(date);
  const seed = dayOfYear(date);

  // Compose a sensible Québec phenology fallback sentence.
  const bloom = phen.blooming[seed % phen.blooming.length];
  const stir = phen.stirring[seed % phen.stirring.length];
  const phenologyFallback = `${capitalize(bloom)}. ${capitalize(stir)}.`;

  return {
    date: isoDate(date),
    koIndex: ko.index,
    koFr: ko.fr,
    koKanji: ko.kanji,
    koRomaji: ko.romaji,
    koRange: koDateRangeFr(ko),
    sekkiFr: sekki.fr,
    sekkiGloss: sekki.glossFr,
    sekkiKanji: sekki.kanji,
    season: sekki.season,
    moonPhase: moon.nameFr,
    moonPct: illuminationPercent(moon),
    moonFraction: moon.phaseFraction,
    fallbackLine: lineForKo(ko.index),
    phenologyFallback,
    place,
    createdAt: Date.now(),
  };
}

export { SEASON_FR };

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
