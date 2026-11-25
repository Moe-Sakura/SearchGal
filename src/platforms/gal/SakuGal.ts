import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

// SakuGAL 搜索结果页标题链接形如：
// <a href="https://game.sakugal.one/game/3775.html" class="card-title text-left text-sm sm:text-base font-semibold" title="…">标题</a>
// 封面图 <a> 带 media-diy class，不含 font-semibold，不会被误抓
const REGEX = /<a href="(?<URL>https:\/\/game\.sakugal\.one\/game\/\d+\.html)"[^>]*class="[^"]*font-semibold[^"]*"[^>]*>(?<NAME>.*?)<\/a>/gs;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

async function searchSakuGal(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const url = new URL("https://game.sakugal.one/");
    url.searchParams.set("s", game);

    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`SakuGAL 搜索响应异常状态码 ${response.status}`);
    }

    const html = await response.text();
    const items: SearchResultItem[] = [];

    for (const match of html.matchAll(REGEX)) {
      const name = stripHtml(match.groups?.NAME ?? "");
      const href = match.groups?.URL;
      if (name && href) {
        items.push({ name, url: href });
      }
    }

    searchResult.items = items;
    searchResult.count = items.length;
  } catch (error) {
    if (error instanceof Error) {
      searchResult.error = error.message;
    } else {
      searchResult.error = "An unknown error occurred";
    }
    searchResult.count = -1;
  }

  return searchResult;
}

const SakuGal: Platform = {
  name: "SakuGAL",
  color: "pink",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchSakuGal,
};

export default SakuGal;
