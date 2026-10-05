import type { SearchResultItem } from "../types";

export function decodeHtmlText(value: string): string {
  const entities: Record<string, string> = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  };
  return value.replace(/<[^>]*>/g, "").replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, key) => {
    if (!key.startsWith("#")) return entities[key.toLowerCase()] ?? entity;
    const code = key[1].toLowerCase() === "x" ? parseInt(key.slice(2), 16) : Number(key.slice(1));
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  }).trim();
}

export function uniqueItems(items: SearchResultItem[]): SearchResultItem[] {
  return [...new Map(items.filter(item => item.name && /^https?:\/\//.test(item.url)).map(item => [item.url, item])).values()];
}

/** 只解析文章标题链接，不解析侧栏、封面或广告。兼容属性顺序和单/双引号。 */
export function parsePostHeadings(html: string, baseUrl: string): SearchResultItem[] {
  const items: SearchResultItem[] = [];
  for (const heading of html.matchAll(/<h[234]\b[^>]*class=["'][^"']*(?:item-heading|entry-title|post-list-title|media-heading)[^"']*["'][^>]*>([\s\S]*?)<\/h[234]>/gi)) {
    const anchor = heading[1].match(/<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/i);
    if (!anchor) continue;
    const url = new URL(decodeHtmlText(anchor[2]), baseUrl);
    if (url.origin !== new URL(baseUrl).origin) continue;
    items.push({ name: decodeHtmlText(anchor[3]), url: url.href });
  }
  return uniqueItems(items);
}

export function assertSearchPage(html: string): void {
  if (/<title>\s*(?:Just a moment|Attention Required)|id=["']challenge-form["']|window\.location\s*=\s*["']\/\?__ch/i.test(html)) {
    throw new Error("资源平台要求人机验证，不能在服务端直接搜索");
  }
}
