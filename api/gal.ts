import { handleSearchRequestStream, PLATFORMS_GAL } from '../src/core';

export const config = {
    runtime: 'edge',
};

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(request: Request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

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

        // 异步执行搜索
        (async () => {
            try {
                await handleSearchRequestStream(game.trim(), PLATFORMS_GAL, writer);
            } catch (err) {
                console.error("Streaming error:", err);
            } finally {
                await writer.close();
            }
        })();

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
