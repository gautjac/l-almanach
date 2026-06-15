import type { DailyCard as Card } from "../db";
import { MoonIcon } from "./MoonIcon";
import { SEASON_GLYPH } from "../lib/season";
import type { SeasonKey } from "../data/ko";

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
export function DailyCard({ card, loading, error, saved, onSave, onRetry }: Props) {
  const season = card.season as SeasonKey;
  const evo = card.evocation;
  const haiku = evo?.haiku || card.fallbackLine;

  return (
    <article className="animate-riseIn mx-auto w-full max-w-2xl">
      <div className="relative rounded-[28px] border border-line bg-surface/80 backdrop-blur-sm shadow-[0_20px_60px_-30px_rgb(var(--alm-ink)/0.4)] overflow-hidden">
        {/* top band: sekki + season */}
        <div className="px-7 pt-7 pb-5 sm:px-10 sm:pt-9 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-accent">
              <span aria-hidden>{SEASON_GLYPH[season]}</span>
              <span className="font-sans text-xs tracking-widest2 uppercase">
                {seasonLabel(season)}
              </span>
            </div>
            <p className="mt-2 font-sans text-xs text-muted tracking-wide">
              {card.sekkiKanji} {card.sekkiFr} · {card.sekkiGloss}
            </p>
          </div>
          <button
            onClick={onSave}
            aria-pressed={saved}
            title={saved ? "Retirer de l'herbier" : "Garder cette carte"}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 font-sans text-xs transition-colors ${
              saved
                ? "border-accent bg-accent text-surface"
                : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {saved ? "gardée ✓" : "garder"}
          </button>
        </div>

        {/* the kō — the heart */}
        <div className="px-7 sm:px-10">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-2xl text-ink/60">{card.koKanji}</span>
            <span className="font-sans text-[11px] text-muted italic">{card.koRomaji}</span>
          </div>
          <h1 className="mt-1 font-display text-[34px] leading-[1.08] sm:text-[44px] text-ink">
            {card.koFr}
          </h1>
          <p className="mt-2 font-sans text-xs text-muted">
            le micro-saison du moment · {card.koRange} · n<sup>o</sup> {card.koIndex} / 72
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
                  la lune
                </p>
                <p className="font-serif text-lg leading-snug text-ink capitalize">
                  {card.moonPhase}
                </p>
                <p className="font-sans text-xs text-muted">{card.moonPct} % éclairée</p>
              </div>
            </div>
          </div>

          {/* seasonal word */}
          <div className="bg-surface/80 px-7 sm:px-6 py-6">
            <p className="font-sans text-[10px] uppercase tracking-widest2 text-muted">
              le mot de saison
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
              dans la nature
            </p>
            <p className="font-serif text-base leading-snug text-ink/85 mt-1">
              {evo?.phenologyNote || card.phenologyFallback}
            </p>
            <p className="font-sans text-[11px] text-muted mt-2">{card.place}</p>
          </div>
        </div>

        {error && (
          <div className="px-7 sm:px-10 py-4 bg-surface/80 border-t border-line flex items-center justify-between gap-3">
            <p className="font-sans text-xs text-muted">
              L'évocation du jour n'a pu être écrite — la carte reste juste.
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="shrink-0 font-sans text-xs text-accent hover:underline"
              >
                réessayer
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function seasonLabel(s: SeasonKey): string {
  return { printemps: "printemps", ete: "été", automne: "automne", hiver: "hiver" }[s];
}
