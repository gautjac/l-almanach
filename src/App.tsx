import { useCallback, useEffect, useRef, useState } from "react";
import { Onboarding } from "./components/Onboarding";
import { DailyCard } from "./components/DailyCard";
import { YearWheel } from "./components/YearWheel";
import { Archive } from "./components/Archive";
import { fetchEvocation } from "./api";
import {
  getSettings,
  saveSettings,
  getCachedCard,
  putCachedCard,
  saveCard,
  unsaveCard,
  isDateSaved,
  type DailyCard as Card,
  type Settings,
  type SavedCard,
} from "./db";
import { buildLocalCard } from "./lib/buildCard";
import { applyPalette } from "./lib/season";
import { fullDateFr, dateLabelFr } from "./lib/dates";
import type { SeasonKey, Ko } from "./data/ko";
import { koDateRangeFr, sekkiForKo } from "./data/ko";
import { lineForKo } from "./data/lines";

type View = "today" | "wheel" | "archive";

export default function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [view, setView] = useState<View>("today");
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRow, setSavedRow] = useState<SavedCard | undefined>(undefined);
  const [peek, setPeek] = useState<Ko | null>(null);
  const fetchedFor = useRef<string | null>(null);

  // ── boot: load settings ──────────────────────────────────────────────
  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  // ── resolve place (geolocation optional, Québec default) ─────────────
  const resolvePlace = useCallback(async (s: Settings): Promise<string> => {
    if (s.locationMode === "auto") {
      if (s.placeLabel && s.placeLabel !== "Québec") return s.placeLabel;
      // Attempt geolocation (graceful: fall back to Québec).
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => {
          if (!navigator.geolocation) return rej(new Error("no geo"));
          navigator.geolocation.getCurrentPosition(res, rej, {
            timeout: 6000,
            maximumAge: 86400000,
          });
        });
        const { latitude, longitude } = pos.coords;
        const label = await reverseGeocode(latitude, longitude);
        await saveSettings({ lat: latitude, lon: longitude, placeLabel: label });
        return label;
      } catch {
        return s.placeLabel || "Québec";
      }
    }
    return "Québec";
  }, []);

  // ── build today's card (local) + apply palette + cache ───────────────
  const loadToday = useCallback(
    async (s: Settings) => {
      const now = new Date();
      const place = await resolvePlace(s);
      const fresh = buildLocalCard(now, place);
      applyPalette(fresh.season as SeasonKey);

      // Prefer a cached card for the day so it's stable; keep its place fresh.
      const cached = await getCachedCard(fresh.date);
      let working: Card;
      if (cached) {
        working = { ...cached, place };
      } else {
        working = fresh;
        await putCachedCard(working);
      }
      setCard(working);
      setSavedRow(await isDateSaved(working.date));

      // Fetch the AI evocation once per day (if not cached already).
      if (!working.evocation && fetchedFor.current !== working.date) {
        fetchedFor.current = working.date;
        void fetchEvocationFor(working);
      }
    },
    [resolvePlace],
  );

  const fetchEvocationFor = useCallback(async (working: Card) => {
    setLoading(true);
    setError(null);
    try {
      const evo = await fetchEvocation({
        koFr: working.koFr,
        koKanji: working.koKanji,
        sekkiFr: working.sekkiFr,
        sekkiGloss: working.sekkiGloss,
        season: working.season,
        date: working.date,
        dateLabel: dateLabelFr(new Date(working.date + "T12:00:00")),
        moonPhase: working.moonPhase,
        moonPct: working.moonPct,
        place: working.place,
      });
      const updated: Card = { ...working, evocation: evo };
      await putCachedCard(updated);
      setCard((c) => (c && c.date === updated.date ? updated : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      fetchedFor.current = null; // allow retry
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (settings?.onboarded) void loadToday(settings);
  }, [settings, loadToday]);

  // ── onboarding completion ────────────────────────────────────────────
  const finishOnboarding = useCallback(
    async (choice: { locationMode: "quebec" | "auto" }) => {
      await saveSettings({ onboarded: true, locationMode: choice.locationMode });
      const s = await getSettings();
      setSettings(s);
    },
    [],
  );

  // ── save / unsave today's card ───────────────────────────────────────
  const toggleSave = useCallback(async () => {
    if (!card) return;
    if (savedRow?.id) {
      await unsaveCard(savedRow.id);
      setSavedRow(undefined);
    } else {
      const latest = (await getCachedCard(card.date)) ?? card;
      await saveCard(latest);
      setSavedRow(await isDateSaved(card.date));
    }
  }, [card, savedRow]);

  // ── retry the evocation ──────────────────────────────────────────────
  const retry = useCallback(() => {
    if (card) {
      fetchedFor.current = card.date;
      void fetchEvocationFor(card);
    }
  }, [card, fetchEvocationFor]);

  // ── toggle location mode from header ─────────────────────────────────
  const toggleLocation = useCallback(async () => {
    if (!settings) return;
    const next = settings.locationMode === "auto" ? "quebec" : "auto";
    await saveSettings({
      locationMode: next,
      ...(next === "quebec" ? { placeLabel: "Québec" } : {}),
    });
    const s = await getSettings();
    setSettings(s);
    fetchedFor.current = null;
    setError(null);
    await loadToday(s);
  }, [settings, loadToday]);

  if (!settings) return <BootSplash />;
  if (!settings.onboarded) return <Onboarding onDone={finishOnboarding} />;

  return (
    <div className="alm-transition min-h-screen flex flex-col">
      <Header
        view={view}
        setView={setView}
        place={card?.place ?? "Québec"}
        locationMode={settings.locationMode}
        onToggleLocation={toggleLocation}
        dateLabel={card ? fullDateFr(new Date(card.date + "T12:00:00")) : ""}
      />

      <main className="flex-1 px-4 sm:px-6 pb-16 pt-4">
        {view === "today" && card && (
          <div className="pt-2">
            <DailyCard
              card={card}
              loading={loading}
              error={error}
              saved={!!savedRow}
              onSave={toggleSave}
              onRetry={retry}
            />
          </div>
        )}

        {view === "wheel" && card && (
          <div className="mx-auto max-w-2xl pt-4 animate-fadeIn">
            <div className="text-center mb-4">
              <h2 className="font-display text-2xl text-ink">La roue de l'année</h2>
              <p className="font-serif text-lg text-ink/70">
                Les 24 sekki, leurs 72 kō, tout autour du cercle.
              </p>
            </div>
            <YearWheel todayIndex={card.koIndex} onPick={setPeek} />
          </div>
        )}

        {view === "archive" && (
          <Archive
            onOpen={(c) => {
              // Reopen a saved card in the today view (read-only snapshot).
              applyPalette(c.season as SeasonKey);
              setCard(c);
              setSavedRow(c);
              setView("today");
            }}
          />
        )}
      </main>

      <Footer />

      {peek && <KoPeek ko={peek} onClose={() => setPeek(null)} />}
    </div>
  );
}

// ── Header / nav ──────────────────────────────────────────────────────────
function Header({
  view,
  setView,
  place,
  locationMode,
  onToggleLocation,
  dateLabel,
}: {
  view: View;
  setView: (v: View) => void;
  place: string;
  locationMode: "quebec" | "auto";
  onToggleLocation: () => void;
  dateLabel: string;
}) {
  const tabs: { id: View; label: string }[] = [
    { id: "today", label: "aujourd'hui" },
    { id: "wheel", label: "la roue" },
    { id: "archive", label: "l'herbier" },
  ];
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <button
          onClick={() => setView("today")}
          className="flex items-baseline gap-2 text-left"
        >
          <span className="font-display text-xl text-ink tracking-tight">L'Almanach</span>
          <span className="hidden sm:inline font-serif text-sm text-muted italic">
            {dateLabel}
          </span>
        </button>
        <nav className="flex items-center gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`rounded-full px-3 py-1.5 font-sans text-xs transition-colors ${
                view === t.id
                  ? "bg-accent text-surface"
                  : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-2 -mt-1 flex justify-end">
        <button
          onClick={onToggleLocation}
          title="Changer le lieu"
          className="font-sans text-[11px] text-muted hover:text-accent transition-colors"
        >
          {locationMode === "auto" ? "📍 " : ""}
          {place} ·{" "}
          {locationMode === "auto" ? "ma position" : "Québec par défaut"}
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line py-6 px-6">
      <p className="mx-auto max-w-2xl text-center font-sans text-[11px] leading-relaxed text-muted">
        Le kō du jour et la phase de la lune sont calculés sur votre appareil, hors
        ligne, à partir de la date. L'évocation, le mot et le haïku sont écrits pour le
        jour. Soixante-douze micro-saisons, l'année qui tourne.
      </p>
    </footer>
  );
}

function BootSplash() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-breathe">
        <div className="text-4xl text-accent mb-3">❀</div>
        <p className="font-display text-xl text-ink">L'Almanach</p>
      </div>
    </div>
  );
}

