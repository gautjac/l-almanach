// Central UI dictionary for L'Almanach. Every user-facing string lives here,
// keyed by a dotted path, with a French and English value. Use the `t()` helper
// (see ./index.tsx) to read them with the active language. Content strings that
// are part of the dataset (kō names, sekki, moon phases, season labels) live in
// their own data modules and are localized there; this file holds the chrome:
// onboarding, navigation, card labels, the wheel, the archive, errors, prompts.

export type Lang = "fr" | "en";

type Entry = { fr: string; en: string };

export const DICT = {
  // ── app shell ──
  "app.name": { fr: "L'Almanach", en: "L'Almanach" },
  "app.tagline": { fr: "l'année qui tourne", en: "the turning year" },

  // ── navigation tabs ──
  "nav.today": { fr: "aujourd'hui", en: "today" },
  "nav.wheel": { fr: "la roue", en: "the wheel" },
  "nav.archive": { fr: "l'herbier", en: "the herbarium" },

  // ── language toggle ──
  "lang.toggle.title": { fr: "Switch to English", en: "Passer au français" },
  "lang.short.fr": { fr: "FR", en: "FR" },
  "lang.short.en": { fr: "EN", en: "EN" },

  // ── location control (header) ──
  "loc.myPosition": { fr: "ma position", en: "my location" },
  "loc.quebecDefault": { fr: "Québec par défaut", en: "Québec by default" },
  "loc.change.title": { fr: "Changer le lieu", en: "Change location" },
  "loc.defaultPlace": { fr: "Québec", en: "Québec" },
  "loc.yourRegion": { fr: "votre région", en: "your region" },

  // ── daily card ──
  "card.save": { fr: "garder", en: "keep" },
  "card.saved": { fr: "gardée ✓", en: "kept ✓" },
  "card.save.title": { fr: "Garder cette carte", en: "Keep this card" },
  "card.unsave.title": { fr: "Retirer de l'herbier", en: "Remove from the herbarium" },
  "card.microSeason": { fr: "le micro-saison du moment", en: "the micro-season of the moment" },
  "card.of72": { fr: "/ 72", en: "/ 72" },
  "card.moon": { fr: "la lune", en: "the moon" },
  "card.moon.illuminated": { fr: "% éclairée", en: "% lit" },
  "card.word": { fr: "le mot de saison", en: "the seasonal word" },
  "card.nature": { fr: "dans la nature", en: "in nature" },
  "card.error": {
    fr: "L'évocation du jour n'a pu être écrite — la carte reste juste.",
    en: "The day's evocation couldn't be written — the card still stands true.",
  },
  "card.retry": { fr: "réessayer", en: "retry" },

  // ── year wheel ──
  "wheel.title": { fr: "La roue de l'année", en: "The wheel of the year" },
  "wheel.subtitle": {
    fr: "Les 24 sekki, leurs 72 kō, tout autour du cercle.",
    en: "The 24 sekki, their 72 kō, all around the circle.",
  },
  "wheel.hint.before": { fr: "Survolez ou touchez un pétale pour lire son kō.", en: "Hover or tap a petal to read its kō." },
  "wheel.hint.today": { fr: "Aujourd'hui", en: "Today" },
  "wheel.hint.after": { fr: "est cerclé.", en: "is circled." },

  // ── archive (l'herbier) ──
  "archive.title": { fr: "L'herbier", en: "The herbarium" },
  "archive.empty.title": { fr: "L'herbier est vide", en: "The herbarium is empty" },
  "archive.empty.body": {
    fr: "Gardez une carte du jour et elle viendra se presser ici, comme une feuille dans un livre.",
    en: "Keep a daily card and it will press itself here, like a leaf in a book.",
  },
  "archive.count.one": { fr: "carte gardée", en: "card kept" },
  "archive.count.many": { fr: "cartes gardées", en: "cards kept" },
  "archive.savedOn": { fr: "gardée le", en: "kept on" },
  "archive.remove": { fr: "retirer", en: "remove" },

  // ── footer ──
  "footer.note": {
    fr: "Le kō du jour et la phase de la lune sont calculés sur votre appareil, hors ligne, à partir de la date. L'évocation, le mot et le haïku sont écrits pour le jour. Soixante-douze micro-saisons, l'année qui tourne.",
    en: "The day's kō and the moon phase are computed on your device, offline, from the date. The evocation, the word, and the haiku are written for the day. Seventy-two micro-seasons, the turning year.",
  },

  // ── onboarding ──
  "onb.skip": { fr: "passer", en: "skip" },
  "onb.continue": { fr: "continuer", en: "continue" },
  "onb.p1.title": { fr: "L'Almanach", en: "L'Almanach" },
  "onb.p1.body": {
    fr: "Une carte calme par jour, pour sentir l'année qui tourne. Le micro-saison du jour, la lune, ce qui s'éveille dans la nature.",
    en: "A calm card each day, to feel the turning year. The day's micro-season, the moon, what is stirring in nature.",
  },
  "onb.p2.title": { fr: "Soixante-douze micro-saisons", en: "Seventy-two micro-seasons" },
  "onb.p2.body": {
    fr: "L'année est découpée en 72 kō — de minuscules observations du vivant. « Les vers de terre émergent », « le premier givre se dépose ». Chaque jour appartient à l'une d'elles.",
    en: "The year is cut into 72 kō — tiny observations of the living world. “Earthworms surface,” “first frost falls.” Each day belongs to one of them.",
  },
  "onb.p3.title": { fr: "Tout est calculé ici", en: "Everything is computed here" },
  "onb.p3.body": {
    fr: "La lune et le kō du jour sont calculés sur votre appareil, hors ligne. Une évocation et un haïku sont écrits pour le jour. Rien à configurer.",
    en: "The moon and the day's kō are computed on your device, offline. An evocation and a haiku are written for the day. Nothing to configure.",
  },
  "onb.where.title": { fr: "Où êtes-vous ?", en: "Where are you?" },
  "onb.where.body": {
    fr: "La phénologie — ce qui fleurit, migre, remue — peut être ajustée à votre coin de pays. Sinon, l'almanach suit le calendrier du Québec.",
    en: "Phenology — what blooms, migrates, stirs — can be tuned to your corner of the world. Otherwise, the almanac follows the Québec calendar.",
  },
  "onb.where.useLocation": { fr: "utiliser ma position", en: "use my location" },
  "onb.where.stayQuebec": { fr: "rester au Québec", en: "stay in Québec" },
  "onb.where.changeLater": {
    fr: "Vous pourrez changer cela à tout moment.",
    en: "You can change this at any time.",
  },

  // ── errors ──
  "err.unknown": { fr: "Erreur inconnue", en: "Unknown error" },
  "err.invalidResponse": { fr: "Réponse invalide du serveur.", en: "Invalid response from the server." },
  "err.server": { fr: "Erreur", en: "Error" },
} as const satisfies Record<string, Entry>;

export type DictKey = keyof typeof DICT;

/** Locale tag for Intl/toLocaleDateString. */
export const LOCALE: Record<Lang, string> = {
  fr: "fr-CA",
  en: "en-CA",
};
