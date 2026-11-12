import { FileText, Download, Loader2, ChevronRight, ArrowRight, Trash2, Sparkles, Edit3, CheckCircle2, Database, ExternalLink } from 'lucide-react'
import { api, type BookItem } from '../../../services/api'

interface PdfShelfTabProps {
  books: BookItem[]
  filteredPdfs: BookItem[]
  batchExtracting: boolean
  batchResultMsg: string | null
  handleBatchExtractAll: () => void
  handleDeleteBook: (book: BookItem, e?: React.MouseEvent) => void
  handleOpenRename: (book: BookItem, e?: React.MouseEvent) => void
  setActivePdf: (book: BookItem | null) => void
  setBatchResultMsg: (msg: string | null) => void
  setExtractingBook: (book: BookItem | null) => void
  setImportModalOpen: (open: boolean) => void
}

export default function PdfShelfTab({ books, filteredPdfs, batchExtracting, batchResultMsg, handleBatchExtractAll, handleDeleteBook, handleOpenRename, setActivePdf, setBatchResultMsg, setExtractingBook, setImportModalOpen }: PdfShelfTabProps) {
  return (

          <div className="space-y-5">

            {/* 智能解析与知识库/题库归类总控条 */}

            <div className="bento-card rounded-xl border border-neutral-200/80 bg-white p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">

              <div className="flex items-center gap-3.5">

                <div className="p-2.5 rounded-lg bg-neutral-900 text-white shrink-0 shadow-xs">

                  <Database className="w-5 h-5" />

                </div>

                <div>

                  <div className="flex items-center gap-2">

                    <h3 className="text-sm sm:text-base font-bold text-neutral-900">

                      AI 讲义 & 题目自动解析归类引擎

                    </h3>

                    <span className="subframe-pill text-[10px]">

                      双轨深度整合

                    </span>

                  </div>

                  <p className="text-xs text-neutral-500 mt-1">

                    全自动研读 PDF 讲义：提取知识点精讲归入知识图谱，抽取真题与解析批量注入题库。

                  </p>

                </div>

              </div>



              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">

                <button

                  type="button"

                  onClick={handleBatchExtractAll}

                  disabled={batchExtracting || books.length === 0}

                  className="subframe-btn-black px-4 py-2 flex items-center gap-2 disabled:opacity-50 cursor-pointer text-xs font-medium"

                  title="全自动将当前所有教材与真题卷排队解析入库"

                >

                  {batchExtracting ? (

                    <>

                      <Loader2 className="w-3.5 h-3.5 animate-spin" />

                      <span>正在批量排队解析...</span>

                    </>

                  ) : (

                    <>

                      <Sparkles className="w-3.5 h-3.5" />

                      <span>⚡ 一键批量自动解析全部资料</span>

                    </>

                  )}

                </button>

                <a

                  href="/quiz"

                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-warm-700 bg-surface border border-cream-200 hover:border-amber-400 hover:text-amber-700 transition-colors flex items-center gap-1.5"

                >

                  <span>前往做题中心</span>

                  <ArrowRight className="w-3.5 h-3.5" />

                </a>

              </div>

            </div>



            {batchResultMsg && (

              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800 flex items-center justify-between animate-fadeIn">

                <div className="flex items-center gap-2">

                  <CheckCircle2 className="w-4 h-4 text-green-600" />

                  <span>{batchResultMsg}</span>

                </div>

                <button

                  type="button"

                  onClick={() => setBatchResultMsg(null)}

                  className="text-warm-400 hover:text-warm-600 text-xs"

                >

                  关闭

                </button>

              </div>

            )}



            {filteredPdfs.length === 0 ? (

              <div className="text-center py-16 text-warm-400 space-y-3 bg-surface border border-neutral-200/80 rounded-xl">

                <FileText className="w-12 h-12 mx-auto opacity-30 text-rose-400" />

                <div className="text-sm font-medium">暂无匹配的 PDF 电子教材或真题卷</div>

                <p className="text-xs text-warm-400 max-w-sm mx-auto">

                  点击右上角「导入教材/PDF」上传你的 408 全书、真题试卷或李林数学讲义，即可在此内嵌原生沉浸阅读与自动解析！

                </p>

                <button

                  onClick={() => setImportModalOpen(true)}

                  className="px-4 py-2 rounded-xl bg-accent-orange text-white text-xs font-semibold hover:bg-accent-orange/90 transition-colors shadow-xs"

                >

                  立即导入手头 PDF

                </button>

              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {filteredPdfs.map(book => {

                  const sizeMb = (book.size / (1024 * 1024)).toFixed(2)

                  const isCs = book.domain === 'cs_408'

                  const isExtracted = book.extractedInfo?.isExtracted

                  return (

                    <div

                      key={book.id}

                      onClick={() => setActivePdf(book)}

                      className={`bg-surface border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between group ${

                        isExtracted

                          ? 'border-green-500/30 hover:border-green-500/60'

                          : 'border-cream-200 hover:border-cyan-400/50'

                      }`}

                    >

                      <div>

                        <div className="flex items-center justify-between gap-2 mb-2.5">

                          <div className="flex items-center gap-1.5 flex-wrap">

                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">

                              PDF 电子教材

                            </span>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${

                              book.scope === 'personal'

                                ? 'bg-indigo-500/10 text-indigo-700 border-indigo-500/25'

                                : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25'

                            }`}>

                              {book.scope === 'personal' ? '🔒 个人独享' : '🌐 全员共享'}

                            </span>

                          </div>

                          <span className="text-[11px] text-warm-400 shrink-0">

                            {sizeMb} MB

                          </span>

                        </div>



                        {/* 归类沉淀状态指示 */}

                        <div className="mb-3">

                          {isExtracted ? (

                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-700 border border-green-500/20">

                              <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />

                              <span>已归类知识库 & 题库 (+{book.extractedInfo?.questionCount || 0}题)</span>

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20">

                              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />

                              <span>待智能解析与归类</span>

                            </span>

                          )}

                        </div>



                        <div className="flex items-start gap-3">

                          <div className={`p-2.5 rounded-xl border shrink-0 group-hover:scale-105 transition-transform ${

                            isExtracted ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'

                          }`}>

                            <FileText className="w-6 h-6" />

                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-1">

                              <h3 className="text-sm font-bold text-warm-800 group-hover:text-neutral-900 transition-colors leading-snug line-clamp-2">

                                {book.name}

                              </h3>

                              {book.canManage !== false && (

                                <button

                                  type="button"

                                  onClick={e => handleOpenRename(book, e)}

                                  className="p-1 rounded-md text-warm-400 hover:text-amber-600 hover:bg-amber-50 transition-all opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"

                                  title="修改教材名称"

                                >

                                  <Edit3 className="w-3.5 h-3.5" />

                                </button>

                              )}

                            </div>

                            <div className="text-[11px] text-warm-400 mt-1">

                              {isCs
                                ? '408 计算机'
                                : book.domain === 'english'
                                  ? '考研英语'
                                  : book.domain === 'politics'
                                    ? '考研政治'
                                    : book.domain === 'general'
                                      ? '专业课/综合'
                                      : '考研数学'} · {book.category}

                            </div>

                          </div>

                        </div>

                      </div>



                      <div className="mt-5 pt-3 border-t border-cream-200/60 flex items-center justify-between text-xs">

                        <span className="text-[11px] text-warm-400">

                          {new Date(book.lastModified).toLocaleDateString('zh-CN')}

                        </span>

                        <div className="flex items-center gap-1.5">

                          {/* 核心新增：一键智能解析归类按钮 */}

                          <button

                            type="button"

                            onClick={e => {

                              e.stopPropagation()

                              setExtractingBook(book)

                            }}

                            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer ${

                              isExtracted

                                ? 'bg-cream-100 hover:bg-cyan-50 text-warm-700 hover:text-cyan-700 border border-cream-300'

                                : 'subframe-btn-black'

                            }`}

                            title="AI 智能解析知识点归入知识库，抽取题目存入题库"

                          >

                            <Sparkles className="w-3.5 h-3.5" />

                            <span>{isExtracted ? '重新解析' : '智能解析入库'}</span>

                          </button>



                          {book.canManage !== false && (

                            <>

                              <button

                                type="button"

                                onClick={e => handleOpenRename(book, e)}

                                className="p-1.5 rounded-lg text-warm-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"

                                title="修改/重命名教材名称"

                              >

                                <Edit3 className="w-3.5 h-3.5" />

                              </button>

                              <button

                                type="button"

                                onClick={e => handleDeleteBook(book, e)}

                                className="p-1.5 rounded-lg text-warm-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"

                                title="删除该教材文件"

                              >

                                <Trash2 className="w-3.5 h-3.5" />

                              </button>

                            </>

                          )}

                          <a

                            href={api.getBookRawUrl(book.relativePath, book.scope)}

                            target="_blank"

                            rel="noreferrer"

                            onClick={e => e.stopPropagation()}

                            download={book.name}

                            className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-cream-200 transition-colors"

                            title="下载至本地"

                          >

                            <Download className="w-3.5 h-3.5" />

                          </a>

                          <a

                            href={`/pdf-reader?path=${encodeURIComponent(book.relativePath)}&scope=${encodeURIComponent(book.scope || 'shared')}&name=${encodeURIComponent(book.name)}`}

                            target="_blank"

                            rel="noreferrer"

                            onClick={e => e.stopPropagation()}

                            className="p-1.5 rounded-lg text-warm-400 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"

                            title="新标签页独立全屏阅读 (纯 Web 渲染，绝无白屏)"

                          >

                            <ExternalLink className="w-3.5 h-3.5 text-cyan-600" />

                          </a>

                          <span className="font-semibold text-red-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform ml-1">

                            内嵌阅读 <ChevronRight className="w-3.5 h-3.5" />

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
