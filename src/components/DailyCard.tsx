import type { DailyCard as Card } from "../db";
import { MoonIcon } from "./MoonIcon";
import { SEASON_GLYPH } from "../lib/season";
import { seasonLabel, type SeasonKey } from "../data/ko";
import { useLang } from "../i18n";

interface Props {
  card: Card;
  /** the AI evocation is loading */
  loading: boolean;
  /** an error from the evocation fetch, if any (card still renders from local data) */
  error?: string | null;
  saved: boolean;
  onSave: () => void;
  onRetry?: () => void;
}

// The signature: a calm «aujourd'hui dans l'année». Built entirely from local
// facts (kō, moon, phenology) with the AI evocation/haiku layered in when ready.
// Every local fact is shown in the active language; the AI evocation is written
// in the language the card was fetched for (see card.lang).
export function DailyCard({ card, loading, error, saved, onSave, onRetry }: Props) {
  const { lang, t } = useLang();
  const season = card.season as SeasonKey;
  const evo = card.evocation;

  // Local facts in the active UI language.
  const ko = lang === "en" ? card.koEn : card.koFr;
  const koRange = lang === "en" ? card.koRangeEn : card.koRangeFr;
  const sekki = lang === "en" ? card.sekkiEn : card.sekkiFr;
  const sekkiG = lang === "en" ? card.sekkiGlossEn : card.sekkiGlossFr;
  const moonPhase = lang === "en" ? card.moonPhaseEn : card.moonPhaseFr;
  const fallbackLine = lang === "en" ? card.fallbackLineEn : card.fallbackLineFr;
  const phenologyFallback = lang === "en" ? card.phenologyFallbackEn : card.phenologyFallbackFr;
  const haiku = evo?.haiku || fallbackLine;

  return (
    <article className="animate-riseIn mx-auto w-full max-w-2xl">
      <div className="relative rounded-[28px] border border-line bg-surface/80 backdrop-blur-sm shadow-[0_20px_60px_-30px_rgb(var(--alm-ink)/0.4)] overflow-hidden">
        {/* top band: sekki + season */}
        <div className="px-7 pt-7 pb-5 sm:px-10 sm:pt-9 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-accent">
              <span aria-hidden>{SEASON_GLYPH[season]}</span>
              <span className="font-sans text-xs tracking-widest2 uppercase">
                {seasonLabel(season, lang)}
              </span>
            </div>
            <p className="mt-2 font-sans text-xs text-muted tracking-wide">
              {card.sekkiKanji} {sekki} · {sekkiG}
            </p>
          </div>
          <button
            onClick={onSave}
            aria-pressed={saved}
            title={saved ? t("card.unsave.title") : t("card.save.title")}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 font-sans text-xs transition-colors ${
              saved
                ? "border-accent bg-accent text-surface"
                : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {saved ? t("card.saved") : t("card.save")}
          </button>
        </div>

        {/* the kō — the heart */}
        <div className="px-7 sm:px-10">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-2xl text-ink/60">{card.koKanji}</span>
            <span className="font-sans text-[11px] text-muted italic">{card.koRomaji}</span>
          </div>
          <h1 className="mt-1 font-display text-[34px] leading-[1.08] sm:text-[44px] text-ink">
            {ko}
          </h1>
          <p className="mt-2 font-sans text-xs text-muted">
            {t("card.microSeason")} · {koRange} · n<sup>o</sup> {card.koIndex} {t("card.of72")}
          </p>
        </div>

        {/* evocation */}
        <div className="px-7 sm:px-10 mt-6">
          {loading && !evo ? (
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded bg-line/60 animate-breathe" />
              <div className="h-3.5 w-5/6 rounded bg-line/60 animate-breathe" />
              <div className="h-3.5 w-2/3 rounded bg-line/60 animate-breathe" />
            </div>
          ) : (
            <p className="font-serif text-xl sm:text-2xl leading-relaxed text-ink/90">
              {evo?.evocation || ""}
            </p>
          )}
        </div>

        {/* haiku */}
        {haiku && (
          <div className="px-7 sm:px-10 mt-7">
            <div className="border-l-2 border-accent/50 pl-5">
              <p className="haiku text-lg sm:text-xl leading-relaxed text-ink/85 italic">
                {haiku}
              </p>
            </div>
          </div>
        )}

        {/* divider */}
        <div className="mx-7 sm:mx-10 mt-8 mb-1 border-t border-line" />

        {/* moon + word + phenology — the three quiet rows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line/40 mt-4 mb-1 sm:mx-0">
          {/* moon */}
          <div className="bg-surface/80 px-7 sm:px-6 py-6">
            <div className="flex items-center gap-3">
              <MoonIcon fraction={card.moonFraction} size={52} />
              <div>
                <p className="font-sans text-[10px] uppercase tracking-widest2 text-muted">
                  {t("card.moon")}
                </p>
                <p className="font-serif text-lg leading-snug text-ink capitalize">
                  {moonPhase}
                </p>
                <p className="font-sans text-xs text-muted">
                  {card.moonPct} {t("card.moon.illuminated")}
                </p>
              </div>
            </div>
          </div>

          {/* seasonal word */}
          <div className="bg-surface/80 px-7 sm:px-6 py-6">
            <p className="font-sans text-[10px] uppercase tracking-widest2 text-muted">
              {t("card.word")}
            </p>
            {evo?.word?.word ? (
              <>
                <p className="font-display text-xl text-ink mt-1">
                  {evo.word.word}
                  {evo.word.lang && (
                    <span className="ml-1.5 font-sans text-[10px] text-muted italic align-middle">
                      {evo.word.lang}
                    </span>
                  )}
                </p>
                <p className="font-serif text-base leading-snug text-ink/75 mt-1">
                  {evo.word.gloss}
                </p>
              </>
            ) : (
              <div className="mt-2 h-10 w-3/4 rounded bg-line/50 animate-breathe" />
            )}
          </div>

          {/* phenology */}
          <div className="bg-surface/80 px-7 sm:px-6 py-6">
            <p className="font-sans text-[10px] uppercase tracking-widest2 text-muted">
              {t("card.nature")}
            </p>
            <p className="font-serif text-base leading-snug text-ink/85 mt-1">
              {evo?.phenologyNote || phenologyFallback}
            </p>
            <p className="font-sans text-[11px] text-muted mt-2">{card.place}</p>
          </div>
        </div>

        {error && (
          <div className="px-7 sm:px-10 py-4 bg-surface/80 border-t border-line flex items-center justify-between gap-3">
            <p className="font-sans text-xs text-muted">{t("card.error")}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="shrink-0 font-sans text-xs text-accent hover:underline"
              >
                {t("card.retry")}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
