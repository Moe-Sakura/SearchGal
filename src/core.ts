import type { Platform, SearchEnv, StreamProgress, StreamResult } from "./types";
import platformsGal from "./platforms/gal";
import platformsPatch from "./platforms/patch";

/**
 * 将平台搜索结果格式化为自定义的流事件字符串 (JSON + 换行符)。
 */
function formatStreamEvent(data: object): string {
  return `${JSON.stringify(data)}\n`;
}

/**
 * 处理搜索请求并以流的形式写入结果。
 * @param game 要搜索的游戏名称。
 * @param platforms 要使用的平台列表。
 * @param writer 用于写入 SSE 事件的 WritableStreamDefaultWriter。
 */
export async function handleSearchRequestStream(
  game: string,
  platforms: Platform[],
  writer: WritableStreamDefaultWriter<Uint8Array>,
  env: SearchEnv = {},
): Promise<void> {
  // 记录搜索关键词
  console.log(JSON.stringify({
    message: `搜索关键词: ${game}`,
    level: "info",
  }));
  const encoder = new TextEncoder();
  const total = platforms.length;
  let completed = 0;

  // 发送初始的总数信息
  await writer.write(encoder.encode(formatStreamEvent({ total })));

  const searchPromises = platforms.map(async (platform) => {
    let result;
    try {
      result = await platform.search(game, env);
    } catch (error) {
      result = { count: -1, items: [], error: error instanceof Error ? error.message : String(error) };
    }
    completed++;
    const progress: StreamProgress = { completed, total };
    if (result.count > 0 || result.error) {
      if (result.error) {
        console.log(JSON.stringify({
          message: `平台 ${platform.name} 搜索错误: ${result.error}`,
          level: "error",
        }));
      }
      const streamResult: StreamResult = {
        name: platform.name,
        color: result.error ? "red" : platform.color,
        tags: platform.tags,
        items: result.items,
        error: result.error,
      };
      await writer.write(encoder.encode(formatStreamEvent({ progress, result: streamResult })));
    } else {
      await writer.write(encoder.encode(formatStreamEvent({ progress })));
    }
  });

  // 等待所有搜索完成
  await Promise.all(searchPromises);

  // 发送完成信号
  await writer.write(encoder.encode(formatStreamEvent({ done: true })));
}

export const PLATFORMS_GAL = platformsGal;
export const PLATFORMS_PATCH = platformsPatch;