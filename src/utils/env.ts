import type { SearchEnv } from "../types";

/**
 * 从字符串键值对中读取非空字符串，其它情况返回 undefined。
 */
function pickString(source: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = source?.[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * 统一解析跨运行时的搜索配置。
 *
 * - Cloudflare Workers：密钥通过 `fetch(request, env, ctx)` 的 env 绑定注入，需显式传入 `binding`。
 * - Vercel Edge / Netlify Functions：通过 `process.env` 注入，`binding` 可省略。
 *
 * 两者都存在时优先使用运行时绑定。
 */
export function resolveSearchEnv(binding?: Record<string, unknown>): SearchEnv {
  const processEnv =
    typeof process !== "undefined" && process.env
      ? (process.env as Record<string, unknown>)
      : undefined;

  return {
    TOUCHGAL_API_TOKEN:
      pickString(binding, "TOUCHGAL_API_TOKEN") ?? pickString(processEnv, "TOUCHGAL_API_TOKEN"),
    CHARLOTTE_BASE_URL:
      pickString(binding, "CHARLOTTE_BASE_URL") ?? pickString(processEnv, "CHARLOTTE_BASE_URL"),
    CHARLOTTE_API_KEY:
      pickString(binding, "CHARLOTTE_API_KEY") ?? pickString(processEnv, "CHARLOTTE_API_KEY"),
  };
}
