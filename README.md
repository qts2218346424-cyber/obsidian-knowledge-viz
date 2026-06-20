# Obsidian Knowledge Viz

一个基于 Obsidian 知识库的可视化学习平台，集成 AI 聊天、知识图谱、Markdown 编辑、文档导入和 408 考研复习功能。

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-6-blue) ![Vite](https://img.shields.io/badge/Vite-8-purple) ![Electron](https://img.shields.io/badge/Electron-42-cyan)

## 功能特性

### 知识图谱
- D3.js 力导向图可视化笔记关联网络
- 单击节点跳转编辑器，双击预览笔记内容
- 搜索过滤 + 多选分类过滤
- 文件夹/标签颜色编码

### Vault 仪表盘
- 笔记数、字数、标签数等全局统计
- 标签分布、文件夹分布饼图
- 近期活动时间线
- 知识库健康评分（8 项指标）+ 一键自动修复

### 工作流引擎
- **文档导入**：PDF/DOCX/XLSX/PPTX → Markdown（基于 markitdown）
- **AI 实体提取**：自动识别概念、生成标签、创建 wikilinks
- **自动研究**：发现知识缺口，AI 生成结构化笔记
- **Lint 修复**：链接完整性、元数据覆盖率、标签一致性、孤立笔记

### 笔记编辑器
- 实时 Markdown 预览（react-markdown + GFM + 代码高亮）
- 格式化工具栏（粗体/斜体/标题/列表/代码/链接/表格）
- 键盘快捷键（Ctrl+B/I/S/1/2/3）
- 行号显示
- 拖拽导入多文件
- Frontmatter 编辑器
- 文件 CRUD（新建/保存/重命名/删除到回收站）

### 学习中心（408 考研专用）
- **复习卡片**：AI 从笔记生成问答对，3D 翻转动画
- **复习提醒**：按科目分类，3/7/14 天间隔提醒
- **科目进度**：数据结构/计组/网络/操作系统 柱状图对比

### AI 聊天
- 基于 Anthropic API 的智能问答
- 自动检索相关笔记作为上下文
- 回答引用笔记卡片（可点击跳转）
- AI 回答一键保存为笔记

### 全局搜索
- `Ctrl+K` 快捷键触发
- 加权多词搜索（标题×5、标签×3、路径×2、内容×1）
- 内容片段高亮 + 键盘导航

### Electron 桌面应用
- 手动打包为 Windows 可执行文件
- 内置后端服务器 + 前端静态文件
- 独立运行，无需安装 Node.js

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4 |
| 后端 | Express 5 + Anthropic SDK |
| 可视化 | D3.js (力导向图) + Recharts (图表) + React Flow + dagre |
| Markdown | react-markdown + remark-gfm + rehype-highlight |
| 桌面 | Electron 42 |
| 文档转换 | markitdown (Python) |

## 快速开始

### 前置要求

- Node.js >= 20
- Python 3 + markitdown（用于文档导入功能）
  ```bash
  pip install markitdown
  ```

### 安装

```bash
git clone https://github.com/YOUR_USERNAME/obsidian-knowledge-viz.git
cd obsidian-knowledge-viz
npm install
```

### 配置

复制示例配置并修改：

```bash
cp server/config.example.json server/config.json
```

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

- `vaultPath`：你的 Obsidian 知识库根目录路径
- `ai`：AI 聊天配置（兼容 Anthropic API 格式的服务均可）

### 开发

```bash
# 同时启动前端 (Vite) + 后端 (Express)
npm run dev:all

# 或者分别启动
npm run dev          # 前端: http://localhost:5173
npm run server:dev   # 后端: http://localhost:3001
```

### 构建

```bash
# 构建前端 + 服务端 bundle
npm run build:all

# 单独构建
npm run build         # 前端 → dist/
npm run build:server  # 服务端 → dist-server/server.mjs
```

### Electron 打包

```bash
# 开发模式（带热更新）
npm run electron:dev

# 打包为 Windows 应用
npm run pack
```

打包产物在 `release/` 目录下。

## 项目结构

```
obsidian-knowledge-viz/
├── electron/              # Electron 主进程
│   └── main.js
├── server/                # Express 后端
│   ├── index.ts           # API 路由 (chat, CRUD, ingest, study...)
│   ├── vault-parser.ts    # Vault 文件解析 + CRUD 操作
│   ├── graph-builder.ts   # 知识图谱构建
│   ├── health-checker.ts  # 知识库健康检查
│   └── config.example.json
├── src/                   # React 前端
│   ├── App.tsx
│   ├── components/        # 通用组件
│   │   ├── Layout.tsx     # 侧边栏 + 路由
│   │   ├── ChatMessage.tsx
│   │   ├── FileExplorer.tsx
│   │   ├── NoteCard.tsx
│   │   └── SearchModal.tsx
│   ├── pages/             # 页面
│   │   ├── KnowledgeGraph.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Workflow.tsx
│   │   ├── Editor.tsx
│   │   ├── Study.tsx
│   │   └── Chat.tsx
│   ├── hooks/             # 自定义 Hooks
│   ├── services/          # API 客户端
│   │   └── api.ts
│   └── data/              # Mock 数据
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/vault/stats` | 知识库统计 |
| GET | `/api/vault/graph` | 图谱数据 |
| GET | `/api/vault/health` | 健康检查 |
| GET | `/api/vault/files?q=` | 搜索笔记（加权） |
| GET | `/api/vault/file?path=` | 获取笔记详情 |
| GET | `/api/vault/tree` | 文件树 |
| POST | `/api/vault/file` | 创建笔记 |
| PUT | `/api/vault/file` | 更新笔记 |
| DELETE | `/api/vault/file` | 删除笔记 |
| PATCH | `/api/vault/file/rename` | 重命名笔记 |
| POST | `/api/chat` | AI 聊天 |
| GET | `/api/ingest/status` | 导入状态 |
| POST | `/api/ingest/upload` | 上传文档 |
| POST | `/api/research` | AI 自动研究 |
| GET | `/api/research/gaps` | 知识缺口 |
| POST | `/api/vault/lint/fix` | Lint 自动修复 |
| POST | `/api/study/flashcards` | 生成复习卡片 |
| GET | `/api/study/review-due` | 复习提醒 |

## 许可证

MIT
