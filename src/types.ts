// 单个搜索结果
export interface SearchResultItem {
  name: string;
  url: string;
  tags?: string[];
}

// 平台搜索的返回值
export interface PlatformSearchResult {
  items: SearchResultItem[];
  count: number;
  error?: string;
}

// 运行时注入的配置/密钥（Cloudflare Workers 通过 env 绑定，Vercel/Netlify 通过 process.env）
export interface SearchEnv {
  // TouchGal 官方元数据 API token（tgal_live_...），在 developer.touchgal.com 申请
  TOUCHGAL_API_TOKEN?: string;
  // Charlotte 站点根地址及专用搜索密钥，仅在服务端使用
  CHARLOTTE_BASE_URL?: string;
  CHARLOTTE_API_KEY?: string;
}

// 平台对象的接口
export interface Platform {
  name: string;
  color: string;
  tags: string[];
  magic: boolean;
  search: (game: string, env?: SearchEnv) => Promise<PlatformSearchResult>;
}

// SSE 事件流中的数据结构
export interface StreamResult {
  name: string;
  color: string;
  tags: string[];
  items: SearchResultItem[];
  error?: string;
}

export interface StreamProgress {
  completed: number;
  total: number;
}
