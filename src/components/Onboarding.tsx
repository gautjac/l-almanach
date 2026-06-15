import { useState } from "react";

interface Props {
  onDone: (choice: { locationMode: "quebec" | "auto" }) => void;
}

// A light, skippable first-run welcome. Three calm panels, then a single choice:
// use my place (geolocation) or keep the Québec default.
export function Onboarding({ onDone }: Props) {
  const [step, setStep] = useState(0);

  const panels = [
    {
      glyph: "❀",
      title: "L'Almanach",
      body: "Une carte calme par jour, pour sentir l'année qui tourne. Le micro-saison du jour, la lune, ce qui s'éveille dans la nature.",
    },
    {
      glyph: "❧",
      title: "Soixante-douze micro-saisons",
      body: "L'année est découpée en 72 kō — de minuscules observations du vivant. « Les vers de terre émergent », « le premier givre se dépose ». Chaque jour appartient à l'une d'elles.",
    },
    {
      glyph: "☾",
      title: "Tout est calculé ici",
      body: "La lune et le kō du jour sont calculés sur votre appareil, hors ligne. Une évocation et un haïku sont écrits pour le jour. Rien à configurer.",
    },
  ];

  if (step < panels.length) {
    const p = panels[step];
    return (
      <Shell>
        <div key={step} className="animate-riseIn text-center">
          <div className="text-5xl text-accent mb-6 animate-drift">{p.glyph}</div>
          <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">{p.title}</h1>
          <p className="font-serif text-lg md:text-xl leading-relaxed text-ink/80 max-w-md mx-auto">
            {p.body}
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
            passer
          </button>
          <button
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-accent px-7 py-2.5 text-surface font-sans text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            continuer
          </button>
        </div>
      </Shell>
    );
  }

  // Final: location choice
  return (
    <Shell>
      <div className="animate-riseIn text-center">
        <div className="text-4xl text-accent mb-6">☉</div>
        <h1 className="font-display text-2xl md:text-3xl text-ink mb-3">Où êtes-vous ?</h1>
        <p className="font-serif text-lg leading-relaxed text-ink/80 max-w-md mx-auto mb-8">
          La phénologie — ce qui fleurit, migre, remue — peut être ajustée à votre coin
          de pays. Sinon, l'almanach suit le calendrier du Québec.
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={() => onDone({ locationMode: "auto" })}
            className="rounded-full bg-accent px-6 py-3 text-surface font-sans text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            utiliser ma position
          </button>
          <button
            onClick={() => onDone({ locationMode: "quebec" })}
            className="rounded-full border border-line bg-surface px-6 py-3 text-ink font-sans text-sm tracking-wide hover:border-accent transition-colors"
          >
            rester au Québec
          </button>
        </div>
        <p className="mt-5 text-xs text-muted font-sans">
          Vous pourrez changer cela à tout moment.
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
