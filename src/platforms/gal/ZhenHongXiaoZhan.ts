import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.shinnku.com/search";
const BASE_URL = "https://www.shinnku.com";
const REGEX = /hover:underline" href="(?<URL>.+?)">\s*(?<NAME>.+?)\s*<\/a>/gs;

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

    const html = await response.text();
    const matches = html.matchAll(REGEX);

    const items: SearchResultItem[] = [];
    for (const match of matches) {
      if (match.groups?.NAME && match.groups?.URL) {
        items.push({
          name: match.groups.NAME.trim(),
          url: BASE_URL + match.groups.URL,
        });
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

const ZhenHongXiaoZhan: Platform = {
  name: "真红小站",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchZhenHongXiaoZhan,
};

export default ZhenHongXiaoZhan;