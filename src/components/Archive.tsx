import { useLiveQuery } from "dexie-react-hooks";
import { db, unsaveCard, type SavedCard } from "../db";
import { MoonIcon } from "./MoonIcon";
import { SEASON_GLYPH } from "../lib/season";
import type { SeasonKey } from "../data/ko";
import { useLang } from "../i18n";
import { LOCALE } from "../i18n/dict";

interface Props {
  onOpen: (card: SavedCard) => void;
}

// L'herbier — a small archive of saved cards, newest first. Each is a quiet
// pressed-flower tile you can reopen or remove. Cards display in the active
// language using their stored bilingual fields.
export function Archive({ onOpen }: Props) {
  const { lang, t } = useLang();
  const cards = useLiveQuery(
    () => db.saved.orderBy("savedAt").reverse().toArray(),
    [],
    [] as SavedCard[],
  );

  if (!cards || cards.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center animate-fadeIn">
        <div className="text-4xl text-accent/60 mb-4">❧</div>
        <h2 className="font-display text-2xl text-ink mb-2">{t("archive.empty.title")}</h2>
        <p className="font-serif text-lg text-ink/70 max-w-sm mx-auto">
          {t("archive.empty.body")}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6 py-8 animate-fadeIn">
      <h2 className="font-display text-2xl text-ink mb-1">{t("archive.title")}</h2>
      <p className="font-sans text-sm text-muted mb-6">
        {cards.length}{" "}
        {cards.length > 1 ? t("archive.count.many") : t("archive.count.one")}.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((c) => {
          const ko = lang === "en" ? c.koEn : c.koFr;
          const koRange = lang === "en" ? c.koRangeEn : c.koRangeFr;
          const sekki = lang === "en" ? c.sekkiEn : c.sekkiFr;
          const fallbackLine = lang === "en" ? c.fallbackLineEn : c.fallbackLineFr;
          const line = c.evocation?.haiku || fallbackLine;
          return (
            <div
              key={c.id}
              className="group relative rounded-2xl border border-line bg-surface/80 p-5 transition-shadow hover:shadow-[0_14px_40px_-24px_rgb(var(--alm-ink)/0.5)]"
            >
              <button onClick={() => onOpen(c)} className="block w-full text-left">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-sans text-[10px] uppercase tracking-widest2 text-accent flex items-center gap-1.5">
                    <span aria-hidden>{SEASON_GLYPH[c.season as SeasonKey]}</span>
                    {sekki}
                  </span>
                  <MoonIcon fraction={c.moonFraction} size={26} />
                </div>
                <h3 className="mt-3 font-display text-xl leading-tight text-ink">{ko}</h3>
                <p className="mt-1 font-sans text-xs text-muted">{koRange}</p>
                {line && (
                  <p className="haiku mt-3 text-sm text-ink/70 italic line-clamp-3">
                    {line.replace(/\n/g, " · ")}
                  </p>
                )}
              </button>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-sans text-[10px] text-muted">
                  {t("archive.savedOn")}{" "}
                  {new Date(c.savedAt).toLocaleDateString(LOCALE[lang])}
                </span>
                <button
                  onClick={() => c.id && unsaveCard(c.id)}
                  className="font-sans text-[11px] text-muted hover:text-accent transition-colors"
                >
                  {t("archive.remove")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
