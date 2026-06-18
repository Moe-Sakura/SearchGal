import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.ttloli.com/";
const REGEX = /<p style="text-align: center;"> <a href=".*?" target="_blank">.*?<p style="text-align: center;"> <a href="(?<URL>.*?)" title="(?<NAME>.*?)"> <img src=/gs;

/**
 * ttloli 现在有一层 JS 反爬：首次请求返回一个仅含
 * `window.location="/?s=...&__check=<token>"` 的跳转页，需解析其中拼接的
 * 字符串字面量得到带 __check 令牌的真实地址，再次请求才能拿到结果页。
 */
async function fetchWithCheck(url: URL): Promise<string> {
  const first = await fetchClient(url);
  if (!first.ok) {
    throw new Error(`资源平台 SearchAPI 响应异常状态码 ${first.status}`);
  }
  const firstHtml = await first.text();

  const redirect = firstHtml.match(/window\.location\s*=\s*([\s\S]+?);/);
  if (!redirect) {
    // 没有跳转脚本，说明已经是结果页
    return firstHtml;
  }

  // 跳转地址由若干字符串字面量拼接而成，提取后拼回完整 URL
  const target = [...redirect[1].matchAll(/"([^"]*)"/g)].map((m) => m[1]).join("");
  const nextUrl = new URL(target, API_URL);

  const second = await fetchClient(nextUrl, {
    headers: { Referer: url.toString() },
  });
  if (!second.ok) {
    throw new Error(`资源平台 SearchAPI 响应异常状态码 ${second.status}`);
  }
  return second.text();
}

async function searchYouYuDeloli(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL);
    url.searchParams.set("s", game);
    url.searchParams.set("submit", '');

    const html = await fetchWithCheck(url);
    const matches = html.matchAll(REGEX);

    const items: SearchResultItem[] = [];
    for (const match of matches) {
      if (match.groups?.NAME && match.groups?.URL) {
        if (match.groups.NAME === "详细更新日志") {
          continue;
        }
        items.push({
          name: match.groups.NAME.trim(),
          url: match.groups.URL,
        });
      }
    }

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

const YouYuDeloli: Platform = {
  name: "忧郁的loli",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchYouYuDeloli,
};

export default YouYuDeloli;