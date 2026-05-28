# 🥾 AI Hiking Guide · AI徒步攻略

> AI 驱动的全球徒步路线规划平台。智能路线生成 + 真实轨迹可视化 + 经典路线库。中英双语，为徒步爱好者而生。

---

## ✨ 项目初衷

**让每个人都能找到适合自己的徒步路线。**

本项目参考 [geo-blog](https://github.com/syyyclover/geo-blog) 架构，在 **Claude** 与 **Codex** 的深度协助下完成。从两步路和 AllTrails 收集经典路线轨迹，结合 AI 智能规划，让徒步攻略不再靠猜。

---

## 🛠️ 核心架构

| 层级 | 技术栈 | 说明 |
| --- | --- | --- |
| 🎨 前端 | React 19 + Vite + Tailwind CSS v4 | 响应式 SPA，毛玻璃现代 UI |
| 🗺️ 地图引擎 | MapLibre GL JS + Thunderforest Outdoors | 专业户外地形图，等高线+徒步路径 |
| 📈 轨迹可视化 | GeoJSON + 海拔剖面图 | GPX 解析，真实路线渲染 |
| ⚙️ 后端 | Node.js + Express + TypeScript | REST API + SSE 流式 AI 输出 |
| 🗄️ 数据库 | PostgreSQL + Prisma ORM + PostGIS | 路线存储、全文搜索、空间查询 |
| 🔐 认证 | Clerk | Google / GitHub OAuth |
| 🤖 AI | DeepSeek（OpenAI 兼容接口） | SSE 流式路线规划，结构化输出 |
| 🛤️ 路线引擎 | OSRM foot profile | 基于 OpenStreetMap 真实路径路由 |
| 🚀 部署 | Vercel（前端）+ Render（后端+DB） | 免费 tier，开箱即用 |

---

## 📂 项目结构

```text
ai-hiking-guide/
├── api/                           # 后端服务
│   ├── src/
│   │   ├── server.ts              # Express 入口，安全中间件
│   │   ├── seed-real.ts           # 11条经典路线种子数据（真实GPX坐标）
│   │   ├── lib/
│   │   │   └── geocode.ts         # 80+目的地离线词典 + Nominatim 回退
│   │   └── routes/
│   │       ├── ai.ts              # AI 路线规划 SSE 流式端点
│   │       ├── trails.ts          # 路线 CRUD + OSRM 路由代理
│   │       ├── reviews.ts         # 评论 API
│   │       ├── search.ts          # 全文搜索
│   │       └── auth.ts            # Clerk Webhook 用户同步
│   └── prisma/
│       └── schema.prisma          # 数据库模型定义
├── frontend/                      # 前端应用
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx       # 首页：搜索 + 精选路线 + AI 入口
│   │   │   ├── PlannerPage.tsx    # AI 规划：对话面板 + 实时地图
│   │   │   ├── TrailsPage.tsx     # 路线浏览：筛选 + 卡片列表
│   │   │   ├── TrailDetailPage.tsx # 路线详情：地图 + 行程 + 评论
│   │   │   ├── ProfilePage.tsx    # 个人中心 + 收藏
│   │   │   └── UploadPage.tsx     # 发布攻略
│   │   ├── components/
│   │   │   ├── MapContainer.tsx   # 地图核心组件
│   │   │   ├── ElevationProfile.tsx # 海拔剖面图
│   │   │   └── Layout.tsx         # 全局布局 + 导航
│   │   └── lib/
│   │       ├── trailRouter.ts     # OSRM 路线请求 + 坐标处理
│   │       └── geocode.ts         # 目的地搜索
│   └── vercel.json                # Vercel 部署配置
├── seed-data/
│   └── trails.json                # 路线种子数据
├── .env.example                   # 环境变量模板
└── package.json                   # 根级脚本（开发启动）
```

---

## 🗺️ 功能一览

### 🤖 AI 智能路线规划

输入目的地、天数和体能水平，AI 实时生成徒步行程并同步渲染在地图上。

- SSE 流式输出，逐字生成，地点实时标注
- 支持天数（1/3/5/7天）+ 体能水平（新手/中级/高级/专家）组合
- 距离约束精准匹配：1天新手 8-12km → 7天专家 175km+
- 优先匹配种子库 11 条经典路线真实坐标
- 种子库未命中时使用 OSRM foot profile 生成 OSM 真实路径
- 结构化输出：概览 → 逐日行程 → 装备清单 → 安全提示

### 🗺️ 真实徒步路线渲染

- 基于 OpenStreetMap + OSRM foot profile 的真实可走路径
- Thunderforest Outdoors 专业户外图层（等高线、步道标注）
- 11 条经典路线手动录入真实 GPX 坐标（300+ 坐标点/条）
- 起点/终点标记，路线高亮渲染

### 📚 精选路线库

已内置 11 条全球经典徒步路线：

| 路线 | 地区 | 天数 | 难度 |
| --- | --- | --- | --- |
| 虎跳峡高路 | 云南，中国 🇨🇳 | 2天 | 中级 |
| 雨崩徒步 | 云南，中国 🇨🇳 | 3天 | 中级 |
| 四姑娘山长坪沟穿越 | 四川，中国 🇨🇳 | 3天 | 高级 |
| 武功山徒步 | 江西，中国 🇨🇳 | 2天 | 中级 |
| 稻城亚丁大转 | 四川，中国 🇨🇳 | 5天 | 高级 |
| 安娜普尔纳大本营 ABC | 尼泊尔 🇳🇵 | 7天 | 高级 |
| 珠峰大本营 EBC | 尼泊尔 🇳🇵 | 7天 | 专家 |
| 环勃朗峰 TMB | 法国/意大利/瑞士 🇫🇷🇮🇹🇨🇭 | 5天 | 高级 |
| 印加古道 | 秘鲁 🇵🇪 | 4天 | 中级 |
| 百内 W 线 | 智利 🇨🇱 | 5天 | 中级 |
| 西部高地线 | 苏格兰 🏴󠁧󠁢󠁳󠁣󠁴󠁿 | 4天 | 中级 |

### 🔍 其他功能

- 路线详情页：轨迹地图 + 海拔剖面图 + 每日行程 + 装备清单
- 地区/难度/天数多维度筛选
- 中英双语路线信息
- Clerk 账号认证（Google OAuth）
- 个人收藏 + 评论系统

---

## 🚀 快速开始

### 1. 准备外部服务

| 服务 | 用途 | 获取方式 |
| --- | --- | --- |
| Thunderforest API Key | 户外地图图层 | [thunderforest.com](https://www.thunderforest.com/) |
| DeepSeek API Key | AI 路线规划 | [platform.deepseek.com](https://platform.deepseek.com/) |
| Clerk Publishable Key | 用户认证 | [clerk.com](https://clerk.com/) |
| PostgreSQL | 数据库 | 本地安装或 [Render](https://render.com/) 免费托管 |

### 2. 配置环境变量

在 `api/` 目录复制 `.env.example` 为 `.env`：

```env
# ── 数据库 ───────────────────────────────────────────
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hiking_guide

# ── AI ───────────────────────────────────────────────
AI_API_KEY=sk-your-deepseek-key
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat

# ── 应用 ─────────────────────────────────────────────
PORT=10000
APP_URL=http://localhost:5173
```

在 `frontend/` 目录创建 `.env`：

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
VITE_THUNDERFOREST_API_KEY=your_thunderforest_key
```

### 3. 初始化数据库

```bash
cd api
npm install
npx prisma db push
npx tsx src/seed-real.ts
```

### 4. 启动开发服务

```bash
# 根目录
npm install
npm run dev
```

**启动后访问：**

| 服务 | 地址 |
| --- | --- |
| 🏠 首页 | `http://localhost:5173` |
| 🤖 AI 规划 | `http://localhost:5173/planner` |
| 📚 路线库 | `http://localhost:5173/trails` |
| ⚙️ API | `http://localhost:10000` |

---

## 🌐 线上部署

- **前端**：Vercel — `vercel.json` 配置 API 代理至后端
- **后端 + 数据库**：Render — 免费 PostgreSQL + Web Service

```bash
# Render Start Command
npx prisma db push && npx tsx src/seed-real.ts && npx tsx src/server.ts
```

### 线上地址

| 服务 | URL |
| --- | --- |
| 🏠 前端 | [frontend-xi-tan-11.vercel.app](https://frontend-xi-tan-11.vercel.app) |
| ⚙️ API | [ai-powered-hiking-project.onrender.com](https://ai-powered-hiking-project.onrender.com) |

---

## 🤝 致谢

- [syyyclover/geo-blog](https://github.com/syyyclover/geo-blog) — 项目架构参考
- [MapLibre](https://maplibre.org/) — 开源地图渲染引擎
- [Thunderforest](https://www.thunderforest.com/) — 专业户外地图图层
- [OpenStreetMap](https://www.openstreetmap.org/) — 全球开源地图数据
- [OSRM](https://project-osrm.org/) — 开源路线引擎
- **Claude & Codex** — AI 编程伙伴

---

> 徒步不是为了抵达终点，而是为了路上的每一步。如果对你有帮助，欢迎点个 ⭐ Star！
