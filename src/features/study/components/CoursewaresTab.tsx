import { ArrowRight } from 'lucide-react'
import type { InteractiveCoursewareItem } from '../../../data/interactiveCourseware'

interface CoursewaresTabProps {
  filteredCoursewares: InteractiveCoursewareItem[]
  onOpenCourseware: (item: InteractiveCoursewareItem) => void
}

export default function CoursewaresTab({ filteredCoursewares, onOpenCourseware }: CoursewaresTabProps) {
  return (

          <div className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">

              {filteredCoursewares.map(item => {

                const isCs = item.domain === 'cs_408'

                const isPol = item.domain === 'politics'

                const emojiMatch = item.title.match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u)

                const iconEmoji = emojiMatch ? emojiMatch[0] : isPol ? '🏛️' : isCs ? '💻' : '📐'

                const cleanTitle = emojiMatch ? item.title.slice(emojiMatch[0].length).trim() : item.title



                return (

                  <div

                    key={item.id}

                    onClick={() => onOpenCourseware(item)}

                    className="bento-card rounded-xl border border-slate-200/80 bg-white p-5 cursor-pointer transition-all duration-200 hover:border-slate-900 hover:shadow-xs active:scale-[0.99] flex flex-col justify-between group"

                  >



                    <div>

                      <div className="flex items-center justify-between gap-2 mb-3">

                        <span

                          className={`px-2 py-0.5 rounded-md text-2xs font-bold border ${

                            isPol

                              ? 'bg-rose-500/10 text-rose-700 border-rose-500/25'

                              : isCs

                              ? 'bg-cyan-500/10 text-cyan-700 border-cyan-500/25'

                              : 'bg-purple-500/10 text-purple-700 border-purple-500/25'

                          }`}

                        >

                          {isPol ? '考研政治' : isCs ? '408 计算机' : '考研数学'} · {item.subject}

                        </span>

                        <span className="text-2xs px-2 py-0.5 rounded-md font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">

                          {item.difficulty}

                        </span>

                      </div>



                      <div className="flex items-start gap-3">

                        <div

                          className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-lg shadow-xs group-hover:scale-105 transition-transform text-slate-800" 

                        >

                          {iconEmoji}

                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="text-sm font-bold text-warm-900 group-hover:text-slate-900 transition-colors leading-snug">

                            {cleanTitle}

                          </h3>

                          <p className="text-xs text-warm-500 mt-1.5 line-clamp-2 leading-relaxed">

                            {item.summary}

                          </p>

                        </div>

                      </div>



                      {/* 核心收获预览 */}

                      <div className="mt-3.5 p-2.5 rounded-xl bg-cream-100/75 border border-cream-200/80 space-y-1.5">

                        {item.learningPoints.slice(0, 2).map((pt, i) => (

                          <div key={i} className="text-2xs text-warm-600 flex items-center gap-1.5">

                            <span

                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${

                                isCs ? 'bg-cyan-500' : 'bg-orange-500'

                              }`}

                            />

                            <span className="truncate">{pt}</span>

                          </div>

                        ))}

                      </div>

                    </div>



                    <div className="mt-4 pt-3 border-t border-cream-200/70 flex items-center justify-between gap-2 text-xs">

                      <div className="flex items-center gap-1 min-w-0 overflow-hidden">

                        {item.tags.slice(0, 3).map((tag, idx) => (

                          <span

                            key={idx}

                            className="text-2xs text-warm-500 bg-cream-200/60 px-1.5 py-0.5 rounded truncate"

                          >

                            #{tag}

                          </span>

                        ))}

                      </div>



                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-600 text-cyan-700 group-hover:text-white font-bold text-2xs flex items-center gap-1 shrink-0 transition-all">

                        进入仿真 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />

                      </span>

                    </div>

                  </div>

                )

              })}

            </div>

          </div>
  )
}
