import { fetchClient } from "./httpClient";
import { assertSearchPage, parsePostHeadings } from "./search";
import type { SearchResultItem } from "../types";

export async function searchWordPress(game: string, baseUrl: string): Promise<SearchResultItem[]> {
  const url = new URL(baseUrl);
  url.searchParams.set("s", game.trim());
  const response = await fetchClient(url);
  if (!response.ok) throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
  const html = await response.text();
  assertSearchPage(html);
  return parsePostHeadings(html, response.url || baseUrl);
}
