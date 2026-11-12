import { useState } from 'react'
import { Check, Sparkles } from 'lucide-react'

// ── Subframe Screen 4 Replica: 考点掌握度状态色谱 (Mastery Palette) ──

const CS_408_SWATCHES = [

  { name: '二叉树遍历', stage: 'Gray 50', hex: '#F9FAFB', desc: '先序中序后序与线索化', border: true },

  { name: 'AVL/红黑树', stage: 'Gray 100', hex: '#F3F4F6', desc: '平衡旋转与插入调整', border: true },

  { name: 'Dijkstra算法', stage: 'Gray 200', hex: '#E5E7EB', desc: '单源最短路与贪心推演', border: false },

  { name: 'IEEE754浮点', stage: 'Gray 300', hex: '#BFC4CD', desc: '阶码尾数与规格化移码', border: false },

  { name: '流水线冒险', stage: 'Gray 400', hex: '#9CA3AF', desc: '结构/数据/控制冲突与转发', border: false },

  { name: '虚拟页式存储', stage: 'Gray 500', hex: '#6B7280', desc: '快表TLB命中率与多级页表', border: false },

  { name: 'PV信号量机制', stage: 'Gray 600', hex: '#4B5563', desc: '生产者消费者与哲学家就餐', border: false },

  { name: 'TCP拥塞控制', stage: 'Gray 700', hex: '#374151', desc: '慢开始/拥塞避免/快重传', border: false },

  { name: 'BGP/OSPF路由', stage: 'Gray 800', hex: '#1F2937', desc: '距离向量与链路状态算法', border: false },

  { name: '快速排序手撕', stage: 'Gray 900', hex: '#111827', desc: '双向划分与时间复杂度证明', border: false },

  { name: '408真题压轴', stage: 'Gray 950', hex: '#030712', desc: '软硬件协同综合应用大题', border: false },

]



const MATH_SWATCHES = [

  { name: '等价无穷小代换', stage: 'Violet 50', hex: '#F1EEFF', desc: '常见8组泰勒前置代换', border: false },

  { name: '洛必达与导数定义', stage: 'Violet 100', hex: '#E6E1FF', desc: '未定式极限判定法则', border: false },

  { name: '泰勒展开8大公式', stage: 'Violet 200', hex: '#D2CBFF', desc: '高阶无穷小精确截断展开', border: false },

  { name: '拉格朗日中值定理', stage: 'Violet 300', hex: '#B7ACFF', desc: '单调性与根的存在性证明', border: false },

  { name: '柯西中值与积分中值', stage: 'Violet 400', hex: '#9C8CFF', desc: '构造辅助函数的经典法门', border: false },

  { name: '反常积分审敛法', stage: 'Violet 500', hex: '#8470FF', desc: 'p级数对比判别法与极限法', border: false },

  { name: '多元微积分黑塞矩阵', stage: 'Violet 600', hex: '#755FF8', desc: '二次型正定与极值充分条件', border: false },

  { name: '伴随矩阵公式群', stage: 'Violet 700', hex: '#5D47DE', desc: '特征多项式与反矩阵乘积', border: false },

  { name: '特征值正交对角化', stage: 'Violet 800', hex: '#4634B1', desc: '实对称矩阵正交相似对角化', border: false },

  { name: '大数定律中心极限', stage: 'Violet 900', hex: '#2F227C', desc: '切比雪夫/辛钦/独立同分布', border: false },

  { name: '数一二三压轴精通', stage: 'Violet 950', hex: '#1C1357', desc: '微积分构造与矩阵方程秒杀', border: false },

]



