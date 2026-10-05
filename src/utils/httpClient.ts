const TIMEOUT_SECONDS = 15;

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 (From www.searchgal.top) (https://github.com/Moe-Sakura/SearchGal)";

/**
 * 搜索适配器使用的缓冲 HTTP 客户端。15 秒限制覆盖连接、响应头及响应体，
 * 而不是收到响应头后就取消计时。保留调用者的取消信号与站点识别 UA。
 */
export interface FetchClientOptions extends RequestInit {
  insecure?: boolean;
}

export async function fetchClient(url: string | URL, options: FetchClientOptions = {}): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_SECONDS * 1000);
  const abort = () => controller.abort(options.signal?.reason);
  if (options.signal?.aborted) abort();
  else options.signal?.addEventListener("abort", abort, { once: true });

  const headers = new Headers(options.headers);
  if (!headers.has("User-Agent")) headers.set("User-Agent", USER_AGENT);

  let prevUnauthorized: string | undefined;
  if (options.insecure && typeof process !== "undefined" && process.env) {
    prevUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    const body = response.body ? await response.arrayBuffer() : null;
    const buffered = new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    // Response 构造器不接受 URL；保留重定向后的地址以正确生成站点链接。
    Object.defineProperty(buffered, "url", { value: response.url });
    Object.defineProperty(buffered, "redirected", { value: response.redirected });
    return buffered;
  } catch (error) {
    if (timedOut) throw new Error("资源平台 SearchAPI 请求超时", { cause: error });
    if (error instanceof Error && !options.signal?.aborted) {
      const cause = error.cause as { code?: string } | undefined;
      if (cause?.code) throw new Error(`资源平台 SearchAPI 网络错误 ${cause.code}`, { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", abort);
    if (options.insecure && typeof process !== "undefined" && process.env) {
      if (prevUnauthorized !== undefined) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevUnauthorized;
      } else {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      }
    }
  }
}
