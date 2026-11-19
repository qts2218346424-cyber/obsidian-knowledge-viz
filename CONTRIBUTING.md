# CoreForge 研核 · 开发者贡献指南 (Contributing Guide)

感谢你关注并愿意为 **CoreForge 研核** 贡献代码！本项目致力于构建一个面向计算机与全科考研的本地优先研学操作系统，并深度整合 Obsidian 知识库与本地自主智能体（Claude Code / Antigravity）。

---

## 🛠️ 本地开发环境要求

- **Node.js**: 20.x 或更高版本
- **包管理器**: npm (随 Node.js 自带)
- **操作系统**: Windows 10/11, macOS, 或 Linux
- **可选增强**:
  - [Claude Code CLI](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) (`npm i -g @anthropic-ai/claude-code`)
  - [Google Antigravity](https://antigravity.google)
  - [Ollama](https://ollama.com/) (本地离线大模型推理)

---

## 🚀 极速启动开发流程

1. **克隆代码库**
   ```bash
   git clone https://github.com/qts2218346424-cyber/obsidian-knowledge-viz.git
   cd obsidian-knowledge-viz
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **双核联调模式启动（前端 + 核心服务）**
   ```bash
   npm run dev:all
   ```
   - 前端 Vite 开发服务器: `http://localhost:5173`
   - 后端 Express 网关: `http://localhost:3001`

4. **Electron 桌面端开发联调**
   ```bash
   npm run electron:dev
   ```

5. **全量生产级构建验证**
   ```bash
   npm run build:all
   ```

---

## 📐 核心架构规范

```
obsidian-viz/
├── electron/          # Electron 桌面窗口管理与 IPC 原生桥接
├── server/            # 本地优先核心网关 (Express 5 + TypeScript)
│   ├── routes/        # 模块化业务路由 (vault, study, quiz, ai, local-agents)
│   ├── context.ts     # 全局运行时上下文、TTL 缓存与自写防御
│   └── local-agent-bridge.ts  # 宿主智能体 (Claude Code / Antigravity) CLI 桥接驱动
├── src/               # 前端核心用户界面 (React 19 + Tailwind CSS + D3 + KaTeX)
│   ├── components/    # 可复用原子 UI 组件 (Bento 卡片、公式微件、图谱弹窗)
│   ├── pages/         # 核心业务舱室 (Dashboard, Study, Quiz, Graph, Workflow)
│   └── services/      # 前端数据交互与 SSE 事件流解析
└── shared/            # 前后端同构类型定义与题库数据规范
```

---

## 📋 提交 PR 流程规范

1. **新建分支**：`git checkout -b feat/your-feature-name` 或 `fix/your-bug-fix`
2. **代码风格与构建自检**：在提交前务必运行 `npm run build:all`，确保 TypeScript 编译通过且无语法报错。
3. **提交信息规范**：遵循 Conventional Commits 规范，例如：
   - `feat: 增加考研数学错题变式题生成能力`
   - `fix: 修复本地 Ollama 自动探测端口超时问题`
   - `docs: 完善本地 Claude Code 桥接配置指南`
4. **发起 Pull Request**：详细描述改动的动机、验证方式及截图，维护者会在 24 小时内进行 Code Review。

---

## 💡 题库与学科包扩展规范

若你希望为 CoreForge 贡献新的学科包（如医学考博、法考、考公真题），请将规范化的题目 JSON 放置在 `src/data/` 对应学科目录下，遵循统一的题库 Schema 定义。
