# Local Agent Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Knowledge Viz 页面中加入网页 AI、Claude Code 和 Codex 的统一运行方式切换，同时复用项目、会话、Skill 和当前 Vault 工作目录。

**Architecture:** 后端增加本地 Agent 桥接层，通过子进程启动本机 CLI，统一转换成 SSE 事件；Claude Code 使用 print + stream-json + session resume，Codex 使用可配置的本机 CLI/app-server 入口。前端在现有 AI 工作区中增加运行方式选择、命令检测、项目目录和本地会话参数，并继续保留网页 AI。

**Tech Stack:** Node.js child_process、Express SSE、React、TypeScript、现有 AI workspace localStorage、Claude Code CLI、Codex CLI/app-server。

---

### Task 1: 增加本地 Agent 桥接层

**Files:**
- Create: `server/local-agent-bridge.ts`
- Modify: `server/index.ts`

- [ ] 定义 `web`、`claude-code`、`codex` 三种运行方式。
- [ ] 检测本机命令是否存在，并返回版本/路径状态。
- [ ] Claude Code 使用 `--print --output-format stream-json --include-partial-messages`，首次使用 `--session-id`，后续使用 `--resume`。
- [ ] Codex 通过配置的 CLI 或 app-server 命令运行，先支持文本输出和 JSON/SSE 输出。
- [ ] 为本地 Agent 建立 `/api/local-agents/status` 和 `/api/local-agents/chat`。
- [ ] 所有进程都绑定当前项目工作目录，并将项目说明、Skill 指令和页面上下文拼入 prompt。

### Task 2: 扩展 AI 工作区状态

**Files:**
- Modify: `src/services/ai-workspace.ts`

- [ ] 为项目保存工作目录、运行方式和本地 Agent 会话 ID。
- [ ] 为会话保存 provider、model、agentSessionId 和工作目录。
- [ ] 保持旧 localStorage 数据可正常恢复，缺省运行方式为网页 AI。

### Task 3: 接入 AI 弹窗 UI

**Files:**
- Modify: `src/components/AIAssistantModal.tsx`
- Modify: `src/data/ai-skills.ts`

- [ ] 增加“网页 AI / Claude Code / Codex”运行方式选择器。
- [ ] 本地 Agent 模式显示命令状态、工作目录和连接提示。
- [ ] 对话请求按 provider 走 `/api/chat` 或 `/api/local-agents/chat`。
- [ ] 保持项目、会话、Skill、流式消息和工具调用展示。
- [ ] 本地 Agent 不可用时明确显示检测结果，同时网页 AI 继续可用。

### Task 4: 设置页与可执行入口配置

**Files:**
- Modify: `src/services/api.ts`
- Modify: `src/pages/Settings.tsx`
- Modify: `server/config.example.json`
- Modify: `README.md`

- [ ] 设置页显示本机 Claude Code/Codex 状态。
- [ ] 支持配置 Codex CLI 路径、Claude CLI 路径和默认工作目录。
- [ ] 不把密钥或命令行敏感参数写入前端。

### Task 5: 回归测试

**Files:**
- Create: `scripts/local-agent-smoke.ts`

- [ ] 运行网页 AI、Claude Code 检测和桥接层 mock 测试。
- [ ] 验证本地会话 ID 可被第二轮请求复用。
- [ ] 运行 `npm run build:all`。
- [ ] 验证网页 AI 现有接口没有回归。
