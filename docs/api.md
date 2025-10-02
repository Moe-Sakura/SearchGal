# 后端搜索 API 文档

本文档介绍了如何使用后端的搜索 API，包括主力流式接口、补丁搜索接口和已废弃的传统接口。

## 目录
- [接口概述](#接口概述)
- [流式搜索（推荐）](#接口-流式搜索)
- [补丁搜索](#接口-流式搜索galgame补丁)
- [已废弃接口](#已废弃-接口-传统搜索)

---

## 接口概述

本 API 提供以下主要功能：
- 🎮 游戏资源搜索（推荐使用流式搜索）
- 🛠️ 游戏补丁搜索
- 🚀 多平台并行搜索
- ⏱️ 实时进度反馈

主要接口：
- `/gal` —— 流式搜索接口（推荐）
- `/patch` —— 补丁搜索接口
- `/search-classic` —— 传统搜索接口（已废弃）

> **推荐优先使用流式接口 `/gal`，体验最佳。**

---

## ⚠️ 注意事项
- 建议优先使用游戏的官方名称进行搜索，提升准确率。
- `magic` 参数可提升检索范围，但可能略慢。
- 补丁接口专注于汉化、语音等补丁资源。

---

## **(已废弃)** 接口: 传统搜索 

这是一个标准的 HTTP 接口，它会等待所有搜索任务完成后，一次性返回全部结果。

- **URL**: `/search-classic`
- **方法**: `POST`
- **Content-Type**: `application/x-www-form-urlencoded` 或 `multipart/form-data`

### 请求参数
#### 标准参数

| 参数名  | 类型   | 是否必需 | 默认值    | 描述                                                                                                                                     |
| :------ | :----- | :------- | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `game`  | string | 是       | -         | 需要搜索的游戏名称。支持中文、日文和英文，建议使用官方名称以提高匹配度。                                                                 |
| `magic` | string | 否       | `"false"` | 是否启用魔法搜索功能。<br/>• `"true"` - 启用魔法搜索<br/>• `"false"` - 禁用魔法搜索<br/>启用后可能会搜索到更多结果，但响应时间可能更长。 |
### 成功响应 (200 OK)

响应体是一个 JSON 对象，包含一个 `results` 数组。

```json
{
  "results": [
    {
      "name": "TestGal",
      "color": "lime",
      "items": [
        {
          "name": "【PC】[Alcot] 幸运草的约定 (Clover Day's)",
          "url": "https://testgal.com/index.php/archives/301.html"
        },
        {
          "name": "【KRKR】[Alcot] 幸运草的约定 (Clover Day's)",
          "url": "https://testgal.com/index.php/archives/302.html"
        }
      ],
      "error": ""
    },
    {
      "name": "另一个平台",
      "color": "red",
      "items": [],
      "error": "Search API 响应 403"
    }
  ]
}
```
`results` 数组中的每个对象代表一个平台的搜索结果，包含以下字段：

#### 平台信息
| 字段    | 类型   | 描述                   |
| :------ | :----- | :--------------------- |
| `name`  | string | 平台名称               |
| `color` | string | 平台状态颜色标识       |
| `error` | string | 错误信息（成功时为空） |

#### 平台颜色说明
| 颜色值  | 显示颜色 | 含义                   | 推荐程度 |
| :------ | :------- | :--------------------- | :------- |
| `lime`  | 绿色     | 无条件下载平台         | ★★★★★    |
| `white` | 白色     | 有条件下载平台         | ★★★☆☆    |
| `gold`  | 金色     | 需要特殊网络访问的平台 | ★★☆☆☆    |
| `red`   | 红色     | 搜索出错               | ❌        |

#### 搜索结果
`items` 字段为搜索结果数组，每个结果包含：
| 字段   | 类型   | 描述                     |
| :----- | :----- | :----------------------- |
| `name` | string | 游戏名称（包含版本信息） |
| `url`  | string | 资源页面链接             |

### 错误响应
响应体类型为 `application/json`

- **400 Bad Request**: 如果 `game` 参数缺失。
  ```json
  {
    "error": "游戏名称不能为空"
  }
  ```
- **429 Too Many Requests**: 如果在指定的时间间隔内频繁请求。
  ```json
  {
    "error": "请 10 秒后再试"
  }
  ```

## 如何使用 Fetch API 请求

以下是一个在 JavaScript 中使用 `fetch` API 调用此接口的示例。

```javascript
async function searchGame(gameName, magic = false, ...args) {
  const url = '/gal';
  

  // 使用 FormData 来构建请求体
  const formData = new FormData();
  formData.append('game', gameName);
  formData.append('magic', magic.toString()); // 转换为字符串 "true" 或 "false"
  

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // 如果服务器返回了错误状态码 (如 400, 429, 500)
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('搜索结果:', data.results);
    return data.results;

  } catch (error) {
    console.error('搜索请求失败:', error);
  }
}

// --- 示例调用 ---

// 1. 基本调用
searchGame("Clover Day's");

// 2. 启用 magic 搜索
// searchGame("Some Game", true);
```

## 接口: 流式搜索

> 🌟 这是推荐使用的主要搜索接口

这是一个基于 [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) 的流式接口。相比传统搜索接口具有以下优势：

- ⚡ 即时响应：立即开始搜索，无需等待所有平台
- 📊 实时进度：逐步返回每个平台的结果
- 📱 更好的用户体验：适合在前端实时展示进度和结果
- 🛡️ 更强的容错性：单个平台失败不影响整体搜索

- **URL**: `/gal`
- **方法**: `POST`
- **Content-Type**: `application/x-www-form-urlencoded` 或 `multipart/form-data`

### 请求参数

请求参数与传统搜索接口完全相同, 参见 [传统搜索接口](#传统搜索接口)

### 响应 (200 OK)

响应的 `Content-Type` 是 `text/event-stream`。响应体由一系列的事件组成，每个事件都是一个 JSON 字符串，并以换行符 `\n` 分隔。

1.  **初始事件**: 第一个事件包含了搜索任务的总平台数。
    ```json
    {"total": 10}
    ```
2.  **进度事件**: 每完成一个平台的搜索，就会发送一个进度事件。
    ```json
    {
      "progress": {
        "completed": 1,
        "total": 10
      },
      "result": {
        "name": "平台A",
        "color": "gold",
        "items": [
          {
            "name": "游戏1",
            "url": "http://..."
          }
        ],
        "error": ""
      }
    }
    ```
    - `completed`: 当前返回的平台在线程池中的位置，从1开始计。
    - `total`: 总平台数。
3.  **完成事件**: 所有平台都搜索完毕后，会发送一个最终事件。
    ```json
    {"done": true}
    ```

该接口的完整返回示例形如：
```
{"total": 4}
{"progress":{"completed":1,"total":4},"result":{"name":"平台A","color":"gold","items":[{"name":"游戏1","url":"http://..."},{"name":"游戏2","url":"http://..."}],"error":""}}
{"progress":{"completed":2,"total":4},"result":{"name":"平台A","color":"white","items":[{"name":"游戏1","url":"http://..."},{"name":"游戏2","url":"http://..."}],"error":""}}
{"progress":{"completed":3,"total":4},"result":{"name":"平台A","color":"white","items":[{"name":"游戏1","url":"http://..."},{"name":"游戏2","url":"http://..."}],"error":""}}
{"progress":{"completed":4,"total":4},"result":{"name":"平台A","color":"gold","items":[{"name":"游戏1","url":"http://..."},{"name":"游戏2","url":"http://..."}],"error":""}}
{"done": true}
```

### 错误响应

错误响应与传统搜索接口相同

### 如何使用 Fetch API 处理流式响应

处理流式响应比处理单个 JSON 响应要复杂一些。你需要读取响应的 `ReadableStream` 并手动解析每一行数据。

```javascript
async function searchGameStream(
  // 使用对象解构赋值，让参数传递更清晰
  { gameName, magic = false},
  // 将所有回调函数也组织在一个对象里
  { onProgress, onResult, onDone, onError }
) {
  const url = '/search';

  // 参数校验
  if (!gameName) {
    onError(new Error("游戏名称不能为空"));
    return;
  }

  // 使用 FormData 来构建请求体，与传统搜索保持一致
  const formData = new FormData();
  formData.append('game', gameName);
  formData.append('magic', magic.toString());

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.trim() === '') continue;
        try {
          const data = JSON.parse(line);
          if (data.total) {
            // 初始事件，可以忽略或用于设置总数
          } else if (data.progress && onProgress) {
            onProgress(data.progress);
            if (data.result && onResult) {
              onResult(data.result);
            }
          } else if (data.done && onDone) {
            onDone();
            return;
          }
        } catch (e) {
          console.error('无法解析JSON行:', line, e);
        }
      }
    }
  } catch (error) {
    if (onError) {
      onError(error);
    }
  }
}

// --- 示例用法 ---

// 1. 定义回调函数
const callbacks = {
  onProgress: (progress) => {
    console.log(`进度: ${progress.completed} / ${progress.total}`);
  },
  onResult: (result) => {
    console.log('收到新结果:', result);
  },
  onDone: () => {
    console.log('搜索完成！');
  },
  onError: (error) => {
    console.error('发生错误:', error.message);
  }
};

// 2. 调用流式搜索函数

// 基本调用
// searchGameStream({ gameName: "Clover Day's" }, callbacks);

// 启用 magic 并提供密码
// searchGameStream({
//   gameName: "Another Game",
//   magic: true,
// }, callbacks);
```

## 接口: 流式搜索Galgame补丁

- **URL**: `/patch`
- **方法**: `POST`
- **Content-Type**: `application/x-www-form-urlencoded` 或 `multipart/form-data`

### 请求参数

请求参数与流式搜索接口相同，详见 [流式搜索接口](#流式搜索)

### 响应 (200 OK)

响应体为 JSON 对象，包含 `results` 数组，结构与流式搜索相同。

### 错误响应

错误响应与流式搜索接口相同