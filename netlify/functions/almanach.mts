import type { Context } from "@netlify/functions";
import { generateCard, type AlmanachRequest } from "./lib/almanach.ts";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: AlmanachRequest;
  try {
    body = (await req.json()) as AlmanachRequest;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const koName = body?.koName ?? body?.koFr;
  const sekkiName = body?.sekkiName ?? body?.sekkiFr;
  if (!koName || !sekkiName) {
    return json({ error: "Missing kō / sekki." }, 400);
  }

  // Fast (haiku) path returns plain JSON — it's quick enough not to need NDJSON.
  if (body.fast) {
    try {
      const result = await generateCard(body);
      return json({ result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      return json({ error: message }, 500);
    }
  }

  // Opus path: the call can run ~25–55s, longer than Netlify's idle timeout.
  // Stream NDJSON — a bare-newline heartbeat every 3s keeps the connection alive,
  // then a final {result|error} line carries the payload. The client reads to
  // end-of-stream and parses the last non-empty JSON line.
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let done = false;
      const beat = setInterval(() => {
        if (!done) {
          try {
            controller.enqueue(enc.encode("\n"));
          } catch {
            /* closed */
          }
        }
      }, 3000);

      try {
        const result = await generateCard(body);
        done = true;
        clearInterval(beat);
        controller.enqueue(enc.encode(JSON.stringify({ result }) + "\n"));
      } catch (err) {
        done = true;
        clearInterval(beat);
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        controller.enqueue(enc.encode(JSON.stringify({ error: message }) + "\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
};
