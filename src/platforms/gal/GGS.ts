import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const DATA_URL = "https://gal.saop.cc/search.json";
const BASE_URL = "https://gal.saop.cc";

interface GgsItem {
  title: string;
  url: string;
}

async function searchGGS(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const response = await fetchClient(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${DATA_URL}`);
    }

    const data = await response.json() as GgsItem[];
    
    const items: SearchResultItem[] = data
      .filter(item => item.title.includes(game))
      .map(item => ({
        name: item.title,
        url: BASE_URL + item.url,
      }));

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

const GGS: Platform = {
  name: "GGS",
  color: "lime",
  tags: ["NoReq"],
  magic: false,
  search: searchGGS,
};

export default GGS;