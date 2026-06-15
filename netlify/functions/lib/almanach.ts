import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8"; // depth — the daily evocation
const FAST = "claude-haiku-4-5"; // low-latency option

function client(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("Server missing CLAUDE_API_KEY");
  return new Anthropic({ apiKey, baseURL: "https://api.anthropic.com" });
}

export type Lang = "fr" | "en";

export interface AlmanachRequest {
  /** output language; defaults to "fr" if absent */
  lang?: Lang;
  /** kō name in the requested language, e.g. "Earthworms surface" / "Les vers de terre émergent" */
  koName: string;
  /** kō kanji */
  koKanji: string;
  /** parent sekki name in the requested language */
  sekkiName: string;
  /** sekki gloss in the requested language, e.g. "beginning of summer" */
  sekkiGloss: string;
  /** season key: printemps | ete | automne | hiver */
  season: string;
  /** ISO date string for the day */
  date: string;
  /** human date label in the requested language, e.g. "Saturday 14 June" */
  dateLabel: string;
  /** moon phase name in the requested language */
  moonPhase: string;
  /** moon illumination percent */
  moonPct: number;
  /** locale label — "Québec" by default, or a place name if geolocated */
  place?: string;
  /** whether to use the fast model (haiku) instead of opus */
  fast?: boolean;

  // ── legacy field names (pre-bilingual clients) — tolerated for safety ──
  koFr?: string;
  sekkiFr?: string;
}

export interface AlmanachResult {
  /** 2–3 sentence evocation of the day — what the year is doing now */
  evocation: string;
  /** a seasonal word with its gloss */
  word: { word: string; lang?: string; gloss: string };
  /** an original short haiku / line (3 lines, \n-separated, lowercase, no end punctuation needed) */
  haiku: string;
  /** one short phenology note tuned to place + moment */
  phenologyNote: string;
}

const VOICE_FR = `Tu es la voix de L'Almanach — un almanach poétique de l'année qui tourne, écrit en français québécois, sobre et lumineux. Tu écris comme un naturaliste-poète : précis sur le vivant, jamais mièvre, allergique au cliché et à la « voix poétique ». Tu fais sentir la saison plutôt que de la décrire. Tu connais le calendrier nordique-tempéré (vallée du Saint-Laurent) : les érables, les outardes, les lucioles, le temps des sucres, l'été indien, la poudrerie. Tu écris un français idiomatique et québécois quand c'est naturel, jamais traduit de l'anglais.`;

const VOICE_EN = `You are the voice of L'Almanach — a poetic almanac of the turning year, written in spare, luminous English. You write like a naturalist-poet: precise about the living world, never saccharine, allergic to cliché and to the "poetic voice." You make the season felt rather than described. You know the northern-temperate calendar (the St. Lawrence valley, Québec): the maples, the Canada geese, the fireflies, the sugaring season, Indian summer, the wind-driven snow. You write idiomatic, grounded English, never stiff or translated-sounding.`;

const TOOL_FR: Anthropic.Tool = {
  name: "livrer_carte",
  description:
    "Livrer l'évocation poétique du jour : un court texte, un mot de saison glosé, un haïku original, et une note de phénologie.",
  input_schema: {
    type: "object",
    required: ["evocation", "word", "haiku", "phenologyNote"],
    properties: {
      evocation: {
        type: "string",
        description:
          "2 à 3 phrases qui font sentir ce que l'année est en train de faire aujourd'hui, à travers le micro-saison (kō) et la saison. Concret, sensoriel, calme. Pas de « aujourd'hui » mécanique ; entre directement dans l'image.",
      },
      word: {
        type: "object",
        required: ["word", "gloss"],
        properties: {
          word: { type: "string", description: "Un beau mot (français ou d'une autre langue) lié à la nature ou au temps, juste pour ce moment de l'année." },
          lang: { type: "string", description: "La langue d'origine si le mot n'est pas français (ex. « japonais », « danois »). Omettre si français." },
          gloss: { type: "string", description: "Une glose courte et limpide (une phrase) du sens du mot." },
        },
      },
      haiku: {
        type: "string",
        description:
          "Un haïku ou tercet ORIGINAL en français, fidèle à l'image du kō et de la saison. Trois lignes séparées par des sauts de ligne (\\n). Minuscules, sans ponctuation finale lourde. Frais, jamais cliché.",
      },
      phenologyNote: {
        type: "string",
        description:
          "Une phrase sur ce qui s'éveille / fleurit / migre / remue dans la nature en ce moment, au lieu indiqué (Québec par défaut). Concret et juste pour la saison et la latitude.",
      },
    },
  },
};

