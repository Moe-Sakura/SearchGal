import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://gallibrary.pw/galgame/game/manyGame";
const BASE_URL = "https://gallibrary.pw/game.html?id=";

interface GalTuShuGuanItem {
  id: number;
  listGameText: { data: string; type: number; version: number }[]; // Corrected type
}

interface GalTuShuGuanResponse {
  code: number;
  data?: GalTuShuGuanItem[];
}

// A helper function to strip HTML tags from a string
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

async function searchGalTuShuGuan(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL);
    url.searchParams.set("page", "1");
    url.searchParams.set("type", "1");
    url.searchParams.set("count", "1000"); // Hardcoded as per original script
    url.searchParams.set("keyWord", game);

    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const data = await response.json() as GalTuShuGuanResponse;

    // console.log("GAL图书馆 API Response Data:", JSON.stringify(data, null, 2)); // Keep for debugging if needed

    if (data.code !== 200) {
      throw new Error(`API returned code ${data.code}`);
    }
    
    if (!data.data) {
        throw new Error("API response 'data' field is missing or null.");
    }

    const items: SearchResultItem[] = data.data.map(item => {
      // Access item.listGameText[1].data and strip HTML
      const name = item.listGameText[1]?.data; // Use optional chaining for safety
      if (!name) {
          console.warn(`GAL图书馆: Missing name data for item ID ${item.id}`);
          return null; // Skip this item
      }
      return {
        name: stripHtml(name),
        url: BASE_URL + item.id,
      };
    }).filter(Boolean) as SearchResultItem[]; // Filter out nulls

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

const GalTuShuGuan: Platform = {
  name: "GAL图书馆",
  color: "lime",
  tags: ["NoReq", "SplDrive"],
  magic: false,
  search: searchGalTuShuGuan,
};

export default GalTuShuGuan;