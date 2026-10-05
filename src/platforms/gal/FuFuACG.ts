import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const BASE_URL = "https://www.fufugal.com";
interface FuFuGame { game_id: number; game_name: string }

async function searchFuFuACG(game: string): Promise<PlatformSearchResult> {
  try {
    const url = new URL("/so", BASE_URL);
    url.searchParams.set("query", game.trim());
    const response = await fetchClient(url, { headers: { Accept: "application/json, text/plain, */*" } });
    if (!response.ok) throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    const data = await response.json() as { code: number; msg?: string; obj?: FuFuGame[] };
    if (data.code !== 0 || !Array.isArray(data.obj)) {
      throw new Error(`资源平台 SearchAPI 返回异常 ${data.code}：${data.msg || "缺少 obj"}`);
    }
    const query = game.trim().toLowerCase();
    // 该站在无匹配时返回随机推荐；不能将推荐当作搜索结果。
    const items: SearchResultItem[] = data.obj
      .filter(item => item.game_name.toLowerCase().includes(query))
      .map(item => ({
        name: item.game_name.trim(),
        url: `${BASE_URL}/detail?id=${item.game_id}`,
      }));
    return { count: items.length, items };
  } catch (error) {
    return { count: -1, items: [], error: error instanceof Error ? error.message : String(error) };
  }
}

const FuFuACG: Platform = {
  name: "FuFuACG",
  color: "white",
  tags: ["LoginPay"],
  magic: false,
  search: searchFuFuACG,
};

export default FuFuACG;
