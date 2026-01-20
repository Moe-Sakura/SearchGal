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

// 平台对象的接口
export interface Platform {
  name: string;
  color: string;
  tags: string[];
  magic: boolean;
  search: (game: string, ...args: any[]) => Promise<PlatformSearchResult>;
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