import { PLATFORMS_GAL, PLATFORMS_PATCH } from "./core";
import { buildRedirectResponse } from "./redirect";
import { handleSearchRequest, searchPreflight } from "./searchHandler";

export type Env = Record<string, unknown>;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { origin, pathname } = new URL(request.url);
    if (pathname === "/") return buildRedirectResponse(origin);
    if (request.method === "OPTIONS") return searchPreflight();

    const platforms = pathname === "/gal" ? PLATFORMS_GAL : pathname === "/patch" ? PLATFORMS_PATCH : undefined;
    if (request.method !== "POST" || !platforms) {
      return new Response("Not Found", { status: 404 });
    }

    return handleSearchRequest(request, platforms, {
      bindings: env,
      waitUntil: task => ctx.waitUntil(task),
    });
  },
};
