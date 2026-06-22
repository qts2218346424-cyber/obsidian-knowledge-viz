# Obsidian Knowledge Viz

> 基于 Obsidian 知识库的可视化学习平台 —— 集知识图谱、AI 编辑、自动整理、408 考研复习于一体。

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)
![Vite](https://img.shields.io/badge/Vite-8-purple)
![Electron](https://img.shields.io/badge/Electron-42-cyan)
![Version](https://img.shields.io/badge/Version-1.2.0-orange)

---

## 功能一览

### 知识图谱 + 仪表盘

力导向图可视化展示笔记之间的关联网络，同时悬浮显示知识库健康评分、笔记数、标签统计等关键指标。

- D3.js 力导向图，节点可拖拽、搜索、过滤
- 单击节点跳转编辑器，双击预览内容
- 文件夹 / 标签颜色编码
- 悬浮面板显示知识库统计（可收起）
- 知识库健康评分（8 项指标）+ 一键自动修复

### 笔记编辑器 + AI 编辑

全功能 Markdown 编辑器，带实时预览和 AI 智能编辑。

- 格式化工具栏：粗体、斜体、删除线、标题(H1-H3)、有序/无序列表、引用、代码块、链接、Wiki 链接、表格、分隔线
- 键盘快捷键：`Ctrl+B` 粗体、`Ctrl+I` 斜体、`Ctrl+1/2/3` 标题
- **AI 编辑**：一键调用 AI 进行润色优化、简化内容、扩展补充、整理结构、修正语法、生成摘要
- 实时 Markdown 预览（GFM + 代码高亮）
- 文件管理：新建、保存、重命名、删除（回收站）
- 拖拽导入 PDF / DOCX / XLSX / PPTX 文档
- Frontmatter 编辑器
- 行号显示

### 笔记自动整理系统 (v1.2.0)

智能笔记管理工具集，帮助保持知识库整洁有序。

- **Fold 建议执行**：AI 分析笔记结构，给出移动/合并/添加标签/补充链接等优化建议，支持单条和批量一键执行
- **AI 自动文件夹重排**：智能分析笔记内容和主题，推荐文件归类方案并预览移动计划
- **定时自动整理**：可配置间隔的自动健康检查与修复，后台静默运行
- **重复内容检测**：多信号（标题相似度 + Jaccard + 标签重叠）检测重复笔记，支持一键合并
- **批量标签管理**：标签搜索、重命名、合并、删除，实时反馈操作结果
- 所有破坏性操作前自动备份到 `.obsidian-viz/backups/`

### 学习中心

#### 最近更新

替代传统复习卡片，按修改时间展示笔记变化。

- 按最近修改时间排序所有笔记
- 时间筛选：今天 / 本周 / 全部
- 自动检测自上次访问以来的新内容，标记提示
- 点击直接跳转编辑器

#### 每日错题

基于间隔重复的错题复习系统。

- 自动收集做题中的错误答案
- 三档评分：还是不会 / 模糊 / 已掌握
- 间隔重复算法自动安排复习时间
- 科目分类统计

#### 复习提醒

智能识别需要复习的笔记（自动排除模板、索引、说明性等非学习类笔记）。

- 按科目分组显示待复习笔记
- 优先级分级：3天（高）/ 7天（中）/ 14天（低）
- 排除规则：`_index` 文件、元数据/模板目录、少于80字的笔记、含 template 标签的笔记

#### 科目进度

四科笔记数量和字数的可视化统计。

- Recharts 柱状图展示各科对比
- 总笔记数、总字数、平均每篇字数

### 在线做题

408 考研专业课选择题练习系统，内置 145+ 道真题。

- 四科选择：数据结构、计算机组成原理、操作系统、计算机网络
- 练习模式（即时反馈 + 解析）和考试模式（批量提交 + 评分）
- **题库导入**：支持 JSON 文件上传、粘贴导入、AI 自动生成
- 题目导航、计时、科目正确率统计
- 做题记录自动保存到知识库 `做题记录/` 目录

### 背单词

考研英语词汇学习，1897 词考研核心词库，自动推送新词。

- **自动推送**：待复习不足 20 词时自动从词库补充新词，无需手动添加
- 渐变主题卡片（高频/中频/低频各有配色）
- 例句作为核心展示元素，配引号装饰
- 点击揭示释义，滑动过渡动画
- 三档评分：认识 / 模糊 / 不认识
- 间隔重复复习算法（认识+7天、模糊+3天、不认识+1天）
- 环形图统计面板（掌握率、认识/模糊/不认识分布）
- 词库浏览：分页搜索全部 1897 词，按词频/单元筛选
- 词根关系图：可视化词根、前缀、后缀关系
- 单元进度统计：各单元掌握/学习/新词分布
- 词汇导入：支持 CSV / JSON 格式

### 番茄钟

专注学习计时器，支持倒计时和正计时两种模式。

- **倒计时模式**：三种模式 —— 专注 (25min)、短休 (5min)、长休 (15min)
- **正计时模式**：从 0 开始计时，记录实际专注时长
- SVG 圆环进度指示器
- 可配置时长（15/20/25/30/45/60 分钟）
- 自动切换：专注 → 短休（每 4 轮 → 长休）
- Web Audio API 完成提示音
- 当日统计：番茄数、专注分钟数、轮次数

### 在线电台

内置多个网络电台，营造学习氛围。

- **Lo-fi 电台**：SomaFM Groove Salad / Fluid / Beat Blender 等
- **英语学习电台**：KEXP 90.3 / Radio Paradise 等
- **环境音电台**：SomaFM Drone Zone / Deep Space One / Sleepscapes 等
- 本地音乐扫描播放
- 分类卡片展示，播放动画

### 工作流引擎

- **文档导入**：PDF/DOCX/XLSX/PPTX → Markdown（基于 markitdown）
- **AI 实体提取**：自动识别概念、生成标签、创建 wikilinks
- **自动研究**：发现知识缺口，AI 生成结构化笔记
- **Lint 修复**：链接完整性、元数据覆盖率、标签一致性、孤立笔记

### AI 聊天

- 基于 Anthropic API（兼容任何 Anthropic 格式的服务）
- 自动检索相关笔记作为上下文
- 回答引用笔记卡片（可点击跳转）
- 一键保存回答为笔记

### 全局搜索

- `Ctrl+K` 快捷键触发
- 加权多词搜索（标题×5、标签×3、路径×2、内容×1）
- 内容片段高亮 + 键盘导航

---

## 技术栈

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

## 快速开始

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

## 项目结构

```
obsidian-knowledge-viz/
├── electron/                    # Electron 主进程
│   ├── main.js                  # 启动内嵌服务器 + 创建窗口
│   └── preload.js
├── server/                      # Express 后端
│   ├── index.ts                 # API 路由（2700+ 行）
│   ├── vault-parser.ts          # Vault 文件解析 + CRUD
│   ├── vault-ops.ts             # 备份/回滚/建议执行器
│   ├── tag-utils.ts             # Frontmatter 解析 + 标签操作
│   ├── duplicate-detector.ts    # 多信号重复检测 + 合并
│   ├── scheduler.ts             # 定时自动整理引擎
│   ├── schedule-store.ts        # 定时配置持久化
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
│   │   ├── study/
│   │   │   └── VocabTab.tsx     # 背单词组件
│   │   ├── vocab/
│   │   │   ├── WordBrowser.tsx  # 词库浏览
│   │   │   ├── VocabStats.tsx   # 单元进度统计
│   │   │   ├── WordRelations.tsx # 词根关系图
│   │   │   └── ImportPanel.tsx  # 词汇导入
│   │   └── workflow/
│   │       ├── SkillPanels.tsx  # Fold/Think/Lint 面板
│   │       ├── TagManager.tsx   # 标签管理 UI
│   │       └── DuplicatesPanel.tsx # 重复检测 UI
│   ├── pages/
│   │   ├── KnowledgeGraph.tsx   # 知识图谱 + 悬浮统计
│   │   ├── Workflow.tsx         # 工作流引擎（含定时整理控制）
│   │   ├── Editor.tsx           # 笔记编辑 + AI 编辑
│   │   ├── Study.tsx            # 学习中心（最近更新/错题/复习/进度）
│   │   ├── Quiz.tsx             # 在线做题 + 导入
│   │   ├── Vocabulary.tsx       # 背单词页面（5个标签页）
│   │   ├── Music.tsx            # 在线电台
│   │   ├── Pomodoro.tsx         # 番茄钟（倒计时+正计时）
│   │   ├── Chat.tsx             # AI 聊天
│   │   └── Settings.tsx         # 设置
│   ├── hooks/                   # 自定义 Hooks
│   ├── services/                # API 客户端
│   └── data/
│       ├── questions/           # 408 题库 (145+ 题)
│       ├── vocab-part1~4.ts     # 考研词库 (1897 词)
│       └── ambientSounds.ts     # 电台数据
├── dist/                        # 前端构建产物
├── dist-server/                 # 服务端构建产物
├── release/                     # Electron 打包产物
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## API 端点

### 知识库管理

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
| POST | `/api/vault/lint/fix` | Lint 自动修复 |
| POST | `/api/vault/reorganize` | AI 自动文件夹重排 |
| POST | `/api/vault/rollback` | 回滚到备份版本 |

### 笔记整理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/fold` | AI 分析笔记结构（建议） |
| POST | `/api/fold/apply` | 执行 Fold 建议 |
| GET | `/api/vault/tags` | 获取全部标签 |
| POST | `/api/vault/tags/rename` | 重命名标签 |
| POST | `/api/vault/tags/merge` | 合并标签 |
| POST | `/api/vault/tags/delete` | 删除标签 |
| GET | `/api/vault/duplicates` | 检测重复笔记 |
| POST | `/api/vault/duplicates/merge` | 合并重复笔记 |

### 定时整理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/schedule/status` | 定时整理状态 |
| POST | `/api/schedule/config` | 更新定时配置 |
| POST | `/api/schedule/run-now` | 立即执行一次 |

### 学习中心

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/study/review-due` | 复习提醒（自动排除模板笔记） |
| GET | `/api/study/daily-review` | 每日错题复习 |
| POST | `/api/study/review-complete` | 标记错题复习完成 |
| POST | `/api/study/error-log` | 添加错题记录 |
| GET | `/api/study/error-log` | 获取错题记录 |
| GET | `/api/study/vocabulary` | 词汇复习数据（含自动推送） |
| POST | `/api/study/vocabulary/add` | 添加单词 |
| POST | `/api/study/vocabulary/review` | 提交单词复习结果 |
| POST | `/api/study/vocabulary/generate` | 生成新词 |

### 词汇库

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/vocab/all` | 全部词汇（分页） |
| GET | `/api/vocab/stats` | 单元/词频统计 |
| GET | `/api/vocab/relations` | 词根关系图 |
| POST | `/api/vocab/import` | 导入词汇（CSV/JSON） |

### 其他

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/chat` | AI 聊天 |
| POST | `/api/agent/chat` | Agent 聊天 (SSE) |
| POST | `/api/quiz/submit` | 提交做题结果 |
| POST | `/api/quiz/generate` | AI 生成题目 |
| GET | `/api/quiz/history` | 做题历史 |
| POST | `/api/ingest/upload` | 上传文档 |
| POST | `/api/research` | AI 自动研究 |

---

## 下载

前往 [Releases](https://github.com/qts2218346424-cyber/obsidian-knowledge-viz/releases) 下载最新版本的 Windows 可执行文件。

解压后直接运行 `Knowledge-Viz.exe`，无需安装 Node.js。

---

## 更新日志

### v1.2.0 (2026-06-22)

- 新增笔记自动整理系统：Fold 建议执行、AI 文件夹重排、定时整理、重复检测、标签管理
- 学习中心优化：最近更新面板替代复习卡片、复习提醒自动排除模板笔记
- 番茄钟新增正计时模式
- 背单词自动推送新词
- 词汇库扩展至 1897 词，新增词库浏览/统计/关系图/导入

### v1.1.0

- Electron 桌面应用打包
- 在线电台、番茄钟、背单词功能

### v1.0.0

- 知识图谱、笔记编辑器、AI 聊天、在线做题

---

## 许可证

MIT