// ── A modal that reads a single kō picked from the wheel ───────────────────
function KoPeek({ ko, onClose }: { ko: Ko; onClose: () => void }) {
  const sekki = sekkiForKo(ko);
  const line = lineForKo(ko.index);
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-line bg-surface p-7 animate-riseIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="font-sans text-[10px] uppercase tracking-widest2 text-accent">
            {sekki.kanji} {sekki.fr} · {sekki.glossFr}
          </span>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink font-sans text-sm"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-serif text-xl text-ink/60">{ko.kanji}</span>
          <span className="font-sans text-[11px] italic text-muted">{ko.romaji}</span>
        </div>
        <h3 className="mt-1 font-display text-3xl leading-tight text-ink">{ko.fr}</h3>
        <p className="mt-1 font-sans text-xs text-muted">
          {koDateRangeFr(ko)} · n<sup>o</sup> {ko.index} / 72
        </p>
        {line && (
          <p className="haiku mt-5 border-l-2 border-accent/50 pl-4 text-lg italic text-ink/80">
            {line}
          </p>
        )}
      </div>
    </div>
  );
}

// ── lightweight reverse-geocode via open, key-less endpoint; graceful on fail ─
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=8&accept-language=fr`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error("geocode");
    const j = (await res.json()) as { address?: Record<string, string> };
    const a = j.address ?? {};
    const town = a.city || a.town || a.village || a.county || a.state || "";
    const region = a.state && a.state !== town ? a.state : a.country || "";
    return [town, region].filter(Boolean).join(", ") || "votre région";
  } catch {
    return "votre région";
  }
}
