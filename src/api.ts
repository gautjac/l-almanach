// Client for /api/almanach. The opus path streams NDJSON: keepalive heartbeats
// (bare newlines) keep the connection alive during the long Opus call, then a
// final JSON line carries { result } or { error }. We read to end-of-stream and
// parse the last non-empty line. The fast path returns plain JSON; same parser
// handles both.

export interface CardEvocation {
  evocation: string;
  word: { word: string; lang?: string; gloss: string };
  haiku: string;
  phenologyNote: string;
}

export interface AlmanachRequestBody {
  /** UI / output language; "en" → the card comes back in English */
  lang: "fr" | "en";
  /** kō name in the requested language */
  koName: string;
  koKanji: string;
  /** sekki name in the requested language */
  sekkiName: string;
  /** sekki gloss in the requested language */
  sekkiGloss: string;
  season: string;
  date: string;
  /** human date label in the requested language */
  dateLabel: string;
  /** moon phase name in the requested language */
  moonPhase: string;
  moonPct: number;
  place?: string;
  fast?: boolean;
}

export async function fetchEvocation(
  body: AlmanachRequestBody,
  signal?: AbortSignal,
): Promise<CardEvocation> {
  const res = await fetch("/api/almanach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  const raw = await res.text();
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const last = lines[lines.length - 1] ?? "";

  let parsed: { result?: CardEvocation; error?: string } | null = null;
  try {
    parsed = last ? JSON.parse(last) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    const msg = parsed?.error ?? `Error ${res.status}`;
    throw new Error(msg);
  }
  if (!parsed) throw new Error("Invalid response from the server.");
  if (parsed.error) throw new Error(parsed.error);
  if (parsed.result) return parsed.result;
  throw new Error("Invalid response from the server.");
}