const TOOL_EN: Anthropic.Tool = {
  name: "deliver_card",
  description:
    "Deliver the day's poetic evocation: a short text, a glossed seasonal word, an original haiku, and a phenology note.",
  input_schema: {
    type: "object",
    required: ["evocation", "word", "haiku", "phenologyNote"],
    properties: {
      evocation: {
        type: "string",
        description:
          "2 to 3 sentences that make felt what the year is doing today, through the micro-season (kō) and the season. Concrete, sensory, calm. No mechanical 'today'; step straight into the image.",
      },
      word: {
        type: "object",
        required: ["word", "gloss"],
        properties: {
          word: { type: "string", description: "A beautiful word (English or from another language) tied to nature or weather, just for this moment of the year." },
          lang: { type: "string", description: "The language of origin if the word is not English (e.g. 'Japanese', 'Danish'). Omit if English." },
          gloss: { type: "string", description: "A short, lucid one-sentence gloss of the word's meaning." },
        },
      },
      haiku: {
        type: "string",
        description:
          "An ORIGINAL haiku or tercet in English, faithful to the image of the kō and the season. Three lines separated by line breaks (\\n). Lowercase, no heavy end punctuation. Fresh, never cliché.",
      },
      phenologyNote: {
        type: "string",
        description:
          "One sentence on what is waking / blooming / migrating / stirring in nature right now, at the given place (Québec by default). Concrete and true to the season and latitude.",
      },
    },
  },
};

export async function generateCard(req: AlmanachRequest): Promise<AlmanachResult> {
  const lang: Lang = req.lang === "en" ? "en" : "fr";
  // Tolerate pre-bilingual clients that sent koFr / sekkiFr.
  const koName = req.koName ?? req.koFr ?? "";
  const sekkiName = req.sekkiName ?? req.sekkiFr ?? "";

  if (lang === "en") {
    const place = req.place?.trim() || "Québec (the St. Lawrence valley)";
    const prompt = [
      `Compose the L'Almanach card for ${req.dateLabel}.`,
      "",
      `MICRO-SEASON (kō): "${koName}" ${req.koKanji}`,
      `SEKKI (solar term): ${sekkiName} — ${req.sekkiGloss}`,
      `SEASON: ${seasonEn(req.season)}`,
      `MOON: ${req.moonPhase} (${req.moonPct}% lit)`,
      `PLACE: ${place}`,
      "",
      "Make this precise moment of the year felt. The evocation should lean on the image of the kō but transpose it to the living world of here (Québec or the given place), without ever naming Japan. The haiku must be original and fit in three lines. The seasonal word should surprise a little and suit the moment.",
      "Respond only by calling deliver_card. Write everything in English.",
    ].join("\n");

    const res = await client().messages.create({
      model: req.fast ? FAST : MODEL,
      max_tokens: 1100,
      system: VOICE_EN,
      messages: [{ role: "user", content: prompt }],
      tools: [TOOL_EN],
      tool_choice: { type: "tool", name: "deliver_card" },
    });
    return extract(res, "deliver_card");
  }

  const place = req.place?.trim() || "le Québec (vallée du Saint-Laurent)";
  const prompt = [
    `Compose la carte de L'Almanach pour ${req.dateLabel}.`,
    "",
    `MICRO-SAISON (kō) : « ${koName} » ${req.koKanji}`,
    `SEKKI (terme solaire) : ${sekkiName} — ${req.sekkiGloss}`,
    `SAISON : ${req.season}`,
    `LUNE : ${req.moonPhase} (${req.moonPct} % éclairée)`,
    `LIEU : ${place}`,
    "",
    "Fais sentir ce moment précis de l'année. L'évocation doit s'appuyer sur l'image du kō mais la transposer au vivant d'ici (le Québec ou le lieu donné), sans jamais nommer le Japon. Le haïku doit être original et tenir en trois lignes. Le mot de saison doit surprendre un peu et coller au moment.",
    "Réponds uniquement en appelant livrer_carte.",
  ].join("\n");

  const res = await client().messages.create({
    model: req.fast ? FAST : MODEL,
    max_tokens: 1100,
    system: VOICE_FR,
    messages: [{ role: "user", content: prompt }],
    tools: [TOOL_FR],
    tool_choice: { type: "tool", name: "livrer_carte" },
  });
  return extract(res, "livrer_carte");
}

function seasonEn(season: string): string {
  return (
    { printemps: "spring", ete: "summer", automne: "autumn", hiver: "winter" }[
      season
    ] ?? season
  );
}

function extract(res: Anthropic.Message, toolName: string): AlmanachResult {
  const tool = res.content.find((b) => b.type === "tool_use" && b.name === toolName);
  if (!tool || tool.type !== "tool_use") throw new Error("No card returned");
  const i = tool.input as Record<string, unknown>;
  const w = (i.word ?? {}) as Record<string, unknown>;
  return {
    evocation: String(i.evocation ?? ""),
    word: {
      word: String(w.word ?? ""),
      lang: w.lang ? String(w.lang) : undefined,
      gloss: String(w.gloss ?? ""),
    },
    haiku: String(i.haiku ?? ""),
    phenologyNote: String(i.phenologyNote ?? ""),
  };
}
