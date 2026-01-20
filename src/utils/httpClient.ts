const TIMEOUT_SECONDS = 15;

const HEADERS = {
  "Connection": "close",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 (From SearchGal.homes) (https://github.com/Moe-Sakura/SearchGal)",
};

/**
 * 一个封装了原生 fetch 并增加了超时功能的 HTTP 客户端。
 * @param url 请求的 URL。
 * @param options fetch 的请求选项。
 * @returns 返回一个 Promise<Response>。
 */
export async function fetchClient(
  url: string | URL,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_SECONDS * 1000);

  const finalOptions: RequestInit = {
    ...options,
    headers: {
      ...HEADERS,
      ...options.headers,
    },
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, finalOptions);
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`资源平台 SearchAPI 请求超时`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}