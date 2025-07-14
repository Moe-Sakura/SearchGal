# 🔍 SearchGal · Gal资源聚合搜索工具
<p align="center">
  <strong>WEB丨多源聚合丨快速响应</strong>
</p>

---

## 🌟 项目亮点

> 🖥️预览地址: [SearchGal.homes](https://searchgal.homes)<br>
> (感谢 [@Asuna](https://saop.cc/) 大佬的服务器支撑与技术支持)

✅ **双端适配**<br>
▸ 提供 **EXE桌面程序**~~*(已废弃)*~~ 与 **WEB在线版** 双版本 <br>
▸ WEB移动端完美适配，随时随地畅快搜索

💡 **核心功能**<br>
▸ 实时聚合 **27+** 主流Gal资源平台 / **2+** Galgame补丁站<br>
▸ 自动标注平台特性：<span style="color:#4CAF50">免登录</span> / <span style="color:#FFC107">需魔法</span> / 特殊条件<br>
▸ 多线程加速搜索，快速响应

---

## 如何运行

```sh
git clone https://github.com/Moe-Sakura/SearchGal.git
cd SearchGal && screen -S sg
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
nice -n 19 gunicorn --threads 4 --bind 0.0.0.0:8898 app:app

```

建议使用 [Nginx](https://nginx.org/) 反代 [Gunicorn](https://gunicorn.org/)

---

## 📸 界面预览
|          桌面端GUI          |          WEB端PC           |              WEB端移动              |
| :-------------------------: | :------------------------: | :---------------------------------: |
| ![GUI演示](./docs/img/shot-GUI.avif) | ![WEB-PC](./docs/img/shot-WEB.avif) | ![WEB-Phone](./docs/img/shot-WEB-Phone.avif) |

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
[![桃花源](https://img.shields.io/badge/桃花源-00C853)](https://peach.sslswwdx.top/)
[![梓澪の妙妙屋](https://img.shields.io/badge/梓澪の妙妙屋-00C853)](https://zi0.cc/)
[![莉斯坦ACG](https://img.shields.io/badge/莉斯坦ACG-00C853)](https://www.limulu.moe/)
[![猫猫网盘](https://img.shields.io/badge/猫猫网盘-00C853)](https://sakiko.de/)
[![彼岸星露](https://img.shields.io/badge/彼岸星露-00C853)](https://seve.yugal.cc/)
[![晴空咖啡馆](https://img.shields.io/badge/晴空咖啡馆-00C853)](https://aosoracafe.com/)
[![Koyso](https://img.shields.io/badge/Koyso-00C853)](https://koyso.to/)
[![萤ノ光](https://img.shields.io/badge/萤ノ光-00C853)](https://yinghu.netlify.app/)
---
[![鲲Galgame补丁](https://img.shields.io/badge/鲲Galgame补丁-00C853)](https://www.moyu.moe/)
[![2dfan](https://img.shields.io/badge/2dfan-00C853)](https://2dfan.com)

### ⚪ 需登录/特殊条件
[![量子ACG](https://img.shields.io/badge/量子ACG-FFFFFF)](https://lzacg.org/)
[![FuFuGal](https://img.shields.io/badge/FuFuGal-FFFFFF)](https://www.fufugal.com/)
[![ACG嘤嘤怪](https://img.shields.io/badge/ACG嘤嘤怪-FFFFFF)](https://acgyyg.ru/)
[![天游二次元](https://img.shields.io/badge/天游二次元-FFFFFF)](https://www.tiangal.com/)
[![紫缘Gal](https://img.shields.io/badge/紫缘Gal-FFFFFF)](https://galzy.eu.org)
[![喵源领域](https://img.shields.io/badge/喵源领域-FFFFFF)](https://www.nyantaku.com/)
[![Hikarinagi](https://img.shields.io/badge/Hikarinagi-FFFFFF)](https://www.hikarinagi.net/)

### 🟡 需魔法访问
[![VikaACG](https://img.shields.io/badge/VikaACG-FFC107)](https://www.vikacg.com/)
[![绅仕天堂](https://img.shields.io/badge/绅仕天堂-FFC107)](https://www.gogalgame.com/)

---

## 🛠️ 使用指南
1️⃣ **精准搜索**<br>
▸ 使用中文游戏名效果最佳<br>
▸ 示例：`Senren＊Banka` → `千恋万花`

2️⃣ **结果筛选**<br>
▸ 优先选择<span style="color:#4CAF50">绿色标签</span>平台（免登录+直链下载）<br>
▸ 金色平台需配置代理，白色平台需完成对应条件

3️⃣ **下载须知**<br>
▸ 推荐使用IDM/FDM等下载工具加速<br>
▸ 遇到Cloudflare验证时耐心等待5秒

---

## ⚠️ 注意事项
❗ **广告白名单**<br>
▸ 本站仅提供聚合搜索服务，未嵌任何广告!!!<br>
▸ 但是里面收录的Gal资源平台建站不易，请将各Gal网站加入广告插件白名单，支持各平台Gal资源站长运营

✉️ **写给站长**<br>
▸ 本程序搜索结果仅提供各Gal平台的**游戏发布页** *（非下载链接）* , 用户点击后自行跳转各网站的**游戏发布页**<br>
▸ 本程序不会提供任何站点的解压码/访问码信息，需要用户自行在各站点寻找<br>
▸ 本程序每次搜索需调用一次各平台的搜索API *(调用完毕立即关闭断开连接)*，如有任何异议或疑问请提出Issue与我联系<br>
▸ 如果您的网站不想被 Searchgal.homes 搜索, 请过滤Header中包含`Searchgal`字符串的请求<br>
> &nbsp;&nbsp;只能保证不被 Searchgal.homes 该网站搜索, 不排除其他人克隆项目修改 Header 特征后进行搜索, 如需彻底禁止请修改您网站的 Search API 或针对其加上诸如 cloudflare 的高防

🔐 **安全声明**<br>
▸ 本工具仅提供搜索聚合服务，不托管任何资源<br>
▸ 所有结果来自第三方平台，请自行校验文件安全性

---

## 📜 更新日志

### 最新版本: V15 (2025/07/11)
```
* 部分平台搜索最大数代码修正，现部分平台默认直接返回所有搜索结果
* 「绮梦ACG」转API搜索
- 去除「NekoGAL」(高防)
```
**历史更新见 [更新日志](./version.md) 页面**

---

## 🌱 支持正版
本工具旨在为Gal爱好者提供资源索引便利<br>
**请通过Steam/DLSite等正规渠道支持开发者！**

> 📢 项目由 [DeepSeek-R1] / [ChatGPT-o1-mini] / [Gemini-2.5-pro] 深度联合开发<br>
> 🔗 由于平台的有较强的时效性，遇到任何问题请提交Issue

**欢迎各位GalGame爱好者优化本项目**
