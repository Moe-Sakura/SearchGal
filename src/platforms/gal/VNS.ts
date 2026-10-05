import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const INDEX_URL = "https://gal.saop.cc/data.json";

interface VNSItem {
  title: string;
  permalink: string;
}

let cachedItems: VNSItem[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000;

async function loadItems(): Promise<VNSItem[]> {
  const now = Date.now();
  if (cachedItems && now - cacheTime < CACHE_TTL) {
    return cachedItems;
  }

  const response = await fetchClient(INDEX_URL);
  if (!response.ok) {
    throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
  }

  const data = await response.json() as VNSItem[];
  cachedItems = data;
  cacheTime = now;
  return data;
}

async function searchVNS(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const allItems = await loadItems();
    const query = game.trim().toLowerCase();

    const items: SearchResultItem[] = allItems
      .filter((item) => item.title.toLowerCase().includes(query))
      .map((item) => ({
        name: item.title,
        url: item.permalink,
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

const VNS: Platform = {
  name: "VNS",
  color: "lime",
  tags: ["NoReq", "Fast"],
  magic: false,
  search: searchVNS,
};

export default VNS;
