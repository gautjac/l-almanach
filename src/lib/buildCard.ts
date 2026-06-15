// Assemble a DailyCard from purely LOCAL facts (kō, moon, phenology, fallback
// line + word), in BOTH languages. The AI evocation (language-specific) is layered
// on later. This guarantees a complete, beautiful card with zero network, in
// whichever language the reader chooses.

import {
  koForDate,
  sekkiForKo,
  koDateRangeFr,
  koDateRangeEn,
  SEASON_FR,
  type Lang,
} from "../data/ko";
import { moonForDate, illuminationPercent } from "./moon";
import { phenologyForDate } from "../data/phenology";
import { lineForKo } from "../data/lines";
import { isoDate, dayOfYear } from "./dates";
import { cardKey, type DailyCard } from "../db";

export function buildLocalCard(date: Date, place: string, lang: Lang): DailyCard {
  const ko = koForDate(date);
  const sekki = sekkiForKo(ko);
  const moon = moonForDate(date);
  const seed = dayOfYear(date);
  const iso = isoDate(date);

  // Compose Québec phenology fallback sentences in each language.
  const phenFr = phenologyForDate(date, "fr");
  const phenEn = phenologyForDate(date, "en");
  const phenologyFallbackFr = `${capitalize(phenFr.blooming[seed % phenFr.blooming.length])}. ${capitalize(
    phenFr.stirring[seed % phenFr.stirring.length],
  )}.`;
  const phenologyFallbackEn = `${capitalize(phenEn.blooming[seed % phenEn.blooming.length])}. ${capitalize(
    phenEn.stirring[seed % phenEn.stirring.length],
  )}.`;

  return {
    cacheKey: cardKey(iso, lang),
    lang,
    date: iso,
    koIndex: ko.index,
    koFr: ko.fr,
    koEn: ko.en,
    koKanji: ko.kanji,
    koRomaji: ko.romaji,
    koRangeFr: koDateRangeFr(ko),
    koRangeEn: koDateRangeEn(ko),
    sekkiFr: sekki.fr,
    sekkiEn: sekki.en,
    sekkiGlossFr: sekki.glossFr,
    sekkiGlossEn: sekki.glossEn,
    sekkiKanji: sekki.kanji,
    season: sekki.season,
    moonPhaseFr: moon.nameFr,
    moonPhaseEn: moon.nameEn,
    moonPct: illuminationPercent(moon),
    moonFraction: moon.phaseFraction,
    fallbackLineFr: lineForKo(ko.index, "fr"),
    fallbackLineEn: lineForKo(ko.index, "en"),
    phenologyFallbackFr,
    phenologyFallbackEn,
    place,
    createdAt: Date.now(),
  };
}

export { SEASON_FR };

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
