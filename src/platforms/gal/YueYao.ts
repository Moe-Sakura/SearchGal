import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const DATA_URL = "https://www.sayafx.vip/search.xml";
const BASE_URL = "https://www.sayafx.vip";
const REGEX = /<entry>.*?<title>(.*?)<\/title>.*?<url>(.*?)<\/url>.*?<\/entry>/gs;

async function searchYueYao(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const response = await fetchClient(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${DATA_URL}`);
    }

    const xmlText = await response.text();
    const matches = xmlText.matchAll(REGEX);

    const items: SearchResultItem[] = [];
    for (const match of matches) {
      const title = match[1];
      const urlPath = match[2];

      if (title && urlPath && title.includes(game)) {
        items.push({
          name: title.trim(),
          url: BASE_URL + urlPath,
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

const YueYao: Platform = {
  name: "月谣",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchYueYao,
};

export default YueYao;