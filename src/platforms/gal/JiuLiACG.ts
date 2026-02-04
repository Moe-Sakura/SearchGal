import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://jiuliacg.com/";
const REGEX = />\s*<h2 class="item-heading"><a target="_blank" href="(?<URL>.*?)">(?<NAME>.*?)<\/a><\/h2>\s*<div/gs;

async function searchLiangZiACG(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL);
    url.searchParams.set("s", game);

    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const html = await response.text();
    const matches = html.matchAll(REGEX);

    const items: SearchResultItem[] = [];
    for (const match of matches) {
      if (match.groups?.NAME && match.groups?.URL && match.groups?.NAME!="资源过大无法转存，资源搜索发现重复务必看这里") {
        items.push({
          name: match.groups.NAME.trim(),
          url: match.groups.URL,
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

const LiangZiACG: Platform = {
  name: "玖黎ACG",
  color: "while",
  tags: ["LoginRep", "SplDrive"],
  magic: false,
  search: searchLiangZiACG,
};

export default LiangZiACG;