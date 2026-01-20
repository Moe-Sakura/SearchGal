import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.ttloli.com/";
const REGEX = /<p style="text-align: center;"> <a href=".*?" target="_blank">.*?<p style="text-align: center;"> <a href="(?<URL>.*?)" title="(?<NAME>.*?)"> <img src=/gs;

async function searchYouYuDeloli(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL);
    url.searchParams.set("s", game);
    url.searchParams.set("submit", '');

    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const html = await response.text();
    const matches = html.matchAll(REGEX);

    const items: SearchResultItem[] = [];
    for (const match of matches) {
      if (match.groups?.NAME && match.groups?.URL) {
        if (match.groups.NAME === "详细更新日志") {
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

const YouYuDeloli: Platform = {
  name: "忧郁的loli",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchYouYuDeloli,
};

export default YouYuDeloli;