# Knowledge Viz

> 面向 Obsidian Vault 的本地知识库、学习复习和 AI 工作台。

[![React](https://img.shields.io/badge/React-19-149eca)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff)](https://vite.dev/)
[![Electron](https://img.shields.io/badge/Electron-42-47848f)](https://www.electronjs.org/)
[![Version](https://img.shields.io/badge/Version-1.3.0-orange)](https://github.com/qts2218346424-cyber/obsidian-knowledge-viz/releases)

## 产品定位

Knowledge Viz 将知识整理、笔记编辑、学习复习和 AI 助手放在同一个工作区中。它优先读取本地 Obsidian Vault，适合个人学习、考研复习、研究记录和长期知识管理。

当前版本同时支持：

- 网页 AI：通过 Anthropic Messages API 或 OpenAI-compatible API 调用云端模型。
- Claude Code：在本机项目目录中运行本地 Claude Code。
- Codex：在本机项目目录中运行 Codex CLI，并保留 Agent 会话 ID。

## 1.3.0 版本更新

### AI 工作区

- 统一的 AI 弹窗工作区。
- 项目管理、会话管理和本地持久化。
- 每个项目可以配置独立的本地工作目录。
- Skill 选择、页面上下文和项目说明会自动传递给 AI。
- 支持网页 AI、Claude Code、Codex 三种运行模式。
- 支持本地 Agent 状态检测、SSE 流式输出和会话续接。

### 知识库与编辑器

- 首页仪表盘，展示 Vault 健康度、最近修改和下一步建议。
- Markdown 编辑与预览模式。
- 更适合普通用户的写作模式和 AI 编辑入口。
- 知识图谱、孤立笔记、断链、标签和重复内容分析。
- Fold、Lint、重复笔记、标签管理和定时整理工作流。
- 学习中心、错题复习、词汇学习、专注计时和题库功能。

### AI 接口

- Anthropic Messages API。
- OpenAI Chat Completions-compatible API。
- Tool Call 与 Tool Result 连续对话。
- OpenAI-compatible 文本、工具调用和工具结果冒烟测试。

## 快速开始

### 环境要求

- Node.js 20 或更高版本
- Windows、macOS 或 Linux
- Python 3（文档导入功能可选）

### 安装与开发

```bash
npm install
npm run dev:all
```

- 前端：`http://localhost:5173`
- API：`http://127.0.0.1:3001`

### 配置

复制配置模板：

```bash
copy server\config.example.json server\config.json
```

然后填写：

```json
{
  "vaultPath": "C:\\Users\\YourName\\Documents\\ObsidianVault",
  "port": 3001,
  "host": "127.0.0.1",
  "localAgents": {
    "claudeCommand": "claude",
    "codexCommand": "codex",
    "defaultCwd": ""
  },
  "ai": {
    "apiKey": "your-api-key",
    "baseURL": "https://api.openai.com/v1",
    "model": "gpt-4o-mini",
    "provider": "openai-compatible",
    "apiFormat": "openai"
  }
}
```

`server/config.json` 包含本地路径和密钥，已加入 `.gitignore`，不要提交到仓库。

## 本地 Agent 使用方式

打开页面右下角的 AI 助手，在顶部切换：

```text
网页 AI
Claude Code
Codex
```

选择 Claude Code 或 Codex 后，项目的本地工作目录会作为 Agent 的工作目录。项目、会话、Skill 和 Agent 会话 ID 会保存在浏览器本地工作区中。

检查本机 Agent：

```text
GET /api/local-agents/status
```

本地 Agent 桥接接口：

```text
POST /api/local-agents/chat
```

> 当前 1.3.0 版本适合桌面端或本机运行的 Knowledge Viz。面向公网用户时，推荐将本地 Agent 桥接层打包成独立的 Local Connector，让每位用户连接自己的电脑，而不是让公共服务器直接启动 Agent。

## 常用命令

```bash
# 前端开发服务器
npm run dev

# API 开发服务器
npm run server:dev

# 同时启动前端和 API
npm run dev:all

# 生产构建
npm run build:all

# 打包 Electron 应用
npm run pack

# OpenAI-compatible 适配层冒烟测试
npx tsx scripts/openai-compatible-smoke.ts
```

## 项目结构

```text
obsidian-viz/
├─ electron/                 Electron 主进程和 preload
├─ server/
│  ├─ index.ts                Express API
│  ├─ ai-client.ts            Anthropic/OpenAI-compatible 适配层
│  ├─ local-agent-bridge.ts   Claude Code/Codex 本地桥接
│  ├─ agent.ts                网页 AI Agent
│  └─ vault-parser.ts         Vault 解析与文件操作
├─ src/
│  ├─ components/
│  │  └─ AIAssistantModal.tsx AI 工作区弹窗
│  ├─ pages/                  首页、编辑、图谱、整理、学习
│  ├─ services/               API 与 AI 工作区状态
│  └─ data/                   Skill、题库和词汇数据
├─ scripts/                   本地测试脚本
└─ docs/                      设计与实施计划
```

## 主要 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 服务和 AI 配置状态 |
| GET | `/api/local-agents/status` | 检查 Claude Code/Codex |
| POST | `/api/local-agents/chat` | 调用本地 Agent |
| POST | `/api/agent/chat` | 网页 AI Agent 对话 |
| GET | `/api/vault/stats` | Vault 统计 |
| GET | `/api/vault/graph` | 知识图谱数据 |
| GET | `/api/vault/files` | 笔记搜索 |
| POST | `/api/vault/file` | 新建笔记 |
| PUT | `/api/vault/file` | 更新笔记 |
| POST | `/api/fold` | 分析笔记整理建议 |
| POST | `/api/vault/lint/fix` | 执行结构修复 |

## 构建与验证

发布前执行：

```bash
npm run build:all
npx tsx scripts/openai-compatible-smoke.ts
```

本地运行时还应检查：

```text
GET http://127.0.0.1:3001/api/health
GET http://127.0.0.1:3001/api/local-agents/status
```

## 安全与数据

- 默认使用本地 Vault 路径，不上传整个知识库。
- `server/config.json`、API 密钥和本地路径不进入 Git。
- 本地 Agent 的文件访问范围由项目工作目录和 Agent 自身权限控制。
- 生产环境建议使用本地回环地址、短期配对凭据和明确的文件修改确认。

## 许可证

当前项目处于持续开发阶段，许可证和正式发布渠道将在稳定版发布前补充。
