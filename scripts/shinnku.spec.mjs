import { afterEach, expect, test, vi } from "vitest";
import platform from "../src/platforms/gal/ZhenHongXiaoZhan.ts";

afterEach(() => vi.unstubAllGlobals());

test("parses result links when attributes move or titles contain markup and entities", async () => {
  const fetchMock = vi.fn(async () => new Response(`
    <a class="hover:underline" href="/posts/old">旧版结果</a>
    <a href="/posts/new?one=1&amp;two=2" class="hover:underline other">
      <strong>新 &amp; 标题</strong>
    </a>
    <a class="hover:underline" href="https://www.shinnku.com/posts/absolute">绝对地址</a>
    <a href="/navigation">菜单</a>
    <a class="hover:underline" href="https://other.example/">站外链接</a>
  `));
  vi.stubGlobal("fetch", fetchMock);

  await expect(platform.search("千恋万花")).resolves.toEqual({
    count: 3,
    items: [
      { name: "旧版结果", url: "https://www.shinnku.com/posts/old" },
      { name: "新 & 标题", url: "https://www.shinnku.com/posts/new?one=1&two=2" },
      { name: "绝对地址", url: "https://www.shinnku.com/posts/absolute" },
    ],
  });
  const [url] = fetchMock.mock.calls[0];
  expect(url.searchParams.get("q")).toBe("千恋万花");
});
