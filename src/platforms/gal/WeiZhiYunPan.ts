import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.nullcloud.top/api/fs/search";
const BASE_URL = "https://www.nullcloud.top";

interface WeiZhiYunPanItem {
  name: string;
  parent: string;
}

interface WeiZhiYunPanResponse {
  message: string;
  data: {
    content: WeiZhiYunPanItem[];
    total: number;
  };
}

async function searchWeiZhiYunPan(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const payload = {
      parent: "/",
      keywords: game,
      scope: 0,
      page: 1,
      per_page: 999999, // Corresponds to MAX_RESULTS
      password: "",
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

    const data = await response.json() as WeiZhiYunPanResponse;

    if (data.message !== "success") {
      throw new Error(`${data.message}`);
    }

    const items: SearchResultItem[] = data.data.content.map(item => ({
      name: item.name.trim(),
      url: BASE_URL + item.parent + "/" + item.name,
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

const WeiZhiYunPan: Platform = {
  name: "未知云盘",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchWeiZhiYunPan,
};

export default WeiZhiYunPan;