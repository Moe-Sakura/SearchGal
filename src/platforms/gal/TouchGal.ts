import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchEnv, SearchResultItem } from "../../types";

// 主站 www.touchgal.ink 已整站开启 Cloudflare JS 质询，无法在服务端直接抓取。
// 改用官方元数据 API（developer.touchgal.com），需在开发者门户申请 tgal_live token。
const API_URL = "https://developer.touchgal.com/api/v1/games/search";
// 结果链接仍指向主站条目页 https://www.touchgal.ink/<uniqueId>（用户浏览器可自行通过质询）。
const BASE_URL = "https://www.touchgal.ink/";

// 官方 API 关键词长度限制：3-100 Unicode 字符。
const MIN_KEYWORD_LENGTH = 3;
const MAX_KEYWORD_LENGTH = 100;

interface TouchGalGame {
  name: string;
  uniqueId: string;
}

interface TouchGalResponse {
  success: boolean;
  data?: {
    items?: TouchGalGame[];
  };
  error?: {
    code?: string;
    message?: string;
  };
}

async function searchTouchGal(game: string, env?: SearchEnv): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  const token = env?.TOUCHGAL_API_TOKEN;
  // 未配置 API token 时静默跳过，避免未配置的部署每次搜索都出现红色报错。
  if (!token) {
    return searchResult;
  }

  const keyword = game.trim();
  // 关键词长度不符合官方 API 约束（3-100 字符）时直接返回空结果，避免必然的 BAD_REQUEST。
  if ([...keyword].length < MIN_KEYWORD_LENGTH || [...keyword].length > MAX_KEYWORD_LENGTH) {
    return searchResult;
  }

  try {
    const url = new URL(API_URL);
    url.searchParams.set("keyword", keyword);
    url.searchParams.set("page", "1");
    url.searchParams.set("limit", "12"); // 与原脚本保持一致
    url.searchParams.set("allowNsfw", "true"); // 包含全年龄与 R18 条目

    const response = await fetchClient(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });

    // 预认证 IP 限流等场景可能返回非 JSON 响应体
    let data: TouchGalResponse | undefined;
    try {
      data = await response.json() as TouchGalResponse;
    } catch {
      data = undefined;
    }

    if (!response.ok || !data?.success) {
      const code = data?.error?.code ?? response.status;
      const message = data?.error?.message ?? `HTTP ${response.status}`;
      throw new Error(`资源平台 SearchAPI 响应异常 ${code}：${message}`);
    }

    if (!Array.isArray(data.data?.items)) throw new Error("资源平台 SearchAPI 返回异常：缺少 items");
    const items: SearchResultItem[] = data.data.items.map(item => ({
      name: item.name.trim(),
      url: BASE_URL + item.uniqueId,
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

const TouchGal: Platform = {
  name: "TouchGal",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchTouchGal,
};

export default TouchGal;
