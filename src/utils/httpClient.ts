const TIMEOUT_SECONDS = 15;

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 (From www.searchgal.top) (https://github.com/Moe-Sakura/SearchGal)";

export class ResponseBodyTooLargeError extends Error {}

async function readBoundedBody(body: ReadableStream<Uint8Array>, limit: number): Promise<ArrayBuffer> {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        void reader.cancel().catch(() => {});
        throw new ResponseBodyTooLargeError(`响应体超过 ${limit} 字节`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return buffer.buffer;
}

/**
 * 搜索适配器使用的缓冲 HTTP 客户端。15 秒限制覆盖连接、响应头及响应体，
 * 而不是收到响应头后就取消计时。保留调用者的取消信号与站点识别 UA。
 */
export async function fetchClient(
  url: string | URL,
  options: RequestInit = {},
  maxResponseBytes?: number,
): Promise<Response> {
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

  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    let body: ArrayBuffer | null = null;
    if (response.body) {
      body = maxResponseBytes === undefined
        ? await response.arrayBuffer()
        : await readBoundedBody(response.body, maxResponseBytes);
    }
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
  }
}
