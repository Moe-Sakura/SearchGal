import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

// 新版搜索改为 POST；使用已实测可用的主站域名，避免绑定临时 CDN 域名。
const API_URL = "https://inarigal.com/api/search";
const BASE_URL = "https://inarigal.com/detail/";

interface DaoHeGalItem {
  id: number;
  title_cn?: string;
  title_jp?: string;
}

interface DaoHeGalResponse {
  success: boolean;
  data: {
    list: DaoHeGalItem[];
  };
}

async function searchDaoHeGal(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const response = await fetchClient(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: game.trim(), page: 1, pageSize: 24, nsfw: "1" }),
    });
    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const data = await response.json() as DaoHeGalResponse;

    if (!data.success) {
      throw new Error("API returned success: false");
    }
    
    const items: SearchResultItem[] = data.data.list.map(item => ({
      name: (item.title_cn || item.title_jp || "").trim(),
      url: BASE_URL + item.id,
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

const DaoHeGal: Platform = {
  name: "稻荷GAL",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchDaoHeGal,
};

export default DaoHeGal;
