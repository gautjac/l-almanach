import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8"; // depth — the daily evocation
const FAST = "claude-haiku-4-5"; // low-latency option

function client(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("Server missing CLAUDE_API_KEY");
  return new Anthropic({ apiKey, baseURL: "https://api.anthropic.com" });
}

export interface AlmanachRequest {
  /** kō French name, e.g. "Les vers de terre émergent" */
  koFr: string;
  /** kō kanji */
  koKanji: string;
  /** parent sekki French name */
  sekkiFr: string;
  /** sekki gloss, e.g. "début de l'été" */
  sekkiGloss: string;
  /** season key: printemps | ete | automne | hiver */
  season: string;
  /** ISO date string for the day */
  date: string;
  /** human date label, e.g. "samedi 14 juin" */
  dateLabel: string;
  /** moon phase French name */
  moonPhase: string;
  /** moon illumination percent */
  moonPct: number;
  /** locale label — "Québec" by default, or a place name if geolocated */
  place?: string;
  /** whether to use the fast model (haiku) instead of opus */
  fast?: boolean;
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

const VOICE = `Tu es la voix de L'Almanach — un almanach poétique de l'année qui tourne, écrit en français québécois, sobre et lumineux. Tu écris comme un naturaliste-poète : précis sur le vivant, jamais mièvre, allergique au cliché et à la « voix poétique ». Tu fais sentir la saison plutôt que de la décrire. Tu connais le calendrier nordique-tempéré (vallée du Saint-Laurent) : les érables, les outardes, les lucioles, le temps des sucres, l'été indien, la poudrerie. Tu écris un français idiomatique et québécois quand c'est naturel, jamais traduit de l'anglais.`;

const TOOL: Anthropic.Tool = {
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

export async function generateCard(req: AlmanachRequest): Promise<AlmanachResult> {
  const place = req.place?.trim() || "le Québec (vallée du Saint-Laurent)";
  const prompt = [
    `Compose la carte de L'Almanach pour ${req.dateLabel}.`,
    "",
    `MICRO-SAISON (kō) : « ${req.koFr} » ${req.koKanji}`,
    `SEKKI (terme solaire) : ${req.sekkiFr} — ${req.sekkiGloss}`,
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
    system: VOICE,
    messages: [{ role: "user", content: prompt }],
    tools: [TOOL],
    tool_choice: { type: "tool", name: "livrer_carte" },
  });

  const tool = res.content.find((b) => b.type === "tool_use");
  if (!tool || tool.type !== "tool_use") throw new Error("Aucune carte renvoyée");
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
