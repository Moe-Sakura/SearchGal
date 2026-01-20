import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.moyu.moe/api/search";
const BASE_URL = "https://www.moyu.moe/patch/";

interface KunGalgameBuDingItem {
  id: number;
  name?: Record<string, string | undefined> | string;
}

interface KunGalgameBuDingResponse {
  galgames: KunGalgameBuDingItem[];
}

async function searchKunGalgameBuDing(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const payload = {
      limit: 24, // Hardcoded as per original script
      page: 1,
      query: game.split(/\s+/), // Split by whitespace
      searchOption: {
        searchInAlias: true,
        searchInIntroduction: false,
        searchInTag: false,
      },
    };

    const response = await fetchClient(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const data = await response.json() as KunGalgameBuDingResponse;

    const items: SearchResultItem[] = data.galgames.map(item => {
      const nameByLocale = typeof item.name === "object" && item.name !== null
        ? item.name
        : undefined;
      const localizedName = nameByLocale
        ? (nameByLocale["zh-cn"]
          || nameByLocale["ja-jp"]
          || nameByLocale["en-us"])
        : undefined;
      const name = (localizedName && localizedName.trim())
        || (typeof item.name === "string" ? item.name : "");

      return {
        name,
        url: `${BASE_URL}${item.id}/introduction`,
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

const KunGalgameBuDing: Platform = {
  name: "鲲Galgame补丁",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchKunGalgameBuDing,
};

export default KunGalgameBuDing;