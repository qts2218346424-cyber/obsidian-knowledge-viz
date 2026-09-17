# Knowledge Viz 100 人以内可上线实施方案

> 目标：在不推翻当前本地优先桌面端的前提下，支持手机访问、登录、云端同步、平台 AI 和基础用户管理，先稳定服务 100 名以内的测试用户。

## 1. 结论

第一版不建议同时开发：

- 原生 Android App。
- 原生 iOS App。
- 自建完整认证系统。
- 自建向量数据库。
- 自建文件存储集群。
- 完整会员支付和复杂运营系统。

第一版采用：

```text
响应式 Web / PWA
        ↓
现有 Express API
        ├── 托管 PostgreSQL
        ├── 对象存储
        ├── 平台 AI 网关
        └── 管理接口

Electron 桌面端
        ├── 本地 Vault
        ├── 本地 Claude Code / Codex
        └── 可选云端同步
```

这样可以让手机用户直接通过浏览器体验，等核心流程稳定后再封装成 Android/iOS 应用。

## 2. 推荐技术方案

### 2.1 账号与认证

使用托管认证服务，不在项目中自行保存密码。

第一版支持：

- 邮箱验证码或 Magic Link。
- Google 登录。
- 游客模式。
- 账号注销。
- 设备列表和退出其他设备。

桌面端和手机端统一使用授权码加 PKCE。认证服务只负责身份，业务数据仍然由 Knowledge Viz 的 API 控制。

### 2.2 数据库

推荐使用托管 PostgreSQL：

- 生产环境：10GB 起步。
- 数据库备份：每日自动备份。
- 测试环境和生产环境分开。
- 向量搜索初期直接使用 PostgreSQL 扩展。
- 不把数据库文件放在 Google Drive。

如果完全没有预算，临时测试可以使用：

```text
服务器本地 SQLite
        +
每天压缩备份到 Google Drive
```

但手机、多设备和并发写入开始后，应尽快切换 PostgreSQL。

### 2.3 文件存储

数据库只保存文件元数据，文件本身放对象存储：

- 图片。
- PDF。
- 音频。
- 视频。
- 导入导出压缩包。

Google Drive 可以暂时作为：

- 数据库备份位置。
- 用户知识库导出归档。
- 开发阶段附件存储。

不建议让多个用户直接共用一个 Google Drive 文件夹作为实时同步数据库。

## 3. 100 人以内的部署规格

### 推荐起步规格

```text
API 服务器：2 vCPU / 4GB RAM / 40GB SSD
PostgreSQL：10GB 起步
对象存储：50～100GB
备份空间：100GB 以上
带宽：按实际流量弹性扩展
```

适用范围：

- 注册用户不超过 100 人。
- 同时在线用户 10～30 人。
- 每个用户平均 300～1,000 篇笔记。
- 每日 AI 请求约 100～500 次。
- 主要附件为图片和 PDF。

### 需要提前限制的资源

```text
单个用户单日 AI 请求：10～30 次
单次 AI 最大上下文：50,000 字符
单次 AI 最大输出：4,000 tokens
单个附件大小：50MB
单个用户附件空间：1GB 起步
单 IP 登录失败：短时间限流
```

这些限制可以防止单个测试用户耗尽服务器和 AI 额度。

## 4. 数据模型

### 用户和设备

```text
profiles
  id
  display_name
  avatar_url
  plan
  ai_quota
  created_at
  last_seen_at

devices
  id
  user_id
  device_type
  device_name
  app_version
  last_seen_at
  revoked_at
```

### 工作区和笔记

```text
workspaces
  id
  owner_id
  name
  mode                  # local / cloud / private
  created_at

notes
  id
  workspace_id
  path
  title
  content_markdown
  content_hash
  revision
  base_revision
  created_at
  updated_at
  deleted_at

note_links
  id
  workspace_id
  source_note_id
  target_note_id
  link_text

attachments
  id
  workspace_id
  note_id
  storage_key
  mime_type
  size
  content_hash
```

