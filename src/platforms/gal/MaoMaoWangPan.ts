import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://catcat.cloud/api/fs/search";
const BASE_URL = "https://catcat.cloud";

interface MaoMaoItem {
  name: string;
  parent: string;
}

interface MaoMaoResponse {
  message: string;
  data: {
    content: MaoMaoItem[];
    total: number;
  };
}

async function searchMaoMaoWangPan(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const payload = {
      parent: "/GalGame/",
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

    const data = await response.json() as MaoMaoResponse;

    if (data.message !== "success") {
      throw new Error(`${data.message}`);
    }

    const items: SearchResultItem[] = data.data.content
      .filter(item => item.parent.startsWith("/GalGame/SP后端1[GalGame分区]/"))
      .map(item => ({
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

const MaoMaoWangPan: Platform = {
  name: "猫猫网盘",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchMaoMaoWangPan,
};

export default MaoMaoWangPan;