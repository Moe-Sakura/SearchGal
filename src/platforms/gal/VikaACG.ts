import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.vikacg.com/api/vikacg/v1/getPosts";

/**
 * 响应体最小类型（按你贴的 JSON）
 */
type VikaGetPostsResponse = {
  status?: string;
  code?: number;
  message?: string;
  statusMessage?: string;
  data?: {
    list?: Array<{
      id: number;
      title: string;
      // 其他字段这里不需要就不展开了
    }>;
    count?: number;
    paged?: number;
    page_count?: number;
    pages?: number;
  };
};

const POST_URL = (id: number) => `https://www.vikacg.com/p/${id}`;

async function searchVikaACG(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const response = await fetchClient(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order: "updated_at",
        sort: "desc",
        status: null,
        search: game,
        page_count: 50,
        paged: 1,
        category: null,
        tag: null,
        rating: null,
        is_pinned: false,
        user_id: null,
      }),
    });

    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const json: VikaGetPostsResponse = await response.json();

    if (json.status !== "success" || !json.data) {
      const msg = json.message || json.statusMessage || "接口返回非 success";
      throw new Error(`资源平台 SearchAPI 返回异常：${msg}`);
    }

    const list = json.data.list ?? [];
    const items: SearchResultItem[] = list
      .filter((p) => typeof p?.id === "number" && typeof p?.title === "string")
      .map((p) => ({
        name: p.title.trim(),
        url: POST_URL(p.id),
      }));

    searchResult.items = items;

    // ✅ 建议 count 用后端总数（data.count），否则用本页长度兜底
    searchResult.count = typeof json.data.count === "number" ? json.data.count : items.length;
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

const VikaACG: Platform = {
  name: "VikaACG",
  color: "gold",
  tags: ["LoginPay", "magic", "MixDrive"],
  magic: true,
  search: searchVikaACG,
};

export default VikaACG;