### AI 和个性化配置

```text
ai_sessions
  id
  user_id
  workspace_id
  project_id
  title
  mode                    # web / local-claude / local-codex
  created_at
  updated_at

ai_messages
  id
  session_id
  role
  content
  tool_calls
  created_at

user_preferences
  user_id
  theme_json
  layout_json
  dashboard_json
  ai_style_json

usage_records
  id
  user_id
  provider
  model
  input_tokens
  output_tokens
  status
  created_at
```

## 5. 多设备同步方案

第一版不要做复杂的实时协同编辑，只做“笔记级同步”：

```text
手机编辑
  ↓
读取本地 revision
  ↓
上传 content + base_revision
  ↓
服务器比较当前 revision
  ├── 相同：保存并 revision + 1
  └── 不同：生成冲突副本
```

冲突时不要静默覆盖，生成：

```text
原笔记
原笔记 - 冲突副本 - 手机
```

这样优先保证用户数据不丢失。

## 6. API 设计

### 认证与用户

```text
GET  /api/me
GET  /api/devices
POST /api/devices/revoke
POST /api/account/delete
```

### 工作区

```text
GET  /api/workspaces
POST /api/workspaces
PATCH /api/workspaces/:id
DELETE /api/workspaces/:id
```

### 笔记同步

```text
GET  /api/workspaces/:id/notes
GET  /api/notes/:id
POST /api/notes
PUT  /api/notes/:id
DELETE /api/notes/:id
POST /api/sync/push
GET  /api/sync/pull?cursor=...
```

### AI 网关

```text
POST /api/ai/chat
POST /api/ai/summarize
POST /api/ai/flashcards
GET  /api/ai/usage
GET  /api/ai/models
```

### 个性化设置

```text
GET  /api/preferences
PUT  /api/preferences/theme
PUT  /api/preferences/layout
PUT  /api/preferences/ai-style
```

现有 `/api/agent/chat` 和本地 Agent 接口可以继续保留，平台 AI 另外统一收口到 `/api/ai/*`。

## 7. 平台 AI 的可行方案

平台 AI 不应让客户端直接调用模型服务，而应经过：

```text
用户 Token
  ↓
Express API
  ↓
用户权限和额度
  ↓
知识库检索
  ↓
OpenAI-compatible Provider Adapter
  ↓
模型服务
```

### 三种 AI 来源

#### 平台 AI

普通用户默认使用，按套餐和额度限制。

#### 用户自己的 API

高级设置中配置 OpenAI-compatible API，密钥只在服务端加密保存。

#### 本地 Agent

桌面端连接用户自己的 Claude Code、Codex 或其他 Agent，手机端通过云端 AI 作为备用。

### AI 成本控制

- 默认使用经济型模型。
- 复杂任务才升级模型。
- 限制单次上下文大小。
- 每个用户设置每日预算。
- 记录输入输出 Token。
- 超额后暂停、降级或要求购买额度。
- 不默认长期保存完整 Prompt 和知识库内容。

## 8. UI 个性化第一版范围

第一版只做高价值、低复杂度的配置：

### 主题

- 浅色。
- 深色。
- 跟随系统。
- 3～5 个品牌配色。
- 自定义强调色。

### 布局

- 首页卡片显示/隐藏。
- 卡片排序。
- 侧边栏展开/收起。
- 阅读宽度。
- 字号和行高。

### AI 风格

```json
{
  "tone": "teacher",
  "verbosity": "balanced",
  "askFollowUp": true,
  "showSteps": true,
  "citeNotes": true,
  "endWithAction": true
}
```

第一版不开放完整 CSS 编辑器，避免用户把页面改坏。后续再增加主题模板和高级自定义。

## 9. 管理后台最小功能

100 人以内不需要复杂 BI 系统，先做一个内部管理页面：

