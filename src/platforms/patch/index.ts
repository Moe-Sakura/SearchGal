import type { Platform } from "../../types";
import KunGalgameBuDing from "./KunGalgameBuDing";
// import TWOdfan from "./TWOdfan"; // 已禁用：全站 Cloudflare 人机防护拦截，返回 403，服务端无法直接抓取，故停用

const platforms: Platform[] = [
  KunGalgameBuDing,
  // TWOdfan, // 已禁用
];

export default platforms;
