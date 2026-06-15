// Phenology — what is likely stirring in nature now, tuned to a northern-temperate
// / Québec calendar. This is the OFFLINE default used when geolocation is denied
// (or before the API answers). When the API is reachable, Claude refines this to
// the actual locale; this gives us a graceful, sensible Québec card with no network.

import type { SeasonKey } from "./ko";

export interface Phenology {
  /** short label, e.g. "Début mai" */
  window: string;
  blooming: string[];
  stirring: string[];
  /** one-line ambient note */
  note: string;
}

// Indexed by month (1..12) for the Québec / St. Lawrence valley.
export const QUEBEC_PHENOLOGY: Record<number, Phenology> = {
  1: {
    window: "Cœur de l'hiver",
    blooming: ["rien ne fleurit dehors", "amaryllis et jacinthes forcées à l'intérieur"],
    stirring: ["mésanges et gros-becs aux mangeoires", "renards en quête sur la neige", "grand-duc d'Amérique qui hulule la nuit"],
    note: "La sève dort, la lumière revient lentement.",
  },
  2: {
    window: "Fin de l'hiver",
    blooming: ["chatons de saule qui gonflent", "perce-neige sous abri"],
    stirring: ["temps des sucres qui approche, la sève frémit", "harfangs encore présents dans les champs", "premiers chants de cardinal le matin"],
    note: "Les jours s'allongent ; l'érable se prépare à couler.",
  },
  3: {
    window: "Premières fontes",
    blooming: ["tussilage en bord de chemin", "premiers crocus en ville"],
    stirring: ["coulée des érables battant son plein", "outardes (bernaches) qui remontent", "écureuils plus actifs", "premières corneilles bruyantes"],
    note: "La neige fond, l'eau d'érable chante dans les chaudières.",
  },
  4: {
    window: "Dégel",
    blooming: ["tussilage, hépatiques et sanguinaires en sous-bois", "saules en chatons d'or"],
    stirring: ["retour des merles et des carouges à épaulettes", "rainettes et grenouilles des bois qui chantent", "ours qui sortent de l'hibernation"],
    note: "La terre se découvre, les éphémères de printemps tapissent les bois.",
  },
  5: {
    window: "Plein printemps",
    blooming: ["trilles, trientales et muguet", "pommiers et lilas en fleurs", "pissenlits dorés partout"],
    stirring: ["grande vague de parulines en migration", "colibris de retour", "vers de terre à la surface après la pluie"],
    note: "Les bois se referment de vert ; les pommiers neigent leurs pétales.",
  },
  6: {
    window: "Début de l'été",
    blooming: ["pivoines, iris et roses", "trèfles et marguerites dans les champs", "asclépiades qui montent"],
    stirring: ["lucioles dans l'herbe au crépuscule", "couvées d'oiseaux qui apprennent à voler", "premières fraises des champs"],
    note: "Le soir s'étire ; les lucioles ouvrent leurs lanternes.",
  },
  7: {
    window: "Cœur de l'été",
    blooming: ["asclépiades, échinacées et tournesols", "lis et hémérocalles", "épilobes roses dans les clairières"],
    stirring: ["monarques sur les asclépiades", "cigales en plein chant", "bleuets qui mûrissent dans le nord"],
    note: "La chaleur est pleine ; les champs bourdonnent de pollinisateurs.",
  },
  8: {
    window: "Fin de l'été",
    blooming: ["verges d'or et asters qui s'ouvrent", "tournesols à maturité", "houblon et vignes lourds"],
    stirring: ["grillons le soir", "rassemblement des hirondelles sur les fils", "premières migrations de monarques vers le sud"],
    note: "Les soirées fraîchissent ; les grillons annoncent la bascule.",
  },
  9: {
    window: "Début de l'automne",
    blooming: ["asters et verges d'or en abondance", "dernières roses", "chrysanthèmes"],
    stirring: ["bernaches qui se rassemblent en V", "écureuils qui font leurs réserves", "premières couleurs aux érables"],
    note: "Les feuilles tournent ; l'air sent la pomme et la terre humide.",
  },
  10: {
    window: "Plein automne",
    blooming: ["chrysanthèmes et derniers asters", "courges et citrouilles aux champs"],
    stirring: ["grands départs d'oies et de canards", "cerfs en rut (le brame)", "champignons après les pluies", "premières gelées au sol"],
    note: "Le feuillage flambe puis tombe ; le givre signe les matins.",
  },
  11: {
    window: "Fin de l'automne",
    blooming: ["hamamélis (le dernier à fleurir)", "baies de sorbier et d'aubépine"],
    stirring: ["jaseurs boréals de passage", "derniers huards qui partent", "castors qui parachèvent leurs barrages", "terre qui commence à geler"],
    note: "Les bois se dénudent ; le vent du nord balaie les dernières feuilles.",
  },
  12: {
    window: "Début de l'hiver",
    blooming: ["houx et if décoratifs", "poinsettias et cactus de Noël à l'intérieur"],
    stirring: ["sizerins et tarins en bandes", "lièvres déjà blancs", "renards qui chassent les mulots sous la neige"],
    note: "Le silence blanc s'installe ; la lumière touche son point le plus bas.",
  },
};

export function phenologyForDate(date: Date): Phenology {
  return QUEBEC_PHENOLOGY[date.getMonth() + 1];
}

// ── Seasonal words — a lovely FR (or world) word for the moment, with a gloss.
// Used as an offline default; the API may offer a fresher one tuned to the kō.
export interface SeasonalWord {
  word: string;
  lang?: string;
  gloss: string;
}

export const SEASONAL_WORDS: Record<SeasonKey, SeasonalWord[]> = {
  printemps: [
    { word: "renouveau", gloss: "le retour de la vie après l'hiver ; tout ce qui recommence." },
    { word: "frondaison", gloss: "le déploiement des jeunes feuilles ; l'instant où l'arbre se couvre." },
    { word: "petrichor", lang: "néo-grec", gloss: "l'odeur de la terre après la première pluie." },
    { word: "aurore", gloss: "la première lueur du jour ; aussi le tout début d'une saison." },
  ],
  ete: [
    { word: "estival", gloss: "qui appartient à l'été, à sa lumière longue et lente." },
    { word: "canicule", gloss: "les jours les plus chauds, sous l'étoile du Grand Chien." },
    { word: "hesperus", lang: "grec", gloss: "l'étoile du soir, Vénus au crépuscule d'été." },
    { word: "komorebi", lang: "japonais", gloss: "la lumière du soleil filtrée par les feuilles." },
  ],
  automne: [
    { word: "arrière-saison", gloss: "les beaux jours tardifs ; l'été indien du Québec." },
    { word: "saudade", lang: "portugais", gloss: "la douce mélancolie d'une chose passée mais aimée." },
    { word: "hygge", lang: "danois", gloss: "le réconfort des petits plaisirs au creux du foyer." },
    { word: "défeuillaison", gloss: "la chute des feuilles ; l'arbre qui se dépouille." },
  ],
  hiver: [
    { word: "hivernal", gloss: "qui tient de l'hiver, de son silence et de sa clarté froide." },
    { word: "frimas", gloss: "le givre fin qui blanchit branches et fenêtres." },
    { word: "poudrerie", lang: "québécois", gloss: "la neige soulevée et chassée par le vent." },
    { word: "wabi", lang: "japonais", gloss: "la beauté sobre et solitaire des choses dépouillées." },
  ],
};

export function defaultSeasonalWord(season: SeasonKey, seed: number): SeasonalWord {
  const list = SEASONAL_WORDS[season];
  return list[seed % list.length];
}
