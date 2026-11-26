import { afterEach, expect, test, vi } from "vitest";
import platform from "../src/platforms/gal/JiuLiACG.ts";

const env = { JIULIACG_BASE_URL: "https://example.test", JIULIACG_API_KEY: "fixture-key" };

afterEach(() => vi.unstubAllGlobals());

test("requests a bounded result set and preserves ranked unique results", async () => {
  const items = Array.from({ length: 75 }, (_, index) => {
    const id = index + 1;
    return { id, title: `游戏 ${id}`, path: `/games/${id}`, isNsfw: false };
  });
  items.unshift(items[0]);
  const mock = vi.fn(async () => Response.json({ items }));
  vi.stubGlobal("fetch", mock);

  const result = await platform.search(" 测试 ", env);
  expect(result.count).toBe(50);
  expect(result.items[0]).toEqual({ name: "游戏 1", url: "https://example.test/games/1" });
  expect(result.items.at(-1)?.name).toBe("游戏 50");
  const [url, options] = mock.mock.calls[0];
  expect(url.pathname).toBe("/api/integration/search");
  expect(url.searchParams.get("q")).toBe("测试");
  expect(url.searchParams.get("limit")).toBe("50");
  expect(options.headers.get("X-API-Key")).toBe("fixture-key");
});

test("cancels oversized streamed bodies without relying on Content-Length", async () => {
  const cancelled = vi.fn();
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(384 * 1024));
      controller.enqueue(new Uint8Array(256 * 1024));
    },
    cancel: cancelled,
  });
  vi.stubGlobal("fetch", vi.fn(async () => new Response(body)));

  const result = await platform.search("测试", env);
  expect(result).toMatchObject({ count: -1, items: [], error: expect.stringContaining("响应体超出大小限制") });
  expect(cancelled).toHaveBeenCalledOnce();
});