export default function MasteryPaletteSection({ onSelectTopic }: { onSelectTopic: (topic: string) => void }) {

  const [copiedTopic, setCopiedTopic] = useState<string | null>(null)



  const handleCopyTopic = (topic: string, hex: string) => {

    navigator.clipboard?.writeText?.(topic)

    setCopiedTopic(topic)

    setTimeout(() => setCopiedTopic(null), 2500)

  }



  return (

    <div className="space-y-4 pb-28 sm:pb-8 animate-fade-in-up w-full min-w-0">

      {/* Top Floating Action Bar (Subframe Screen 4 Replica) */}

      <div className="flex flex-wrap items-center justify-between gap-2 py-1">

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white shadow-xs border border-zinc-200/70 text-xs font-semibold text-[#18181b]">

          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

          <span>考研考点掌握度状态色谱 (Mastery Palette)</span>

        </div>



        <div className="flex items-center gap-2">

          <div className="inline-flex items-center bg-white rounded-xl p-0.5 shadow-xs border border-zinc-200/70 text-xs font-medium text-[#27272a]">

            <button

              type="button"

              onClick={() => alert('已将当前 22 个核心考点掌握度进度导出为本地配置 JSON')}

              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"

            >

              <span>导出进度</span>

            </button>

            <button

              type="button"

              onClick={() => alert('已从本地知识库同步最新考点状态')}

              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"

            >

              <span>同步 Vault</span>

            </button>

          </div>



          <a

            href="/chat"

            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white shadow-xs text-xs font-medium hover:bg-black transition-colors"

          >

            <Sparkles className="w-3.5 h-3.5" />

            <span>Ask AI: 生成自测卷</span>

          </a>

        </div>

      </div>



      {copiedTopic && (

        <div className="px-3.5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium shadow-lg border border-neutral-800 flex items-center gap-2 animate-in fade-in">

          <Check className="w-3.5 h-3.5 text-emerald-400" />

          <span>已就绪考点「{copiedTopic}」，可直接前往做题中心或向 AI 导师提问</span>

        </div>

      )}



      {/* 408 Gray Palette Card (Screen 4 Exact Replica) */}

      <div className="bg-white rounded-2xl border border-zinc-200/70 p-5 sm:p-6 shadow-xs">

        <div className="flex items-center justify-between mb-5">

          <div>

            <h2 className="text-sm sm:text-base font-semibold text-[#18181b] flex items-center gap-2">

              <span>🖥️ 408 计算机学科专业基础 · 掌握度阶度</span>

            </h2>

            <p className="text-xs text-zinc-400 mt-0.5">从初识概念 (Gray 50) 到压轴综合大题手撕精通 (Gray 950)</p>

          </div>

          <span className="subframe-pill text-[11px]">11 级阶度</span>

        </div>



        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-y-6 gap-x-3 justify-items-center">

          {CS_408_SWATCHES.map((item, idx) => (

            <button

              key={idx}

              type="button"

              onClick={() => handleCopyTopic(item.name, item.hex)}

              className="group flex flex-col items-center focus:outline-none cursor-pointer text-center max-w-[84px]"

              title={`点击考查「${item.name}」：${item.desc}`}

            >

              <div

                className={`w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full mb-2 transition-transform group-hover:scale-105 shadow-xs flex items-center justify-center text-[10px] font-mono ${

                  item.border ? 'border border-zinc-200/90' : ''

                }`}

                style={{ backgroundColor: item.hex }}

              />

              <div className="text-[11px] font-semibold text-[#18181b] leading-tight group-hover:text-black line-clamp-1">

                {item.name}

              </div>

              <div className="text-[10px] text-[#8e9196] font-mono mt-0.5">

                {item.stage}

              </div>

            </button>

          ))}



          {/* Add custom topic button */}

          <button

            type="button"

            onClick={() => {

              const name = prompt('输入你想攻坚的 408 自定义考点名称:')

              if (name) alert(`已成功将「${name}」添加至 408 色谱掌握度跟踪器`)

            }}

            className="group flex flex-col items-center justify-start focus:outline-none cursor-pointer text-center"

            title="添加自建 408 考点"

          >

            <div className="w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full border border-dashed border-zinc-300 group-hover:border-zinc-400 group-hover:bg-zinc-50 flex items-center justify-center text-zinc-500 text-lg transition-colors mb-2">

              +

            </div>

            <div className="text-[11px] font-medium text-zinc-500">自建考点</div>

          </button>

        </div>

      </div>



      {/* Math Violet Palette Card (Screen 4 Exact Replica) */}

      <div className="bg-white rounded-2xl border border-zinc-200/70 p-5 sm:p-6 shadow-xs">

        <div className="flex items-center justify-between mb-5">

          <div>

            <h2 className="text-sm sm:text-base font-semibold text-[#18181b] flex items-center gap-2">

              <span>📐 考研数学 · 核心公式与定理掌握度色谱</span>

            </h2>

            <p className="text-xs text-zinc-400 mt-0.5">从公式初识 (Violet 50) 到压轴中值构造与证明秒杀 (Violet 950)</p>

          </div>

          <span className="subframe-pill text-[11px]">11 级阶度</span>

        </div>



        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-y-6 gap-x-3 justify-items-center">

          {MATH_SWATCHES.map((item, idx) => (

            <button

              key={idx}

              type="button"

              onClick={() => handleCopyTopic(item.name, item.hex)}

              className="group flex flex-col items-center focus:outline-none cursor-pointer text-center max-w-[84px]"

              title={`点击考查「${item.name}」：${item.desc}`}

            >

              <div

                className="w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full mb-2 transition-transform group-hover:scale-105 shadow-xs flex items-center justify-center text-[10px] font-mono"

                style={{ backgroundColor: item.hex }}

              />

              <div className="text-[11px] font-semibold text-[#18181b] leading-tight group-hover:text-black line-clamp-1">

                {item.name}

              </div>

              <div className="text-[10px] text-[#8e9196] font-mono mt-0.5">

                {item.stage}

              </div>

            </button>

          ))}



          {/* Add custom topic button */}

          <button

            type="button"

            onClick={() => {

              const name = prompt('输入你想攻坚的数学公式或定理名称:')

              if (name) alert(`已成功将「${name}」添加至考研数学色谱跟踪器`)

            }}

            className="group flex flex-col items-center justify-start focus:outline-none cursor-pointer text-center"

            title="添加自建数学考点"

          >

            <div className="w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full border border-dashed border-zinc-300 group-hover:border-zinc-400 group-hover:bg-zinc-50 flex items-center justify-center text-zinc-500 text-lg transition-colors mb-2">

              +

            </div>

            <div className="text-[11px] font-medium text-zinc-500">自建定理</div>

          </button>

        </div>

      </div>

    </div>

  )

}
