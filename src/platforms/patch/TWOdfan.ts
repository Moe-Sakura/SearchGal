import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://2dfan.com/subjects/search";
const BASE_URL = "https://2dfan.com";
const REGEX = /<h4 class="media-heading"><a target="_blank" href="(?<URL>.*?)">(?<NAME>.*?)<\/a><\/h4>/gs;

async function searchTWOdfan(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL);
    url.searchParams.set("keyword", game);

    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }
    
    const html: string = await response.text();
    
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

const TWOdfan: Platform = {
  name: "2dfan",
  color: "white",
  tags: ["LoginPay", "magic", "MixDrive"],
  magic: true,
  search: searchTWOdfan,
};

export default TWOdfan;