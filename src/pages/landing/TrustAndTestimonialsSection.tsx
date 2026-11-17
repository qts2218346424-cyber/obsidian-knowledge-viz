import { CloudCog, HardDriveDownload, Database } from 'lucide-react'

const EXAM_COVERAGE_ROWS = [
  {
    span: '38 年',
    years: '1987 – 2024',
    subject: '全国考研数学（数一 / 数二 / 数三）',
    detail: '统考整卷与分章题库及经典冲刺卷，全量经出版级 KaTeX 公式排版校勘。',
  },
  {
    span: '16 年',
    years: '2009 – 2024',
    subject: '408 计算机学科专业基础综合',
    detail: '自首届统考至今完整收录，涵盖四科客观题排雷与综合大题按步踩分标准。',
  },
  {
    span: '15 年',
    years: '2010 – 2024',
    subject: '全国考研英语（英语一 / 英语二）',
    detail: '完形、阅读、新题型与翻译整卷点词即查，配 20 分制精批与默写巡航词库。',
  },
  {
    span: '188 年',
    years: '1839 – 2026',
    subject: '全国考研思想政治理论',
    detail: '中国历史地图同城史实循环联动，涵盖“史上第一次”汇总、十五五时政与千题辨析。',
  },
]

const SENIOR_REVIEWS = [
  {
    name: '林同学 · 跨考计算机上岸',
    score: '初试 408 专业课 129 分',
    avatarChar: '林',
    content:
      '以前用题库软件刷完 408，错题和本地 Obsidian 里的笔记完全脱节。在研核做错 PV 同步或 Cache 映射题，一键就能生成双链错题卡归入知识库，配合 AVL 旋转动画把底层逻辑彻底吃透了。',
  },
  {
    name: '周同学 · 工科数学一备考',
    score: '初试数学一 138 分',
    avatarChar: '周',
    content:
      '备考十个月最怕笔记被平台锁死。研核最让我安心的是 1987 至 2024 年真题公式排版极其清晰，而且所有推导笔记都是开放的 Markdown 标准格式，随时可以打包导出到本地硬盘备份。',
  },
  {
    name: '陈同学 · 在职碎片化冲刺',
    score: '英语一 81 分 · 总分 396',
    avatarChar: '陈',
    content:
      '把官网添加到手机主屏幕后就像原生应用一样顺手。每天通勤单手翻完今日待复习闪卡，晚上回到书桌打开电脑，做题进度和生词早就同步就位了，作文四维升格也帮我跳出了模板套话。',
  },
]

export function TrustAndTestimonialsSection() {
  return (
    <section id="trust" className="w-full min-w-0 apple-section-gray py-20 sm:py-28">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 space-y-14 sm:space-y-20">
        {/* 标题导语 */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs sm:text-[13px] font-semibold tracking-wider text-[#6e6e73] mb-2.5">
            权威校勘与资产主权
          </p>
          <h2 className="apple-section-headline text-[#1d1d1f]">
            经得起长周期检验的题库与数据安全。
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-[#6e6e73] landing-pretty-copy">
            考研是一场数百天的持久战。严谨校对的历年真题与随时可导出的开放格式，守护你每一分钟的心血。
          </p>
        </div>

        {/* 上半部分：Apple 技术规格风真题覆盖表 + 深空黑本地主权卡 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* 左卡 (7 列)：真题收录年份技术规格表 */}
          <div className="lg:col-span-7 apple-tile-white p-7 sm:p-10 flex flex-col justify-between text-left">
            <div className="pb-5 border-b border-black/[0.06] flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.025em] text-[#1d1d1f]">
                  历年统考真题收录规格
                </h3>
                <p className="text-xs sm:text-[13px] text-[#6e6e73] mt-1">
                  整卷级人工与程序双重复核，解答大题附逐级踩分点对照
                </p>
              </div>
              <span className="text-xs font-medium text-[#86868b]">持续更新</span>
            </div>

            <div className="divide-y divide-black/[0.06] mt-2">
              {EXAM_COVERAGE_ROWS.map((row) => (
                <div
                  key={row.subject}
                  className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
                >
                  <div className="sm:w-32 shrink-0">
                    <div className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#1d1d1f] tabular-nums">
                      {row.span}
                    </div>
                    <div className="text-[11px] font-mono text-[#86868b] mt-0.5">{row.years}</div>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-sm sm:text-[15px] font-semibold text-[#1d1d1f]">
                      {row.subject}
                    </div>
                    <p className="text-xs sm:text-[13px] text-[#6e6e73] leading-relaxed">
                      {row.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右卡 (5 列)：100% 本地资产主权深空卡 */}
          <div className="cinema-dark-lock lg:col-span-5 apple-tile-dark p-7 sm:p-10 flex flex-col justify-between gap-8 text-left">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#86868b]">
                  开放格式 · 零平台锁定
                </p>
                <div className="mt-2 text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-[#f5f5f7] tabular-nums">
                  100% 自由导出
                </div>
                <p className="mt-2 text-xs sm:text-sm text-[#a1a1a6] leading-relaxed landing-pretty-copy">
                  既有云端跨设备秒级接力的便利，又保留纯正本地知识库的绝对掌控感。
                </p>
              </div>

              <div className="space-y-5 pt-2 border-t border-white/[0.08]">
                <div className="flex items-start gap-3.5">
                  <CloudCog className="w-5 h-5 text-[#2997ff] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="text-sm font-semibold text-[#f5f5f7]">
                      独立私有沙盒与多端同步
                    </div>
                    <p className="text-xs text-[#a1a1a6] mt-1 leading-relaxed">
                      每位用户拥有隔离的存储空间，刷题进度、错题本与记忆队列在电脑与手机间自动同步。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <HardDriveDownload
                    className="w-5 h-5 text-[#30d158] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#f5f5f7]">
                      标准 Markdown 一键无损备份
                    </div>
                    <p className="text-xs text-[#a1a1a6] mt-1 leading-relaxed">
                      所有笔记与错题均采用通用 <code className="text-[#f5f5f7]">.md</code> + LaTeX 格式，随时打包下载或直连本地 Obsidian。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Database className="w-5 h-5 text-[#ffd60a] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="text-sm font-semibold text-[#f5f5f7]">
                      试玩成果继承与双通道找回
                    </div>
                    <p className="text-xs text-[#a1a1a6] mt-1 leading-relaxed">
                      首页免登录试玩产生的问答与错题注册后自动归档；配备密保问答与 8 位救援码双保险。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#86868b]">
              <span className="font-mono text-[#d2d2d7]">claudexxb.online</span>
              <span>全链路 HTTPS 加密</span>
            </div>
          </div>
        </div>

        {/* 下半部分：真实备考反馈（Apple Editorial 引言卡） */}
        <div className="space-y-8">
          <div className="text-left max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
              来自真实考研人的备考回响。
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {SENIOR_REVIEWS.map((rev) => (
              <div
                key={rev.name}
                className="apple-tile-white p-7 sm:p-8 flex flex-col justify-between gap-6 text-left"
              >
                <p className="text-[13.5px] sm:text-sm text-[#1d1d1f]/85 leading-relaxed landing-pretty-copy">
                  “{rev.content}”
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-black/[0.05]">
                  <div className="w-9 h-9 rounded-full bg-[#f5f5f7] text-[#1d1d1f] font-semibold text-sm flex items-center justify-center shrink-0">
                    {rev.avatarChar}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#1d1d1f]">{rev.name}</div>
                    <div className="text-xs font-medium text-[#0066cc] mt-0.5">{rev.score}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
