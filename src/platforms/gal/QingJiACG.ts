import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.qingju.org/";
const REGEX = /" class="lazyload fit-cover radius8">.*?<h2 class="item-heading"><a href="(?<URL>.*?)">(?<NAME>.*?)<\/a><\/h2>/gs;

async function searchQingJiACG(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL);
    url.searchParams.set("s", game);
    url.searchParams.set("type", "post");

    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const html = await response.text();
    const matches = html.matchAll(REGEX);

    const items: SearchResultItem[] = [];
    for (const match of matches) {
      if (match.groups?.NAME && match.groups?.URL) {
        // Original Python script had a filter: if "</p>" in i.group("URL"): continue
        // This is likely to filter out malformed URLs or irrelevant matches.
        if (match.groups.URL.includes("</p>")) {
          continue;
        }
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

const QingJiACG: Platform = {
  name: "青桔ACG",
  color: "lime",
  tags: ["NoReq", "SplDrive"],
  magic: false,
  search: searchQingJiACG,
};

export default QingJiACG;