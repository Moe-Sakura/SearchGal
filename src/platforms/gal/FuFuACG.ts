import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.fufugal.com/so";
const BASE_URL = "https://www.fufugal.com/detail";

interface FuFuACGItem {
  game_id: number;
  game_name: string;
}

interface FuFuACGResponse {
  obj: FuFuACGItem[];
}

async function searchFuFuACG(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL);
    url.searchParams.set("query", game);

    const response = await fetchClient(url, {
      headers: {
        "Accept": "application/json, text/plain, */*",
      }
    });
    
    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const data = await response.json() as FuFuACGResponse;
    
    const items: SearchResultItem[] = data.obj.map(item => ({
      name: item.game_name,
      url: `${BASE_URL}?id=${item.game_id}`,
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

const FuFuACG: Platform = {
  name: "FuFuACG",
  color: "white",
  tags: ["LoginPay"],
  magic: false,
  search: searchFuFuACG,
};

export default FuFuACG;