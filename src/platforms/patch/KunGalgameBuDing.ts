import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

// moyu.moe（鲲Galgame补丁）已升级为 Nuxt /api/v1 接口：
// POST /api/v1/search  body: { q, limit, page }
// 返回: { code, message, data: { items: [{ id, name_zh_cn, name_ja_jp, ... }] } }
const API_URL = "https://www.moyu.moe/api/v1/search";
const BASE_URL = "https://www.moyu.moe/patch/";

interface KunGalgameBuDingItem {
  id: number;
  name_zh_cn?: string;
  name_ja_jp?: string;
  name_en_us?: string;
  name_zh_tw?: string;
}

interface KunGalgameBuDingResponse {
  code: number;
  message?: string;
  data?: {
    items?: KunGalgameBuDingItem[];
  } | null;
}

async function searchKunGalgameBuDing(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const payload = {
      q: game.trim(),
      limit: 24, // Hardcoded as per original script
      page: 1,
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

    if (data.code !== 0) {
      throw new Error(`资源平台 SearchAPI 返回错误码 ${data.code}${data.message ? `: ${data.message}` : ""}`);
    }

    const list = data.data?.items ?? [];

    const items: SearchResultItem[] = list.map(item => {
      const name = (item.name_zh_cn
        || item.name_ja_jp
        || item.name_en_us
        || item.name_zh_tw
        || "").trim();

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
