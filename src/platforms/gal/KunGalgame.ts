import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult } from "../../types";

const API_URL = "https://www.kungal.com/api/v1/search/works";
const BASE_URL = "https://www.kungal.com/galgame/";

interface KunWork {
  id: string;
  display_name: string;
  localized?: Record<string, { value: string }>;
}

async function searchKunGalgame(game: string): Promise<PlatformSearchResult> {
  try {
    const url = new URL(API_URL);
    url.searchParams.set("q", game.trim());
    url.searchParams.set("page", "1");
    url.searchParams.set("limit", "12");
    url.searchParams.set("include_nsfw", "true");
    const response = await fetchClient(url);
    if (!response.ok) throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    const data = await response.json() as { items?: KunWork[]; detail?: string };
    if (!Array.isArray(data.items)) throw new Error(`资源平台 SearchAPI 返回异常：${data.detail || "缺少 items"}`);
    const items = data.items.map(item => ({
      name: (item.localized?.["zh-Hans"]?.value || item.display_name).trim(),
      url: BASE_URL + encodeURIComponent(item.id),
    }));
    return { count: items.length, items };
  } catch (error) {
    return { count: -1, items: [], error: error instanceof Error ? error.message : String(error) };
  }
}

const KunGalgame: Platform = {
  name: "鲲Galgame", color: "lime", tags: ["NoReq", "SuDrive"], magic: false, search: searchKunGalgame,
};
export default KunGalgame;
