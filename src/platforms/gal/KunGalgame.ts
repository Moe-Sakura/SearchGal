import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.kungal.com/api/search";
const BASE_URL = "https://www.kungal.com/zh-cn/galgame/";

interface KunGalgameItem {
  id: number;
  name: {
    "zh-cn": string;
    "ja-jp": string;
  };
}

async function searchKunGalgame(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL);
    url.searchParams.set("keywords", game);
    url.searchParams.set("type", "galgame");
    url.searchParams.set("page", "1");
    url.searchParams.set("limit", "12"); // Hardcoded as per original script

    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const data = await response.json() as KunGalgameItem[];
    
    const items: SearchResultItem[] = data.map(item => {
      const zhName = item.name["zh-cn"]?.trim();
      const jpName = item.name["ja-jp"]?.trim();
      return {
        name: zhName || jpName,
        url: BASE_URL + item.id,
      };
    });

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

const KunGalgame: Platform = {
  name: "鲲Galgame",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchKunGalgame,
};

export default KunGalgame;