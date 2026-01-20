import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://game.acgs.one/api/posts";

interface JiMengACGItem {
  title: string;
  permalink: string;
}

interface JiMengACGResponse {
  status: string;
  data: {
    dataSet: JiMengACGItem[];
  };
}

async function searchJiMengACG(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL);
    url.searchParams.set("filterType", "search");
    url.searchParams.set("filterSlug", game);
    url.searchParams.set("page", "1");
    url.searchParams.set("pageSize", "999999"); // Corresponds to MAX_RESULTS

    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const data = await response.json() as JiMengACGResponse;

    if (data.status !== "success") {
      throw new Error(`API returned status: ${data.status}`);
    }
    
    const items: SearchResultItem[] = data.data.dataSet.map(item => ({
      name: item.title.trim(),
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

const JiMengACG: Platform = {
  name: "绮梦ACG",
  color: "lime",
  tags: ["Rep", "SuDrive"],
  magic: false,
  search: searchJiMengACG,
};

export default JiMengACG;