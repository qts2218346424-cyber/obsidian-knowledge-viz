# Obsidian Knowledge Viz

> 基于 Obsidian 知识库的可视化学习平台 —— 集知识图谱、AI 编辑、在线电台、408 考研复习于一体。

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)
![Vite](https://img.shields.io/badge/Vite-8-purple)
![Electron](https://img.shields.io/badge/Electron-42-cyan)
![Version](https://img.shields.io/badge/Version-1.1.0-orange)

---

## ✨ 功能一览

### 🧠 知识图谱 + 仪表盘

力导向图可视化展示笔记之间的关联网络，同时悬浮显示知识库健康评分、笔记数、标签统计等关键指标。

- D3.js 力导向图，节点可拖拽、搜索、过滤
- 单击节点跳转编辑器，双击预览内容
- 文件夹 / 标签颜色编码
- 悬浮面板显示知识库统计（可收起）
- 知识库健康评分（8 项指标）+ 一键自动修复

### ✏️ 笔记编辑器 + AI 编辑

全功能 Markdown 编辑器，带实时预览和 AI 智能编辑。

- 格式化工具栏：粗体、斜体、删除线、标题(H1-H3)、有序/无序列表、引用、代码块、链接、Wiki 链接、表格、分隔线
- 键盘快捷键：`Ctrl+B` 粗体、`Ctrl+I` 斜体、`Ctrl+1/2/3` 标题
- **AI 编辑**：一键调用 AI 进行润色优化、简化内容、扩展补充、整理结构、修正语法、生成摘要
- 实时 Markdown 预览（GFM + 代码高亮）
- 文件管理：新建、保存、重命名、删除（回收站）
- 拖拽导入 PDF / DOCX / XLSX / PPTX 文档
- Frontmatter 编辑器
- 行号显示

### 📝 在线做题

408 考研专业课选择题练习系统，内置 145+ 道真题。

- 四科选择：数据结构、计算机组成原理、操作系统、计算机网络
- 练习模式（即时反馈 + 解析）和考试模式（批量提交 + 评分）
- **题库导入**：支持 JSON 文件上传、粘贴导入、AI 自动生成
- 题目导航、计时、科目正确率统计
- 做题记录自动保存到知识库 `做题记录/` 目录

### 📖 背单词

考研英语词汇学习，参考「不背单词」设计风格。

- 渐变主题卡片（高频/中频/低频各有配色）
- 例句作为核心展示元素，配引号装饰
- 点击揭示释义，滑动过渡动画
- 三档评分：认识 / 模糊 / 不认识
- 间隔重复复习算法
- 环形图统计面板
- AI 生成新词（从笔记中提取专业词汇）

### 🍅 番茄钟

专注学习计时器，参考「番茄土豆」设计。

- 三种模式：专注 (25min)、短休 (5min)、长休 (15min)
- SVG 圆环进度指示器
- 可配置时长（15/20/25/30/45/60 分钟）
- 自动切换：专注 → 短休（每 4 轮 → 长休）
- Web Audio API 完成提示音
- 当日统计：番茄数、专注分钟数

### 🎵 在线电台

内置多个网络电台，营造学习氛围。

- **Lo-fi 电台**：SomaFM Groove Salad / Fluid / Beat Blender 等
- **英语学习电台**：KEXP 90.3 / Radio Paradise 等
- **环境音电台**：SomaFM Drone Zone / Deep Space One / Sleepscapes 等
- 本地音乐扫描播放
- 分类卡片展示，播放动画

### 🔄 工作流引擎

- **文档导入**：PDF/DOCX/XLSX/PPTX → Markdown（基于 markitdown）
- **AI 实体提取**：自动识别概念、生成标签、创建 wikilinks
- **自动研究**：发现知识缺口，AI 生成结构化笔记
- **Lint 修复**：链接完整性、元数据覆盖率、标签一致性、孤立笔记

### 💬 AI 聊天

- 基于 Anthropic API（兼容任何 Anthropic 格式的服务）
- 自动检索相关笔记作为上下文
- 回答引用笔记卡片（可点击跳转）
- 一键保存回答为笔记

### 🔍 全局搜索

- `Ctrl+K` 快捷键触发
- 加权多词搜索（标题×5、标签×3、路径×2、内容×1）
- 内容片段高亮 + 键盘导航

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4 |
| 后端 | Express 5 + Anthropic SDK + esbuild |
| 可视化 | D3.js (力导向图) + Recharts (图表) |
| Markdown | react-markdown + remark-gfm + rehype-highlight |
| 桌面 | Electron 42 + @electron/packager |
| 文档转换 | markitdown (Python) |
| AI | Xiaomi MiMo (Anthropic-compatible API) |

---

## 🚀 快速开始

### 前置要求

- **Node.js** >= 20
- **Python 3** + markitdown（用于文档导入功能，可选）
  ```bash
  pip install markitdown
  ```

### 安装

```bash
git clone https://github.com/qts2218346424-cyber/obsidian-knowledge-viz.git
cd obsidian-knowledge-viz
npm install
```

### 配置

编辑 `server/config.json`：

```json
{
  "vaultPath": "C:\\Users\\YourName\\Documents\\ObsidianVault",
  "port": 3001,
  "ai": {
    "apiKey": "your-api-key",
    "baseURL": "https://api.anthropic.com",
    "model": "claude-3-5-sonnet-20241022"
  }
}
```

| 字段 | 说明 |
|------|------|
| `vaultPath` | Obsidian 知识库根目录路径 |
| `port` | 后端服务端口（默认 3001）|
| `ai.apiKey` | API 密钥 |
| `ai.baseURL` | API 地址（兼容 Anthropic 格式即可）|
| `ai.model` | 模型名称 |

### 开发

```bash
# 同时启动前端 + 后端
npm run dev:all

# 或分别启动
npm run dev          # 前端: http://localhost:5173
npm run server:dev   # 后端: http://localhost:3001
```

### 构建

```bash
npm run build:all    # 前端 (dist/) + 服务端 (dist-server/server.mjs)
```

### 打包桌面应用

```bash
# 开发模式（带热更新）
npm run electron:dev

# 打包为 Windows 可执行文件
npm run pack
```

打包产物在 `release/` 目录下，直接运行 `Knowledge-Viz.exe` 即可。

---

## 📂 项目结构

```
obsidian-knowledge-viz/
├── electron/                    # Electron 主进程
│   ├── main.js                  # 启动内嵌服务器 + 创建窗口
│   └── preload.js
├── server/                      # Express 后端
│   ├── index.ts                 # API 路由
│   ├── vault-parser.ts          # Vault 文件解析 + CRUD
│   ├── graph-builder.ts         # 知识图谱构建
│   ├── health-checker.ts        # 知识库健康检查
│   ├── agent.ts                 # AI Agent 循环（SSE）
│   ├── quiz-summary.ts          # 做题报告生成
│   └── config.json              # 配置文件
├── src/                         # React 前端
│   ├── App.tsx                  # 路由配置
│   ├── components/
│   │   ├── Layout.tsx           # 侧边栏导航
│   │   ├── FileExplorer.tsx     # 文件树
│   │   ├── SearchModal.tsx      # 全局搜索
│   │   └── study/
│   │       └── VocabTab.tsx     # 背单词组件
│   ├── pages/
│   │   ├── KnowledgeGraph.tsx   # 知识图谱 + 悬浮统计
│   │   ├── Workflow.tsx         # 工作流引擎
│   │   ├── Editor.tsx           # 笔记编辑 + AI 编辑
│   │   ├── Study.tsx            # 学习中心
│   │   ├── Quiz.tsx             # 在线做题 + 导入
│   │   ├── Vocabulary.tsx       # 背单词页面
│   │   ├── Music.tsx            # 在线电台
│   │   ├── Pomodoro.tsx         # 番茄钟
│   │   ├── Chat.tsx             # AI 聊天
│   │   └── Settings.tsx         # 设置
│   ├── hooks/                   # 自定义 Hooks
│   ├── services/                # API 客户端
│   └── data/
│       ├── questions/           # 408 题库 (145+ 题)
│       ├── ambientSounds.ts     # 电台数据
│       └── vocab.ts             # 词汇数据
├── dist/                        # 前端构建产物
├── dist-server/                 # 服务端构建产物
├── release/                     # Electron 打包产物
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 📡 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/vault/stats` | 知识库统计 |
| GET | `/api/vault/graph` | 图谱数据 |
| GET | `/api/vault/health` | 健康检查 |
| GET | `/api/vault/files?q=` | 搜索笔记 |
| GET | `/api/vault/file?path=` | 获取笔记详情 |
| GET | `/api/vault/tree` | 文件树 |
| POST | `/api/vault/file` | 创建笔记 |
| PUT | `/api/vault/file` | 更新笔记 |
| DELETE | `/api/vault/file` | 删除笔记 |
| PATCH | `/api/vault/file/rename` | 重命名笔记 |
| POST | `/api/chat` | AI 聊天 |
| POST | `/api/agent/chat` | Agent 聊天 (SSE) |
| POST | `/api/quiz/submit` | 提交做题结果 |
| POST | `/api/quiz/generate` | AI 生成题目 |
| GET | `/api/quiz/history` | 做题历史 |
| POST | `/api/study/flashcards` | 生成复习卡片 |
| GET | `/api/study/review-due` | 复习提醒 |
| GET | `/api/ingest/status` | 导入状态 |
| POST | `/api/ingest/upload` | 上传文档 |
| POST | `/api/research` | AI 自动研究 |
| POST | `/api/vault/lint/fix` | Lint 自动修复 |

---

## 📦 下载

前往 [Releases](https://github.com/qts2218346424-cyber/obsidian-knowledge-viz/releases) 下载最新版本的 Windows 可执行文件。

解压后直接运行 `Knowledge-Viz.exe`，无需安装 Node.js。

---

## 许可证

MIT
