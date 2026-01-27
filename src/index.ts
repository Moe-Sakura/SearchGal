import { handleSearchRequestStream, PLATFORMS_GAL, PLATFORMS_PATCH } from "./core";
export interface Env {
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function handleSearch(request: Request, env: Env, ctx: ExecutionContext, platforms: any[]) {
  try {
    const formData = await request.formData();
    const game = formData.get("game") as string;


    if (!game || typeof game !== 'string') {
      return new Response(JSON.stringify({ error: "Game name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // 将异步任务交给 waitUntil 来处理，确保它能完整执行
    ctx.waitUntil(
      handleSearchRequestStream(game.trim(), platforms, writer)
        .catch(err => console.error("Streaming error:", err))
        .finally(() => writer.close())
    );

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        ...corsHeaders
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      const origin = url.origin;
      return Response.redirect(`https://searchgal.top?api=${encodeURIComponent(origin)}`, 302);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === "POST") {
      if (url.pathname === "/gal") {
        return handleSearch(request, env, ctx, PLATFORMS_GAL);
      }
      if (url.pathname === "/patch") {
        return handleSearch(request, env, ctx, PLATFORMS_PATCH);
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};