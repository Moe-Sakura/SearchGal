<div align="center">

# 🔍 SearchGal · Gal资源聚合搜索工具

🚀 **极速响应** | 🌊 **SSE 流式传输** | 🎮 **32+ 平台聚合** | ☁️ **边缘部署**

[前端项目](https://github.com/Moe-Sakura/frontend) • [在线预览](#-在线预览) • [快速部署](#-快速部署) • [API 文档](#-api-文档) • [开发者接入](#-开发者接入指南)

</div>

---

## 🖥️ 在线预览

🌐 **预览地址**: [SearchGal.homes](https://searchgal.homes)  

|          电脑端          |          移动端          |
| :------------------------: | :----------------------: |
| ![电脑端](./docs/img/pc_search_view.png) | ![移动端](./docs/img/phone_search_view.jpg) |

---

## 🌟 项目亮点

| 特性 | 说明 |
|:----:|------|
| ✅ **多端适配** | PC/移动端完美适配，PC端支持展示游戏封面、介绍、标签 |
| 💡 **多源聚合** | 实时聚合 **30+** Gal资源平台 + **2+** 补丁站 |
| 🏷️ **智能标注** | 自动标注：🟢免登录 / 🟡需魔法 / ⚪特殊条件 |
| ☁️ **边缘部署** | 支持 Cloudflare Workers / Vercel Edge 等平台 |
| 🌊 **流式响应** | SSE 实时返回搜索结果，无需等待全部完成 |

> 📜 **历史版本**: Python 版本请查看 [`legacy-python`](../../tree/legacy-python) 分支 **(已停止维护)**

---

## 🚀 已收录平台

### 🟢 免登录直链下载

[![GGS](https://img.shields.io/badge/GGS-00C853)](https://gal.saop.cc/)
[![真红小站](https://img.shields.io/badge/真红小站-00C853)](https://shinnku.com)
[![TouchGal](https://img.shields.io/badge/TouchGal-00C853)](https://www.touchgal.us/)
[![Galgamex](https://img.shields.io/badge/Galgamex-00C853)](https://www.galgamex.net/)
[![忧郁的loli](https://img.shields.io/badge/忧郁的loli-00C853)](https://www.ttloli.com/)
[![GAL图书馆](https://img.shields.io/badge/GAL图书馆-00C853)](https://gallibrary.pw/)
[![绮梦ACG](https://img.shields.io/badge/绮梦ACG-00C853)](https://game.acgs.one/)
[![青桔ACG](https://img.shields.io/badge/青桔ACG-00C853)](https://spare.qingju.org/)
[![鲲Galgame](https://img.shields.io/badge/鲲Galgame-00C853)](https://www.kungal.com/zh-cn/)
[![未知云盘](https://img.shields.io/badge/未知云盘-00C853)](https://www.nullcloud.top/)
[![梓澪の妙妙屋](https://img.shields.io/badge/梓澪の妙妙屋-00C853)](https://zi0.cc/)
[![莉斯坦ACG](https://img.shields.io/badge/莉斯坦ACG-00C853)](https://www.limulu.moe/)
[![猫猫网盘](https://img.shields.io/badge/猫猫网盘-00C853)](https://catcat.cloud/)
[![彼岸星露](https://img.shields.io/badge/彼岸星露-00C853)](https://seve.yugal.cc/)
[![稻荷GAL](https://img.shields.io/badge/稻荷GAL-00C853)](https://inarigal.com/)
[![Koyso](https://img.shields.io/badge/Koyso-00C853)](https://koyso.to/)
[![萤ノ光](https://img.shields.io/badge/萤ノ光-00C853)](https://yinghu.netlify.app/)
[![GGBases](https://img.shields.io/badge/GGBases-00C853)](https://www.ggbases.com/)
[![月谣](https://img.shields.io/badge/月谣-00C853)](https://www.sayafx.vip/)
[![05的资源小站](https://img.shields.io/badge/05的资源小站-00C853)](https://05fx.022016.xyz/)
[![紫缘Gal](https://img.shields.io/badge/紫缘Gal-00C853)](https://galzy.eu.org)

#### 🟢 补丁站

[![鲲Galgame补丁](https://img.shields.io/badge/鲲Galgame补丁-00C853)](https://www.moyu.moe/)
[![2dfan](https://img.shields.io/badge/2dfan-00C853)](https://2dfan.com)

### ⚪ 需登录/特殊条件

[![量子ACG](https://img.shields.io/badge/量子ACG-AAAAAA)](https://lzacg.org/)
[![FuFuGal](https://img.shields.io/badge/FuFuGal-AAAAAA)](https://www.fufugal.com/)
[![ACG嘤嘤怪](https://img.shields.io/badge/ACG嘤嘤怪-AAAAAA)](https://acgyyg.ru/)
[![喵源领域](https://img.shields.io/badge/喵源领域-AAAAAA)](https://www.nyantaku.com/)

### 🟡 需魔法访问

[![VikaACG](https://img.shields.io/badge/VikaACG-FFC107)](https://www.vikacg.com/)
[![绅仕天堂](https://img.shields.io/badge/绅仕天堂-FFC107)](https://www.gogalgame.com/)
[![天游二次元](https://img.shields.io/badge/天游二次元-FFC107)](https://www.tiangal.com/)
[![Nysoure](https://img.shields.io/badge/Nysoure-FFC107)](https://res.nyne.dev/)
[![xxacg](https://img.shields.io/badge/xxacg-FFC107)](https://xxacg.net/)

---

## 🚀 快速部署

### ☁️ 一键云部署

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Moe-Sakura/SearchGal)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Moe-Sakura/SearchGal)

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Moe-Sakura/SearchGal)

[![Deploy to Koyeb](https://img.shields.io/badge/Deploy%20to-Koyeb-121212?style=for-the-badge&logo=koyeb&logoColor=white)](https://app.koyeb.com/deploy?type=git&name=searchgal&repository=github.com/Moe-Sakura/SearchGal&branch=main&builder=dockerfile&ports=8787;http;/)

### 🧭 服务器配置参考

| 档位 | CPU | 内存 | 适用场景 |
|:----:|:---:|:----:|:--------:|
| 最低 | 1 vCPU | 512MB–1GB | 低并发 |
| 推荐 | 2 vCPU | 1–2GB | 中小规模 |
| 高并发 | 4+ vCPU | 2–4GB | 高并发 |

### 💻 本地开发

```bash
pnpm install        # 安装依赖
pnpm wrangler dev   # 启动开发服务器
```

### 🐳 Docker 部署

```bash
podman-compose up -d
```

---

## 📡 API 文档

### 接口说明

| 方法 | 路径 | 说明 |
|:----:|------|------|
| POST | `/gal` | 搜索游戏资源 |
| POST | `/patch` | 搜索补丁资源 |

**请求参数**: `game` (string) - 搜索关键词  
**Content-Type**: `multipart/form-data` 或 `application/json`

### 响应格式 (SSE 流式)

```json
{"total": 10}                                    // 总搜索源数量
{"progress": {"completed": 1, "total": 10}}      // 进度更新
{"progress": {...}, "result": {...}}             // 搜索结果
{"done": true}                                   // 结束信号
```

### 🏷️ 标签说明

| 标签 | 含义 | 标签 | 含义 |
|:----:|:----:|:----:|:----:|
| `NoReq` | 无门槛 | `Login` | 需登录 |
| `LoginPay` | 需付费 | `LoginRep` | 需回复 |
| `SuDrive` | 自建盘 | `NoSplDrive` | 不限速盘 |
| `SplDrive` | 限速盘 | `MixDrive` | 混合盘 |
| `BTmag` | BT/磁力 | `magic` | 需魔法 |

---

## 🛠️ 使用指南

| 步骤 | 技巧 |
|:----:|------|
| 🔍 **精准搜索** | 使用中文名效果最佳，如 `Senren＊Banka` → `千恋万花` → `千恋` |
| 🎯 **结果筛选** | 优先选择 🟢绿色标签 (免登录)，🟡金色需代理，⚪白色需对应条件 |
| ⬇️ **下载建议** | 推荐 IDM/FDM 加速，遇 Cloudflare 验证耐心等待 |

---

## 🤝 开发者接入指南

想要将您的站点接入聚合搜索？只需三步：

**1. 创建适配器** - 在 `src/platforms/gal/` 下创建 `YourSite.ts`

**2. 实现接口**
```typescript
import type { Platform, PlatformSearchResult } from "../../types";

const YourSite: Platform = {
  name: "站点名称",
  color: "lime",
  tags: ["NoReq"],
  search: async (game) => {
    // 实现搜索逻辑
    return { count: 0, items: [] };
  },
};
export default YourSite;
```

**3. 注册 & 提交**
```bash
pnpm run generate   # 自动注册
git push && PR      # 提交贡献
```

---

## ⚠️ 注意事项

**📢 广告白名单**: 本站无广告，但收录的资源站建站不易，请加入广告白名单支持站长！<br>
**✉️ 写给站长**: 本程序仅提供游戏发布页链接（非下载链接），不提供解压码。如不想被搜索，请过滤 UA 含 `Searchgal` 的请求。<br>
**🔐 安全声明**: 本工具仅提供搜索聚合，不托管资源，请自行校验文件安全性。<br>

---

## 📂 项目结构

```
src/
├── index.ts          # Worker 入口
├── core.ts           # 核心搜索逻辑
├── types.ts          # 类型定义
└── platforms/        # 平台适配器
api/
└── [...slug].ts      # Vercel Edge 入口
```

---

## 🌱 支持正版

本工具旨在提供资源索引便利，**请通过 Steam/DLSite 等正规渠道支持开发者！**

---

<div align="center">

**欢迎各位 GalGame 爱好者优化本项目 ❤️**

[MIT License](./LICENSE) © SearchGal

</div>