- 用户列表。
- 用户搜索。
- 用户状态。
- 最后活跃时间。
- 客户端版本。
- 设备数量。
- AI 用量。
- 剩余额度。
- 工作区数量。
- 错误日志。
- 禁用账号。
- 重置额度。
- 功能灰度开关。

默认不展示用户笔记正文，后台只读取必要的运营数据。

## 10. 分阶段实施

### Milestone 1：云端基础

- 接入认证服务。
- 增加 `user_id`、`workspace_id`、`device_id`。
- 建立 PostgreSQL 表。
- 建立 RLS/服务端权限策略。
- 增加 `/api/me` 和工作区接口。

验收：

- 用户注册、登录、退出。
- A 用户无法读取 B 用户工作区。
- 账号注销后数据处理符合预期。

### Milestone 2：笔记同步

- 笔记上传、下载、删除。
- 增量同步游标。
- 冲突副本。
- 附件上传。
- Google Drive 备份任务。

验收：

- 电脑创建笔记，手机可以看到。
- 手机离线编辑，联网后可以同步。
- 两台设备同时修改不会静默丢失。

### Milestone 3：平台 AI

- `/api/ai/chat`。
- 用户额度。
- 模型路由。
- OpenAI-compatible Provider Adapter。
- AI 会话云端保存。
- 请求错误和成本记录。

验收：

- 没有 API Key 的用户可以使用平台 AI。
- 客户端看不到平台 API Key。
- 超额度后请求被阻止。
- AI 只能访问当前用户授权的知识。

### Milestone 4：移动端体验

- 响应式页面。
- PWA 安装。
- 底部导航。
- 移动端编辑器。
- 移动端 AI 弹窗。
- 移动端复习页面。

验收：

- 375px 宽度下核心页面可用。
- 手机端可以登录、查看、编辑、同步和 AI 查询。
- 断网时可以查看最近内容。

### Milestone 5：运营后台

- 用户管理。
- AI 用量管理。
- 版本灰度。
- 错误监控。
- 用户反馈。

## 11. 上线前检查清单

### 功能

- 登录、退出和注销。
- 多设备登录。
- 笔记同步和冲突副本。
- 附件上传和删除。
- 平台 AI 和额度。
- 本地 Agent 连接。
- 主题和 AI 风格保存。

### 安全

- 所有业务表按 `user_id` 或 `workspace_id` 隔离。
- 客户端不包含平台 AI Secret。
- 管理接口单独权限。
- 附件使用临时访问地址。
- 登录、AI、上传接口限流。
- 数据库和文件有自动备份。

### 可观测性

- `/api/health`。
- API 错误日志。
- AI 请求耗时和用量。
- 同步失败记录。
- 客户端版本统计。
- 服务异常告警。

### 发布标准

- 100 个测试账号可正常注册。
- 30 个并发请求不崩溃。
- 连续运行 72 小时无明显内存泄漏。
- 数据库可恢复。
- 备份可下载并成功恢复到测试环境。
- 手机端核心流程完整走通。

## 12. 当前项目的落地顺序

建议在现有仓库中按以下顺序实现：

1. `server/auth`：认证和用户上下文。
2. `server/db`：PostgreSQL 连接、迁移和数据访问层。
3. `server/sync`：工作区、笔记和冲突同步。
4. `server/ai-gateway`：平台 AI、额度和模型适配。
5. `src/services/account.ts`：前端账号状态。
6. `src/services/sync.ts`：前端同步队列。
7. `src/pages/Settings.tsx`：主题、布局和 AI 风格。
8. `src/pages/Admin.tsx`：内部用户管理。
9. `src/pages/MobileHome.tsx`：移动端首页和底部导航。

## 13. 暂不实现

为了保证 100 人以内版本可上线，暂时不做：

- 实时多人协同编辑。
- 自建 Kubernetes。
- 自建向量数据库集群。
- 完整支付系统。
- 复杂推荐算法。
- 社区主题市场。
- 全量端到端加密和云端 AI 同时开启。
- 让公共服务器直接执行用户电脑上的本地 Agent。

