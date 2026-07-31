# AI Workspace Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将全局 AI 弹窗升级为可持续使用的本地 AI 工作区，支持项目、会话、Skill、上下文和历史持久化。

**Architecture:** 在前端增加一个轻量的 localStorage 工作区存储层，保存项目、会话、消息和已启用 Skill；弹窗只负责交互和布局，通过现有 `/api/agent/chat` 调用智能体，并把项目说明、页面上下文和 Skill 指令拼接到请求消息中。保留现有 `/chat` 页面，不改变现有后端工具执行链。

**Tech Stack:** React 19、TypeScript、React Router、Tailwind CSS、lucide-react、现有 SSE Agent API。

---

### Task 1: 建立 AI 工作区数据模型和持久化

**Files:**
- Create: `src/services/ai-workspace.ts`
- Modify: `src/components/AIAssistantModal.tsx`

- [ ] 定义 `AIProject`、`AISession`、`AIWorkspaceMessage`、`AISkill` 类型。
- [ ] 使用 `localStorage` 保存工作区，首次打开时创建“当前知识库”默认项目和空会话。
- [ ] 提供创建、删除项目，创建、删除、切换会话，更新消息和更新时间的纯函数。
- [ ] 对旧版本、非法 JSON 和缺失字段进行默认值恢复。

### Task 2: 增加内置 Skill 和上下文注入

**Files:**
- Create: `src/data/ai-skills.ts`
- Modify: `src/components/AIAssistantModal.tsx`

- [ ] 提供知识库问答、笔记整理、学习教练、研究助手、写作助手五个内置 Skill。
- [ ] Skill 包含名称、说明、图标颜色和指令文本。
- [ ] 弹窗允许启用多个 Skill，并在每次请求中注入项目说明、当前页面上下文和 Skill 指令。
- [ ] 保持实际写文件能力由现有 Agent 工具控制，Skill 只改变任务上下文和回答风格。

### Task 3: 重做 AI 弹窗工作区布局

**Files:**
- Modify: `src/components/AIAssistantModal.tsx`

- [ ] 左侧增加项目切换、创建项目、会话列表和新建会话。
- [ ] 顶部显示当前项目、当前页面上下文和已启用 Skill。
- [ ] 主区域保留流式消息、Markdown、快捷提问、Enter 发送和 Shift+Enter 换行。
- [ ] 增加 Skill 选择面板、项目创建面板、删除会话和删除项目操作。
- [ ] 移动端改为抽屉式侧栏，保证输入框和消息区可用。
- [ ] 每次关闭弹窗后保留当前会话；重新打开后恢复历史。

### Task 4: 回归测试和构建

**Files:**
- Modify: `src/services/api.ts` only if request typing needs adjustment.

- [ ] 运行 `npm run build:all`，确认 TypeScript 与 Vite 构建通过。
- [ ] 启动本地服务后验证 `/api/health` 与 `/api/agent/chat`。
- [ ] 验证刷新页面后项目、会话、消息和 Skill 仍然存在。
- [ ] 验证新建/删除项目和会话不会影响 Vault 文件。
- [ ] 验证弹窗在首页、编辑器、整理、图谱、学习中心都能打开并带入对应上下文。
