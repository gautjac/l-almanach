import { useState } from "react";
import { useLang } from "../i18n";
import type { DictKey } from "../i18n/dict";

interface Props {
  onDone: (choice: { locationMode: "quebec" | "auto" }) => void;
}

// A light, skippable first-run welcome. Three calm panels, then a single choice:
// use my place (geolocation) or keep the Québec default. Fully localized; a small
// FR/EN toggle is offered up front so the reader can pick their language at once.
export function Onboarding({ onDone }: Props) {
  const { t, lang, toggle } = useLang();
  const [step, setStep] = useState(0);

  const panels: { glyph: string; titleKey: DictKey; bodyKey: DictKey }[] = [
    { glyph: "❀", titleKey: "onb.p1.title", bodyKey: "onb.p1.body" },
    { glyph: "❧", titleKey: "onb.p2.title", bodyKey: "onb.p2.body" },
    { glyph: "☾", titleKey: "onb.p3.title", bodyKey: "onb.p3.body" },
  ];

  const LangToggle = (
    <div className="absolute top-5 right-5">
      <button
        onClick={toggle}
        title={t("lang.toggle.title")}
        aria-label={t("lang.toggle.title")}
        className="rounded-full border border-line px-2.5 py-1.5 font-sans text-[11px] font-medium tracking-wide text-muted hover:border-accent hover:text-accent transition-colors"
      >
        <span className={lang === "fr" ? "text-accent" : ""}>FR</span>
        <span className="mx-1 text-line">/</span>
        <span className={lang === "en" ? "text-accent" : ""}>EN</span>
      </button>
    </div>
  );

  if (step < panels.length) {
    const p = panels[step];
    return (
      <Shell>
        {LangToggle}
        <div key={step} className="animate-riseIn text-center">
          <div className="text-5xl text-accent mb-6 animate-drift">{p.glyph}</div>
          <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">{t(p.titleKey)}</h1>
          <p className="font-serif text-lg md:text-xl leading-relaxed text-ink/80 max-w-md mx-auto">
            {t(p.bodyKey)}
          </p>
        </div>
        <div className="mt-10 flex items-center justify-center gap-3">
          {panels.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-accent" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => onDone({ locationMode: "quebec" })}
            className="text-sm text-muted hover:text-ink font-sans transition-colors"
          >
            {t("onb.skip")}
          </button>
          <button
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-accent px-7 py-2.5 text-surface font-sans text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            {t("onb.continue")}
          </button>
        </div>
      </Shell>
    );
  }

  // Final: location choice
  return (
    <Shell>
      {LangToggle}
      <div className="animate-riseIn text-center">
        <div className="text-4xl text-accent mb-6">☉</div>
        <h1 className="font-display text-2xl md:text-3xl text-ink mb-3">{t("onb.where.title")}</h1>
        <p className="font-serif text-lg leading-relaxed text-ink/80 max-w-md mx-auto mb-8">
          {t("onb.where.body")}
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={() => onDone({ locationMode: "auto" })}
            className="rounded-full bg-accent px-6 py-3 text-surface font-sans text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            {t("onb.where.useLocation")}
          </button>
          <button
            onClick={() => onDone({ locationMode: "quebec" })}
            className="rounded-full border border-line bg-surface px-6 py-3 text-ink font-sans text-sm tracking-wide hover:border-accent transition-colors"
          >
            {t("onb.where.stayQuebec")}
          </button>
        </div>
        <p className="mt-5 text-xs text-muted font-sans">{t("onb.where.changeLater")}</p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
