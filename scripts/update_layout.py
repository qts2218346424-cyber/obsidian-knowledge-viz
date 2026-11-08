import sys

layout_file = 'obsidian-viz/src/components/Layout.tsx'

with open(layout_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 注入 subjectSpecialties 常量
subject_items_def = '''const subjectSpecialties = [
  { to: '/quiz?subject=408', label: '408 计算机专项', badge: '核心大题', emoji: '💻', desc: '数据结构 · 计组 · 操作系统 · 计网' },
  { to: '/quiz?subject=math', label: '考研数学', badge: '数一/数二/数三', emoji: '📐', desc: '高等数学 · 线性代数 · 概率统计' },
  { to: '/politics', label: '考研政治', badge: '肖秀荣1000题', emoji: '🏛️', desc: '史纲时空轴 · 肖秀荣1000题 · 考点收藏' },
  { to: '/english', label: '考研英语', badge: '作文批改', emoji: '📖', desc: '真题精读 · 写作批改 · 核心词库' },
]

'''

if 'const subjectSpecialties =' not in content:
    target_pos = content.find('const primaryNavItems: NavItem[] = [')
    content = content[:target_pos] + subject_items_def + content[target_pos:]

# 2. 注入 subjectMenuOpen 状态
if 'const [subjectMenuOpen, setSubjectMenuOpen] = useState(false)' not in content:
    old_state = '  const [mobileNavOpen, setMobileNavOpen] = useState(false)\n  const [moreOpen, setMoreOpen] = useState(false)'
    new_state = '  const [mobileNavOpen, setMobileNavOpen] = useState(false)\n  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false)\n  const [moreOpen, setMoreOpen] = useState(false)'
    content = content.replace(old_state, new_state, 1)

# 3. 定位替换切片
lines = content.splitlines(keepends=True)

start_idx = None
end_idx = None

for i, l in enumerate(lines):
    if '{/* Subframe Pill Primary Navigation */}' in l:
        start_idx = i
    if '{/* Mobile App Center Sheet Trigger */}' in l:
        end_idx = i

if start_idx is None or end_idx is None:
    print(f"Error: indices not found: start={start_idx}, end={end_idx}")
    sys.exit(1)

replacement = """          {/* ── 5 核心模块主导航 (Linear / Notion 极简克制呼吸感) ── */}
          <nav className="ml-1 2xl:ml-3 mr-3 2xl:mr-6 hidden flex-1 items-center justify-center gap-1.5 md:flex shrink-0 min-w-0" aria-label="主导航">
            {/* 1. 总览 */}
            <NavLink
              to="/dashboard"
              onPointerEnter={() => prefetchRoute('/dashboard')}
              className={({ isActive }) => navClass(isActive)}
              title="备考驾驶舱与每日概览"
            >
              {({ isActive }) => (
                <>
                  <Home className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  <span className="whitespace-nowrap font-medium">总览</span>
                </>
              )}
            </NavLink>

            {/* 2. 题库与模考 */}
            <NavLink
              to="/quiz"
              onPointerEnter={() => prefetchRoute('/quiz')}
              className={({ isActive }) => navClass(isActive && !['/politics', '/english'].includes(location.pathname))}
              title="真题精练、AI 组卷与错题本"
            >
              {({ isActive }) => (
                <>
                  <ClipboardList className={`h-3.5 w-3.5 shrink-0 ${isActive && !['/politics', '/english'].includes(location.pathname) ? 'text-white' : 'text-neutral-400'}`} />
                  <span className="whitespace-nowrap font-medium">题库与模考</span>
                </>
              )}
            </NavLink>

            {/* 3. 学科专攻 (408 / 考研数学 / 考研政治 / 考研英语 精准下拉) */}
            <div className="relative shrink-0" onMouseLeave={() => setSubjectMenuOpen(false)}>
              <button
                type="button"
                onClick={() => setSubjectMenuOpen(prev => !prev)}
                onMouseEnter={() => setSubjectMenuOpen(true)}
                className={navClass(
                  subjectMenuOpen ||
                  ['/politics', '/english'].includes(location.pathname) ||
                  location.search.includes('subject=')
                )}
                aria-expanded={subjectMenuOpen}
              >
                <GraduationCap className={`h-3.5 w-3.5 shrink-0 ${
                  subjectMenuOpen || ['/politics', '/english'].includes(location.pathname) || location.search.includes('subject=')
                    ? 'text-white'
                    : 'text-neutral-400'
                }`} />
                <span className="whitespace-nowrap font-medium">学科专攻</span>
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-200 ${subjectMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {subjectMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSubjectMenuOpen(false)} />
                  <div
                    onMouseEnter={() => setSubjectMenuOpen(true)}
                    className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-1.5 w-64 rounded-2xl border border-neutral-200/80 bg-white/95 p-2 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl animate-fade-in-up"
                  >
                    <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                      <span>考研核心科目专区</span>
                      <span className="text-[9px] text-indigo-500 font-mono">4 大专项</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {subjectSpecialties.map(sub => {
                        const isSubActive =
                          (sub.to === '/politics' && location.pathname === '/politics') ||
                          (sub.to === '/english' && location.pathname === '/english') ||
                          (location.pathname === '/quiz' && sub.to.includes(location.search) && location.search.length > 0)
                        return (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            onClick={() => setSubjectMenuOpen(false)}
                            className={`flex items-start gap-2.5 rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                              isSubActive
                                ? 'bg-indigo-50/80 text-indigo-900 font-semibold'
                                : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                            }`}
                          >
                            <span className="text-base shrink-0 mt-0.5">{sub.emoji}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-neutral-800 text-xs">{sub.label}</span>
                                {sub.badge && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60 font-mono">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-neutral-400 truncate mt-0.5">{sub.desc}</div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 4. 讲义与闪卡 */}
            <NavLink
              to="/study"
              onPointerEnter={() => prefetchRoute('/study')}
              className={({ isActive }) => navClass(isActive)}
              title="讲义精读、闪卡记忆、掌握度与仿真课件"
            >
              {({ isActive }) => (
                <>
                  <BookOpen className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  <span className="whitespace-nowrap font-medium">讲义与闪卡</span>
                </>
              )}
            </NavLink>

            {/* 5. AI 伴学 */}
            <NavLink
              to="/chat"
              onPointerEnter={() => prefetchRoute('/chat')}
              className={({ isActive }) => navClass(isActive)}
              title="多智能体导师答疑与推导"
            >
              {({ isActive }) => (
                <>
                  <Sparkles className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-amber-400 animate-pulse'}`} />
                  <span className="whitespace-nowrap font-medium">AI 伴学</span>
                </>
              )}
            </NavLink>
          </nav>

          {/* ── 右侧极简 3 核心组件：搜索 ⌘K、算力胶囊与用户矩阵头像 ── */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* 1. 全局快捷搜索框 ⌘K */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true)
                openModal('search')
              }}
              aria-label="全局检索"
              title="全局搜索知识库与真题（快捷键 Ctrl+K / ⌘K）"
              className="inline-flex items-center gap-2 h-8 px-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800 text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="hidden sm:inline font-normal">搜索...</span>
              <kbd className="inline-flex items-center text-[9px] font-mono text-slate-400 bg-white border border-slate-200/90 rounded px-1.5 py-0.5 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* 2. 算力伴学积分胶囊 */}
            {user && (
              <button
                type="button"
                onClick={() => {
                  setCheckinOpen(true)
                  openModal('checkin')
                }}
                className="relative inline-flex h-8 items-center gap-1.5 rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-50/90 to-amber-100/50 px-2.5 text-amber-900 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
                title={`伴学算力中心：当前可用 ${points.toFixed(1)} 算力点数 · 点击签到打卡或查看消费明细`}
              >
                <Coins className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="text-xs font-bold font-mono text-amber-950">
                  {points.toFixed(1)}
                </span>
                <span className="text-[10px] text-amber-700 font-medium hidden sm:inline">算力</span>
                {canCheckinToday && (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </button>
            )}

            {/* 3. 用户头像与多维矩阵下拉菜单 (集成设置、主题、随手记、导入等) */}
            {user && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="flex items-center gap-1.5 rounded-full p-0.5 border border-slate-200/90 hover:ring-2 hover:ring-indigo-100 transition-all cursor-pointer active:scale-95"
                  title={`${user.displayName || user.username} (${user.role === 'admin' ? '管理员' : '编辑者'}) · 点击展开设置与工具矩阵`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white bg-indigo-600 shadow-2xs">
                    {user.displayName ? user.displayName.slice(0, 1).toUpperCase() : user.username.slice(0, 1).toUpperCase()}
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-2xl border border-slate-200/90 bg-white/98 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl animate-fade-in-up text-slate-800">
                      {/* 用户基础信息卡片 */}
                      <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 mb-1.5">
                        <div className="text-xs font-bold text-slate-900 truncate">{user.displayName || user.username}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">@{user.username}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-slate-200/80 shadow-2xs">
                            {user.role === 'admin' ? '👑 超级管理员' : user.role === 'editor' ? '✍️ 研学编辑者' : '🎓 学生模式'}
                          </span>
                          <span className="text-[10px] font-mono text-amber-700">⚡ {points.toFixed(1)}分</span>
                        </div>
                      </div>

                      {/* 分组 1: 研学快捷工具 */}
                      <div className="px-2.5 pt-1.5 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        研学快捷动作
                      </div>
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            setQuickNoteOpen(true)
                            openModal('quick-note')
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <PenLine className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="font-medium">极速随手记</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            setImportModalOpen(true)
                            openModal('import-resource')
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Database className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="font-medium">导入资料与题库 (PDF/真题)</span>
                        </button>

                        <Link
                          to="/graph"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Network className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="font-medium">知识图谱网络</span>
                        </Link>

                        <Link
                          to="/editor"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <FileEdit className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="font-medium">Markdown 笔记编辑器</span>
                        </Link>

                        <Link
                          to="/workflow"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Workflow className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="font-medium">知识库整理工作流</span>
                        </Link>
                      </div>

                      {/* 分组 2: 界面与主题偏好 */}
                      <div className="px-2.5 pt-2 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                        界面与偏好
                      </div>
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            toggleThemeStyle()
                          }}
                          className="w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Palette className={`h-3.5 w-3.5 ${isVibrant ? 'text-indigo-600' : 'text-slate-500'}`} />
                            <span className="font-medium">视觉风格</span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                            {isVibrant ? '鲜艳活力' : '经典极简'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            setGuideOpen(true)
                            openModal('user-guide')
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-medium">新手指引全景手册</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            setInteractiveTourOpen(true)
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Compass className="h-3.5 w-3.5 text-indigo-500" />
                          <span className="font-medium">开启交互式新功能导览</span>
                        </button>
                      </div>

                      {/* 分组 3: 账号与系统设置 */}
                      <div className="px-2.5 pt-2 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                        账号与系统
                      </div>
                      <div className="space-y-0.5">
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Settings className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-medium">全局系统设置</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            setChangePasswordOpen(true)
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-medium">修改登录密码</span>
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false)
                              setUserManagementOpen(true)
                            }}
                            className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <UsersIcon className="h-3.5 w-3.5 text-indigo-600" />
                            <span className="font-medium">用户权限管理</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            logout()
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>退出登录</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
"""

new_lines = lines[:start_idx] + [replacement + "\n"] + lines[end_idx:]

with open(layout_file, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Layout.tsx updated successfully without extra closing tags!")
