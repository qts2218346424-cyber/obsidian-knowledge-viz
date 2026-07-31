# 更新日志

## v1.3.0 — 2026-07-31

### 新增

- AI 工作区弹窗。
- 网页 AI、Claude Code、Codex 三种运行模式。
- AI 项目、会话和 Skill 管理。
- 本地 Agent 工作目录配置。
- Claude Code/Codex 状态检测和 SSE 流式输出。
- OpenAI-compatible API 适配层与冒烟测试。
- 首页仪表盘和知识库上手引导。

### 改进

- 优化笔记编辑器和 AI 编辑入口。
- 优化知识整理、学习复习和知识图谱页面。
- 增强 Windows 下本地命令启动和错误提示。
- 完善 Electron 主进程和生产构建配置。

### 验证

- `npm run build:all`
- `npx tsx scripts/openai-compatible-smoke.ts`
- `/api/health`
- `/api/local-agents/status`
