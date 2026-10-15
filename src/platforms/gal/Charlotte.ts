import type { Platform, PlatformSearchResult, SearchEnv, SearchResultItem } from "../../types";
import { fetchClient } from "../../utils/httpClient";

const RESULT_LIMIT = 12;

function failure(message: string): PlatformSearchResult {
  return { count: -1, items: [], error: `Charlotte SearchAPI：${message}` };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function searchCharlotte(game: string, env?: SearchEnv): Promise<PlatformSearchResult> {
  const baseUrl = env?.CHARLOTTE_BASE_URL?.trim();
  const apiKey = env?.CHARLOTTE_API_KEY;
  // 和 TouchGal 一样，未配置的部署自动跳过这个可选搜索源。
  if (!baseUrl || !apiKey) return { count: 0, items: [] };

  const keyword = game.trim();
  if (!keyword || [...keyword].length > 100 || keyword.includes("\0")) {
    return { count: 0, items: [] };
  }

  let site: URL;
  try {
    site = new URL(baseUrl);
  } catch {
    return failure("CHARLOTTE_BASE_URL 必须为站点根地址");
  }
  const localHttp = site.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(site.hostname);
  if ((site.protocol !== "https:" && !localHttp) || site.username || site.password
    || site.pathname !== "/" || site.search || site.hash) {
    return failure("CHARLOTTE_BASE_URL 必须为 HTTPS 站点根地址，本地开发可使用 HTTP localhost");
  }

  const url = new URL("/api/integration/search", site);
  url.searchParams.set("q", keyword);
  url.searchParams.set("limit", String(RESULT_LIMIT));

  let response: Response;
  try {
    response = await fetchClient(url, {
      headers: { "X-API-Key": apiKey, "Accept": "application/json" },
      // 不跟随重定向，防止自定义密钥头被转发到其他站点。
      redirect: "manual",
    });
  } catch {
    // 不向日志/流响应透传底层异常，以免包含密钥或请求头。
    return failure("请求失败或超时，请检查站点地址和网络连接");
  }

  if (response.status === 401) return failure("认证失败（HTTP 401），请核对专用搜索密钥");
  if (response.status === 429) return failure("请求过于频繁（HTTP 429），请稍后重试");
  if (response.status >= 300 && response.status < 400) {
    return failure("接口发生重定向，请将 CHARLOTTE_BASE_URL 设置为最终站点地址");
  }
  if (!response.ok) return failure(`响应异常 HTTP ${response.status}`);

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return failure("响应不是有效 JSON，请检查接口地址及 Cloudflare 人机质询规则");
  }
  if (!isRecord(data) || !Array.isArray(data.items) || data.items.length > RESULT_LIMIT) {
    return failure("响应格式错误：缺少 items 数组或结果数量超过限制");
  }

  const items: SearchResultItem[] = [];
  const seenIds = new Set<number>();
  for (const item of data.items) {
    if (!isRecord(item) || typeof item.id !== "number" || !Number.isSafeInteger(item.id) || item.id <= 0
      || typeof item.title !== "string" || !item.title.trim()
      || item.path !== `/games/${item.id}` || typeof item.isNsfw !== "boolean") {
      return failure("响应格式错误：游戏条目不符合接口约定");
    }
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    // 仅映射标题和本站详情页链接，保持服务端排序，不输出资源对象或下载凭据。
    items.push({ name: item.title.trim(), url: new URL(item.path, site).href });
  }
  return { count: items.length, items };
}

const Charlotte: Platform = {
  name: "Charlotte",
  color: "white",
  tags: ["Login"],
  magic: false,
  search: searchCharlotte,
};

export default Charlotte;
