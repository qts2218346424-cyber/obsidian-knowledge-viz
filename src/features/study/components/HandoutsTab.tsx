import { FileText, Target, Clock, ChevronRight } from 'lucide-react'
import type { HandoutItem } from '../../../data/handoutsData'

interface HandoutsTabProps {
  filteredHandouts: HandoutItem[]
  onResetFilters: () => void
  handleOpenHandout: (handout: HandoutItem) => void
  handlePracticeHandout: (handout: HandoutItem) => void
}

export default function HandoutsTab({ filteredHandouts, onResetFilters, handleOpenHandout, handlePracticeHandout }: HandoutsTabProps) {
  return (

          <div className="space-y-4">

            {filteredHandouts.length === 0 ? (

              <div className="text-center py-16 text-warm-400 space-y-3">

                <FileText className="w-12 h-12 mx-auto opacity-30" />

                <div className="text-sm">未找到匹配的讲义资料</div>

                <button

                  onClick={onResetFilters}

                  className="text-xs text-accent-orange hover:underline"

                >

                  重置筛选条件

                </button>

              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {filteredHandouts.map(handout => {

                  const isCs = handout.domain === 'cs_408'

                  return (

                    <div

                      key={handout.id}

                      onClick={() => handleOpenHandout(handout)}

                      className="bg-surface border border-cream-200 hover:border-neutral-900 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between group"

                    >

                      <div>

                        {/* Top tags */}

                        <div className="flex items-center justify-between gap-2 mb-2.5">

                          <div className="flex items-center gap-1.5">

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${

                              isCs

                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'

                                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'

                            }`}>

                              {isCs ? '408 计算机' : '考研数学'} · {handout.subject}

                            </span>

                            <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20">

                              {handout.difficulty}

                            </span>

                          </div>

                          <span className="text-[11px] text-warm-400 flex items-center gap-1">

                            <Clock className="w-3 h-3" /> {handout.readTime}

                          </span>

                        </div>



                        {/* Title */}

                        <h3 className="text-sm md:text-base font-bold text-warm-800 group-hover:text-accent-orange transition-colors leading-snug">

                          {handout.title}

                        </h3>



                        {/* Summary */}

                        <p className="text-xs text-warm-500 mt-2 line-clamp-2 leading-relaxed">

                          {handout.summary}

                        </p>



                        {/* Key theorems preview */}

                        {handout.keyTheorems && handout.keyTheorems.length > 0 && (

                          <div className="mt-3 p-2.5 rounded-xl bg-cream-100/60 border border-cream-200/70 space-y-1">

                            {handout.keyTheorems.slice(0, 2).map((th, i) => (

                              <div key={i} className="text-[11px] text-warm-600 truncate flex items-center gap-1.5">

                                <span className="w-1.5 h-1.5 rounded-full bg-accent-orange shrink-0" />

                                <span className="truncate">{th}</span>

                              </div>

                            ))}

                          </div>

                        )}

                      </div>



                      {/* Bottom actions */}

                      <div className="mt-4 pt-3 border-t border-cream-200/60 flex items-center justify-between gap-2">

                        <div className="flex items-center gap-1.5">

                          {handout.tags.slice(0, 3).map((tag, idx) => (

                            <span key={idx} className="text-[10px] text-warm-400 bg-cream-200/60 px-1.5 py-0.5 rounded">

                              #{tag}

                            </span>

                          ))}

                        </div>



                        <div className="flex items-center gap-2">

                          <button

                            onClick={(e) => {

                              e.stopPropagation()

                              handlePracticeHandout(handout)

                            }}

                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 transition-colors shrink-0"

                            title="针对本讲义即刻生成 3 道真题测试"

                          >

                            <Target className="w-3 h-3" />

                            即练

                          </button>

                          <span className="text-xs font-semibold text-accent-orange group-hover:translate-x-0.5 transition-transform flex items-center">

                            精读 <ChevronRight className="w-3.5 h-3.5" />

                          </span>

                        </div>

                      </div>

                    </div>

                  )

                })}

              </div>

            )}

          </div>
  )
}
