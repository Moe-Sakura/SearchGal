import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.ggbases.com/search.so";
const BASE_URL = "https://www.ggbases.com/view.so?id=";
const REGEX = /<a index=\d+ id="bid(?<URL>\d*?)" name="title" c=".*?" target="_blank" href=".*?">(?<NAME>.*?)<\/a>/gs;

async function searchGGBases(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL);
    url.searchParams.set("p", "0");
    url.searchParams.set("title", game);

    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const html = await response.text();
    // Pre-process the HTML to remove highlighting tags
    const processedHtml = html.replace(/<\/b>/g, "").replace(/<b style='color:red'>/g, "");
    
    const matches = processedHtml.matchAll(REGEX);

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

const GGBases: Platform = {
  name: "GGBases",
  color: "lime",
  tags: ["NoReq", "BTmag"],
  magic: false,
  search: searchGGBases,
};

export default GGBases;