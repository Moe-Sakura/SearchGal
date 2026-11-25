import { handleSearchRequestStream } from "./core";
import type { Platform } from "./types";
import { resolveSearchEnv } from "./utils/env";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface SearchRequestOptions {
  bindings?: Record<string, unknown>;
  waitUntil?: (task: Promise<void>) => void;
}

export function searchPreflight(): Response {
  return new Response(null, { headers: corsHeaders });
}

function searchError(error: string, status: number): Response {
  return Response.json({ error }, { status, headers: corsHeaders });
}

async function readGame(request: Request): Promise<unknown> {
  const contentType = request.headers.get("Content-Type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType === "application/json") {
    const body: { game?: unknown } | null = await request.json();
    return body?.game;
  }
  return (await request.formData()).get("game");
}

export async function handleSearchRequest(
  request: Request,
  platforms: Platform[],
  options: SearchRequestOptions = {},
): Promise<Response> {
  if (request.method === "OPTIONS") return searchPreflight();
  if (request.method !== "POST") return searchError("Method Not Allowed", 405);

  const game = await readGame(request).catch(() => undefined);
  if (typeof game !== "string" || !game.trim()) return searchError("Game name is required", 400);

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const env = resolveSearchEnv(options.bindings);
  const completion = handleSearchRequestStream(game.trim(), platforms, writer, env)
    .then(() => writer.close(), error => writer.abort(error))
    .catch(error => {
      if (!request.signal.aborted) console.error("Streaming error:", error);
    });
  options.waitUntil?.(completion);

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      ...corsHeaders,
    },
  });
}
