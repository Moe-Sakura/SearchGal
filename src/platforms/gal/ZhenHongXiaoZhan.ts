import { load } from "cheerio/slim";
import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.shinnku.com/search";
const BASE_URL = "https://www.shinnku.com";

async function searchZhenHongXiaoZhan(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL);
    url.searchParams.set("q", game);

    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const $ = load(await response.text());
    const items: SearchResultItem[] = [];
    for (const link of $('a[class~="hover:underline"][href]').toArray()) {
      const href = $(link).attr("href")?.trim();
      const name = $(link).text().trim();
      if (!href || !name) continue;
      let resultUrl: URL;
      try {
        resultUrl = new URL(href, BASE_URL);
      } catch {
        continue;
      }
      if (resultUrl.origin !== BASE_URL) continue;
      items.push({ name, url: resultUrl.href });
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

const ZhenHongXiaoZhan: Platform = {
  name: "真红小站",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchZhenHongXiaoZhan,
};

export default ZhenHongXiaoZhan;
