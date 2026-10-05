import { fetchClient } from "../../utils/httpClient";
import { assertSearchPage, decodeHtmlText, uniqueItems } from "../../utils/search";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const BASE_URL = "https://www.galgamex.net";

// 新版 Next.js 站点公开 SSR 搜索页，不依赖会随部署变化的 Server Action ID。
async function searchGalgameX(game: string): Promise<PlatformSearchResult> {
  try {
    const url = new URL("/search", BASE_URL);
    url.searchParams.set("q", game.trim());
    const response = await fetchClient(url);
    if (!response.ok) throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    const html = await response.text();
    assertSearchPage(html);
    const items: SearchResultItem[] = [];
    for (const match of html.matchAll(/<a\b[^>]*href=(["'])([^"']*\/game\/[^"']+)\1[^>]*>([\s\S]*?)<\/a>/gi)) {
      const title = match[3].match(/<h[234]\b[^>]*>([\s\S]*?)<\/h[234]>/i);
      if (!title) continue;
      const href = new URL(decodeHtmlText(match[2]), BASE_URL);
      if (href.origin !== BASE_URL || !/^\/game\/[\w-]+$/.test(href.pathname)) continue;
      items.push({ name: decodeHtmlText(title[1]), url: href.href });
    }
    const results = uniqueItems(items);
    return { count: results.length, items: results };
  } catch (error) {
    return { count: -1, items: [], error: error instanceof Error ? error.message : String(error) };
  }
}

const GalgameX: Platform = {
  name: "Galgamex", color: "lime", tags: ["NoReq", "SuDrive"], magic: false, search: searchGalgameX,
};
export default GalgameX;
