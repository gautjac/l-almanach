import { useLiveQuery } from "dexie-react-hooks";
import { db, unsaveCard, type SavedCard } from "../db";
import { MoonIcon } from "./MoonIcon";
import { SEASON_GLYPH } from "../lib/season";
import type { SeasonKey } from "../data/ko";

interface Props {
  onOpen: (card: SavedCard) => void;
}

// L'herbier — a small archive of saved cards, newest first. Each is a quiet
// pressed-flower tile you can reopen or remove.
export function Archive({ onOpen }: Props) {
  const cards = useLiveQuery(
    () => db.saved.orderBy("savedAt").reverse().toArray(),
    [],
    [] as SavedCard[],
  );

  if (!cards || cards.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center animate-fadeIn">
        <div className="text-4xl text-accent/60 mb-4">❧</div>
        <h2 className="font-display text-2xl text-ink mb-2">L'herbier est vide</h2>
        <p className="font-serif text-lg text-ink/70 max-w-sm mx-auto">
          Gardez une carte du jour et elle viendra se presser ici, comme une feuille
          dans un livre.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6 py-8 animate-fadeIn">
      <h2 className="font-display text-2xl text-ink mb-1">L'herbier</h2>
      <p className="font-sans text-sm text-muted mb-6">
        {cards.length} {cards.length > 1 ? "cartes gardées" : "carte gardée"}.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <div
            key={c.id}
            className="group relative rounded-2xl border border-line bg-surface/80 p-5 transition-shadow hover:shadow-[0_14px_40px_-24px_rgb(var(--alm-ink)/0.5)]"
          >
            <button
              onClick={() => onOpen(c)}
              className="block w-full text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-sans text-[10px] uppercase tracking-widest2 text-accent flex items-center gap-1.5">
                  <span aria-hidden>{SEASON_GLYPH[c.season as SeasonKey]}</span>
                  {c.sekkiFr}
                </span>
                <MoonIcon fraction={c.moonFraction} size={26} />
              </div>
              <h3 className="mt-3 font-display text-xl leading-tight text-ink">
                {c.koFr}
              </h3>
              <p className="mt-1 font-sans text-xs text-muted">{c.koRange}</p>
              {(c.evocation?.haiku || c.fallbackLine) && (
                <p className="haiku mt-3 text-sm text-ink/70 italic line-clamp-3">
                  {(c.evocation?.haiku || c.fallbackLine).replace(/\n/g, " · ")}
                </p>
              )}
            </button>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-sans text-[10px] text-muted">
                gardée le {new Date(c.savedAt).toLocaleDateString("fr-CA")}
              </span>
              <button
                onClick={() => c.id && unsaveCard(c.id)}
                className="font-sans text-[11px] text-muted hover:text-accent transition-colors"
              >
                retirer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
