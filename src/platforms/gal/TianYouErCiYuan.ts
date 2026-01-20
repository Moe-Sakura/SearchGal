import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.tiangal.com/search/";
const REGEX = /<h2>\s*<a href="(?<URL>[^"]+)" title="(?<NAME>[^"]+)"/gs;

async function searchTianYouErCiYuan(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL + encodeURIComponent(game)); // URL path parameter
    
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
          url: new URL(match.groups.URL, API_URL).toString(),
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

const TianYouErCiYuan: Platform = {
  name: "天游二次元",
  color: "white",
  tags: ["LoginPay", "MixDrive"],
  magic: true,
  search: searchTianYouErCiYuan,
};

export default TianYouErCiYuan;