# 后端搜索 API 文档

本文档介绍了如何使用后端的搜索 API。

## 接口: 传统搜索

这是一个标准的 HTTP 接口，它会等待所有搜索任务完成后，一次性返回全部结果。

- **URL**: `/search-classic`
- **方法**: `POST`
- **Content-Type**: `application/x-www-form-urlencoded` 或 `multipart/form-data`

### 请求参数
#### 标准参数

| 参数名 | 类型 | 是否必需 | 描述 |
| :--- | :--- | :--- | :--- |
| `game` | string | 是 | 需要搜索的游戏名称。 |
| `magic` | string | 否 | 是否启用魔法搜索功能。接受 `"true"` 或 `"false"`，默认为 `"false"`。 |

#### 扩展参数
| 参数名 | 类型 | 是否必需 | 描述 |
| :--- | :--- | :--- | :--- |
| `zypassword` | string | 否 | 用于搜索 "紫缘Gal" 平台的访问密码。 |

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
`results`每一个列表为一个平台的搜索结果，包含以下字段：
- `name`: 平台名称
- `color`: 平台颜色（用于前端显示）
  - **`lime`: 绿色，无条件下载平台 (最优选)**
  - `white`: 白色，有条件下载平台
  - `gold`: 金色，需翻墙平台
  - **`red`: 红色，搜索过程发送错误**
- `items`: 平台搜索到的结果集, 由0~n个项目的列表组成
  - `name`: galgame名称
  - `url`: galgame的平台链接
- `error`: 平台搜索时的错误, 如果搜索成功则为空值

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
  const url = '/search-classic';
  
  // 第一个位置变量作为 zypassword
  const zypassword = args[0] || '';

  // 使用 FormData 来构建请求体
  const formData = new FormData();
  formData.append('game', gameName);
  formData.append('magic', magic.toString()); // 转换为字符串 "true" 或 "false"
  
  if (zypassword) {
    formData.append('zypassword', zypassword);
  }

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

// 3. 提供 zypassword
// searchGame("Another Game", false, "your-password-here");
```

## 接口: 流式搜索

这是一个基于 [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) 的流式接口。它会立即开始搜索，并逐步返回每个搜索平台的结果，从而允许前端实时展示进度和结果。

- **URL**: `/search`
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
  { gameName, magic = false, zypassword = '' },
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
  if (zypassword) {
    formData.append('zypassword', zypassword);
  }

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
//   zypassword: "your-password-here"
// }, callbacks);