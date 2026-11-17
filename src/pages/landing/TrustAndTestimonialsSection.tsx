import {
  ShieldCheck,
  Database,
  HardDriveDownload,
  CloudCog,
  CalendarRange,
  CheckCircle2,
  Quote,
  Globe2,
  LockKeyhole,
} from 'lucide-react'

const EXAM_COVERAGE_ROWS = [
  {
    subject: '全国考研数学 (数一/二/三)',
    years: '1987 – 2024 年',
    detail: '38 年统考整卷与分章题库 + 经典名师密押卷，全量经 KaTeX 公式级排版校验',
    badgeCls: 'bg-purple-50 text-purple-700 border-purple-200/80',
  },
  {
    subject: '408 计算机学科专业基础综合',
    years: '2009 – 2024 年',
    detail: '自 2009 首届统考至今完整收录，涵盖四科客观题排雷与综合应用大题按步给分标准',
    badgeCls: 'bg-sky-50 text-sky-700 border-sky-200/80',
  },
  {
    subject: '全国考研英语 (英语一/英语二)',
    years: '2010 – 2024 年',
    detail: '历年阅读精读、长难句语法切分、大小作文三段论模板及 2000+ 真题同源词汇',
    badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  {
    subject: '全国考研思想政治理论',
    years: '1840 – 2024 史纲全轴',
    detail: '近现代史重大会议时空坐标对齐，配套马原/毛中特/史纲/思修高频单多选辨析卡',
    badgeCls: 'bg-rose-50 text-rose-700 border-rose-200/80',
  },
]

const SENIOR_REVIEWS = [
  {
    name: '林学长 · 跨考 408 上岸',
    tag: '初试 408 专业课 129 分',
    avatarBg: 'bg-sky-100 text-sky-800',
    avatarChar: '林',
    content:
      '以前用题库软件刷完 408，错题和自己 Obsidian 里的笔记完全是两张皮。在研核里做错 PV 操作或计组 Cache 映射题，一键就能生成带双链的错题卡归入个人知识库，搭配 AVL 树交互动画把旋转逻辑彻底吃透了。',
    highlight: '错题与双链笔记真正合一',
  },
  {
    name: '周学姐 · 工科数学一备考',
    tag: '初试数学一 138 分',
    avatarBg: 'bg-purple-100 text-purple-800',
    avatarChar: '周',
    content:
      '考研长达十个月，我最怕平台突然关停或笔记导不出来。研核最打动我的是 1987 到 2024 年真题公式排版极度清晰，而且所有推导笔记都是标准 Markdown 格式，每周我都能一键导出本地备份，踏实感无可替代。',
    highlight: '真题排版严谨 · 随时本地导出',
  },
  {
    name: '陈同学 · 二战碎片化冲刺',
    tag: '英语一 81 分 · 总分 396',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    avatarChar: '陈',
    content:
      '把 claudexxb.online 添加到手机主屏幕后就像原生软件一样顺手！每天食堂排队用手机单手翻完今日艾宾浩斯待复习闪卡，晚上回自习室打开电脑，进度和错题早就自动同步好了，英语作文点词升格也帮我告别了模板腔。',
    highlight: '手机电脑无缝同步接力',
  },
]

export function TrustAndTestimonialsSection() {
  return (
    <section
      id="trust"
      className="w-full min-w-0 py-16 sm:py-22 border-t border-slate-200/80 bg-white/85"
    >
      <div className="w-full max-w-[1280px] mx-auto px-3.5 sm:px-8 space-y-12 sm:space-y-16">
        {/* 标题导语 */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-2xs font-bold mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>权威题库核校 · 本地优先资产主权保障</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#18181b] tracking-[-0.03em]">
            经得起长周期备考检验的题库与数据安全
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-[#71717a] landing-pretty-copy">
            考研是一场数百天的持久战。我们用严谨的历年真题核校与随时可导出的开放格式，守护你每一分钟的心血。
          </p>
        </div>

        {/* 上半部分：历年真题覆盖年份明细 + 云端同步与本地导出架构 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* 左卡 (7 列)：历年统考真题权威覆盖年份表 */}
          <div className="lg:col-span-7 landing-bento-card rounded-3xl p-5 sm:p-7 flex flex-col justify-between gap-4 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <CalendarRange className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    历年统考真题收录年份与校勘标准
                  </h3>
                  <p className="text-2xs text-slate-500">拒绝残缺错漏题库，大题配备逐级踩分点核对</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-2xs font-bold">
                持续动态更新
              </span>
            </div>

            <div className="space-y-3">
              {EXAM_COVERAGE_ROWS.map((row) => (
                <div
                  key={row.subject}
                  className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {row.subject}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-bold ${row.badgeCls}`}
                      >
                        {row.years}
                      </span>
                    </div>
                    <p className="text-[11.5px] sm:text-xs text-slate-500 leading-relaxed">
                      {row.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右卡 (5 列)：云端多端同步 + 本地无损导出双轨安全承诺 */}
          <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#11131c] via-[#171b2e] to-[#0f172a] text-white p-5 sm:p-7 border border-slate-800 shadow-lg flex flex-col justify-between gap-5 text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-2xs font-bold">
                  <LockKeyhole className="w-3.5 h-3.5" />
                  <span>100% 个人知识资产主权</span>
                </span>
                <span className="text-2xs font-mono text-slate-400">claudexxb.online</span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  云端实时接力 · 本地随时无损导出
                </h3>
                <p className="mt-1.5 text-xs text-slate-300 leading-relaxed landing-pretty-copy">
                  不绑架任何一行笔记。既有云端跨设备秒级同步的便利，又保留纯正本地知识库的绝对安全感。
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
                  <CloudCog className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs sm:text-[13px] font-bold text-white">
                      独立沙盒隔离与多端实时云同步
                    </div>
                    <p className="text-2xs text-slate-300 mt-0.5 leading-relaxed">
                      每位注册用户分配独立私有存储空间，刷题记录、错题本、艾宾浩斯闪卡与 AI 问答在手机、平板、电脑间自动同步。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
                  <HardDriveDownload className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs sm:text-[13px] font-bold text-white">
                      开放标准 Markdown 一键导出本地
                    </div>
                    <p className="text-2xs text-slate-300 mt-0.5 leading-relaxed">
                      所有笔记与错题归档均采用通用 <code className="text-emerald-300">.md</code> + LaTeX 标准格式，支持随时一键下载备份至本机硬盘或直接接入本地 Obsidian。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
                  <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs sm:text-[13px] font-bold text-white">
                      试玩成果无缝继承 + 双通道找回守护
                    </div>
                    <p className="text-2xs text-slate-300 mt-0.5 leading-relaxed">
                      首页免登录试玩产生的问答与错题注册后自动写入个人空间；内置密保问答与 8 位救援码双保险。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-2xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>官方稳定访问域名：</span>
                <strong className="text-white font-mono">claudexxb.online</strong>
              </span>
              <span className="text-emerald-400 font-semibold">HTTPS 安全传输</span>
            </div>
          </div>
        </div>

        {/* 下半部分：真实上岸学长学姐使用评价 */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-left">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                来自真实考研人与上岸学长学姐的声音
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                从一轮基础构建到考前冲刺复盘，陪伴每一段全力以赴的备考时光
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>真实备考场景验证</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
            {SENIOR_REVIEWS.map((rev) => (
              <div
                key={rev.name}
                className="landing-bento-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-full font-extrabold text-sm flex items-center justify-center shrink-0 ${rev.avatarBg}`}
                      >
                        {rev.avatarChar}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900">{rev.name}</div>
                        <div className="text-2xs font-semibold text-indigo-600">{rev.tag}</div>
                      </div>
                    </div>
                    <Quote className="w-5 h-5 text-slate-200 shrink-0" />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed landing-pretty-copy">
                    “{rev.content}”
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-2xs font-bold text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{rev.highlight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
