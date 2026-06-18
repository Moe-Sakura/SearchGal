import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

// KisuGal 与 TouchGal 同为 kun-touchgal-next 系统，搜索接口结构一致。
const API_URL = "https://www.kisuacg.moe/api/search";
const BASE_URL = "https://www.kisuacg.moe/";

interface KisuGalItem {
  name: string;
  unique_id?: string;
  uniqueId?: string;
}

async function searchKisuGal(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const payload = {
      queryString: JSON.stringify([{ type: "keyword", name: game }]),
      limit: 12,
      searchOption: {
        searchInIntroduction: false,
        searchInAlias: true,
        searchInTag: false,
      },
      page: 1,
      selectedType: "all",
      selectedLanguage: "all",
      selectedPlatform: "all",
      sortField: "resource_update_time",
      sortOrder: "desc",
      selectedYears: ["all"],
      selectedMonths: ["all"],
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

    const data = await response.json() as { galgames: KisuGalItem[] };

    const items: SearchResultItem[] = data.galgames.map(item => ({
      name: item.name.trim(),
      url: BASE_URL + (item.unique_id ?? item.uniqueId ?? ""),
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

const KisuGal: Platform = {
  name: "KisuGal",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchKisuGal,
};

export default KisuGal;
