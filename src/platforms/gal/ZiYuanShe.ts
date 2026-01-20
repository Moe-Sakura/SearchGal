import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const BASE_URL = "https://galzy.eu.org";

async function searchZiYuanShe(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const response = await fetchClient(`${BASE_URL}/api/search?q=${encodeURIComponent(game)}`);
    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }
    
    const resJson: any = await response.json();
    
    const gameListData = resJson.hits;

    if (gameListData) {
      const items: SearchResultItem[] = gameListData.map((item: any) => {
        let name: string = "未知";
        let firstTitle: string | undefined;

        for (const titleObj of item.titles) {
          if (!firstTitle) {
            firstTitle = titleObj.title;
          }
          if (["zh-Hans", "zh-Hant"].includes(titleObj.lang)) {
            name = titleObj.title;
            break;
          }
        }
        if (name === "未知" && firstTitle) {
          name = firstTitle;
        }

        return {
          name: name.trim(),
          url: `${BASE_URL}/${item.id}`,
        };
      });
      searchResult.items = items;
      searchResult.count = items.length;
    }
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

const ZiYuanShe: Platform = {
  name: "紫缘Gal",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchZiYuanShe,
};

export default ZiYuanShe;