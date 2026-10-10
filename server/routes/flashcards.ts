import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { config, anthropic, markSelfWrite, invalidateCache } from '../context.js'
import { createFile } from '../vault-parser.js'
import { calculateSM2 } from '../algorithms/sm2.js'

export interface FlashcardItem {
  id: string
  title: string
  domain: 'cs_408' | 'math'
  subject: string
  chapter?: string
  front: string
  back: string
  mnemonic?: string
  pitfall?: string
  isForgotten: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  repetition: number
  intervalDays: number
  easinessFactor: number
  reviewCount: number
  masteryLevel: number
  lastReviewedAt?: string
  nextReviewAt?: string
  createdAt: string
  updatedAt: string
}

export const flashcardsRouter = Router()

function getFlashcardsFilePath(): string {
  const quizDir = path.resolve(config.vaultPath, '做题记录')
  if (!fs.existsSync(quizDir)) {
    fs.mkdirSync(quizDir, { recursive: true })
  }
  return path.join(quizDir, 'flashcards.json')
}

// 408 核心学科预置高频易忘经典闪卡
const INITIAL_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc-cs408-coa-01',
    title: 'Cache 三种映射方式与主存地址切分',
    domain: 'cs_408',
    subject: '计算机组成原理',
    chapter: '存储系统',
    front: '直接映射、全相联映射和组相联映射的主存地址是如何划分的？它们的块冲突率和硬件查找代价如何比较？',
    back: `### 1. 主存地址切分机制
- **直接映射**：\`主存标记 (Tag) + Cache行号 (Index) + 块内地址 (Offset)\`
  - 关系：主存块号 $j$ 映射到 Cache 行号 $i = j \\pmod M$。
- **全相联映射**：\`主存标记 (Tag) + 块内地址 (Offset)\`
  - 关系：可装入 Cache 任意空闲行，查找需要相联存储器按内容并发比对全部 Tag。
- **组相联映射 (r路)**：\`主存标记 (Tag) + 组号 (Set Index) + 块内地址 (Offset)\`
  - 关系：组号 $q = j \\pmod Q$。每组有 $r$ 个 Cache 行。组间直接映射，组内全相联。

### 2. 核心性能对比
- **块冲突率**：直接映射（最高，易抖动） > 组相联映射 > 全相联映射（最低）；
- **硬件成本与查表速度**：全相联（最贵最慢） > 组相联 > 直接映射（最便宜最快）。`,
    mnemonic: '💡 记忆口诀：直接最快最易撞，全相最灵查最忙，组相折中兼二美，组间直接组内全。',
    pitfall: '⚠️ 考研大题计算陷阱：组相联计算时，“组数”等于 Cache 总行数除以每组路数，千万不要把路数当作组数！',
    isForgotten: true,
    difficulty: 'hard',
    tags: ['408高频', 'Cache计算', '计组必背'],
    repetition: 0,
    intervalDays: 1,
    easinessFactor: 2.3,
    reviewCount: 0,
    masteryLevel: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fc-cs408-os-01',
    title: '死锁的四个必要条件与处理策略',
    domain: 'cs_408',
    subject: '操作系统',
    chapter: '死锁',
    front: '产生死锁的四个必要条件是什么？预防死锁、避免死锁、死锁检测与解除的核心区别是什么？',
    back: `### 1. 死锁产生的四个必要条件
1. **互斥条件**：资源在一段时间内只能为一个进程独占；
2. **不剥夺条件**：进程所获资源在未使用完前不能被强行剥夺；
3. **请求和保持条件**：进程已占有至少一个资源，又提出新资源请求且因等待而保持现有资源不放；
4. **循环等待条件**：存在进程-资源的循环等待链（$P_0$ 等 $P_1$, $P_1$ 等 $P_0$）。

### 2. 解决策略分层
- **死锁预防**：破坏 4 个必要条件之一（如静态预先分配破坏请求保持、顺序资源分配法破坏循环等待）。策略严格，资源利用率低；
- **死锁避免**：在动态分配前进行安全性检测（**银行家算法**），确保系统处于**安全状态**（存在安全序列）；
- **死锁检测与解除**：允许发生死锁，定期用**资源分配图化简法**检测死锁，并通过资源剥夺、撤销进程等手段解除。`,
    mnemonic: '💡 记忆口诀：互斥不剥求保持，循环等待锁必死；预防先破四条件，避免银行保安全。',
    pitfall: '⚠️ 易混淆辨析：系统处于“不安全状态”不一定会发生死锁，但发生死锁时系统一定处于不安全状态！',
    isForgotten: true,
    difficulty: 'medium',
    tags: ['408高频', '操作系统核心', '银行家算法'],
    repetition: 0,
    intervalDays: 1,
    easinessFactor: 2.4,
    reviewCount: 0,
    masteryLevel: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fc-cs408-ds-01',
    title: '平衡二叉树 (AVL) 四种失衡旋转机制',
    domain: 'cs_408',
    subject: '数据结构',
    chapter: '树与二叉树',
    front: 'AVL 树在插入节点后导致失衡，LL、RR、LR、RL 四种失衡情况分别如何单旋或双旋调整？旋转后各节点的相对顺序有何规律？',
    back: `### 1. 最小不平衡子树四种旋转
- **LL 旋转 (右单旋)**：
  - 失衡根节点 $A$ 的左子节点 $B$ 的左子树插入新节点导致失衡。
  - 调整：$B$ 节点提升为新根，$A$ 变为 $B$ 的右孩子，$B$ 原右子树挂到 $A$ 的左边。
- **RR 旋转 (左单旋)**：
  - 失衡根节点 $A$ 的右子节点 $B$ 的右子树插入导致失衡。
  - 调整：$B$ 提升为新根，$A$ 变为 $B$ 的左孩子，$B$ 原左子树挂到 $A$ 的右边。
- **LR 旋转 (先左后右双旋)**：
  - 在 $A$ 的左孩子 $B$ 的右子树插入导致失衡。
  - 调整：先对 $B$ 进行左旋，再对 $A$ 进行右旋，原孙子节点 $C$ 成为新根。
- **RL 旋转 (先右后左双旋)**：
  - 在 $A$ 的右孩子 $B$ 的左子树插入导致失衡。
  - 调整：先对 $B$ 进行右旋，再对 $A$ 进行左旋，$C$ 成为新根。

### 2. 不变性定理
旋转前后，**中序遍历序列严格保持单调递增**，二叉排序树性质永不改变！`,
    mnemonic: '💡 记忆口诀：左左右旋，右右左旋；左右先左后右，右左先右后左；中间节点拔高做新根！',
    pitfall: '⚠️ 易错点：双旋时，最终做新根的永远是插入路径上“失衡节点的孙子节点”，而不是儿子节点！',
    isForgotten: true,
    difficulty: 'hard',
    tags: ['408必背', 'AVL树', '二叉树旋转'],
    repetition: 0,
    intervalDays: 1,
    easinessFactor: 2.2,
    reviewCount: 0,
    masteryLevel: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fc-cs408-net-01',
    title: 'TCP 四次挥手状态机与 TIME_WAIT 2MSL',
    domain: 'cs_408',
    subject: '计算机网络',
    chapter: '传输层',
    front: 'TCP 连接释放四次挥手的具体报文标志（FIN/ACK）和状态转移？为什么客户端在最后必须等待 2MSL 时间才进入 CLOSED？',
    back: `### 1. 四次挥手时序
1. 客户端发送 \`FIN=1, seq=u\` $\\to$ 进入 \`FIN-WAIT-1\`；
2. 服务端回复 \`ACK=1, seq=v, ack=u+1\` $\\to$ 服务端进入 \`CLOSE-WAIT\`，客户端收到后进入 \`FIN-WAIT-2\`（半关闭状态）；
3. 服务端数据发送完毕后，发送 \`FIN=1, ACK=1, seq=w, ack=u+1\` $\\to$ 服务端进入 \`LAST-ACK\`；
4. 客户端回复 \`ACK=1, seq=u+1, ack=w+1\` $\\to$ 客户端进入 \`TIME-WAIT\`，等待 2MSL 后转为 \`CLOSED\`；服务端收到 ACK 后立即进入 \`CLOSED\`。

### 2. 必须等待 2MSL (最大报文生存时间) 的两大根因
1. **保证最后的 ACK 能够到达服务端**：若客户端最后一个 ACK 丢失，服务端会重传 FIN。等待 2MSL 可以保证客户端在收到重传的 FIN 时能再次重发 ACK；
2. **防止“已失效连接请求报文段”出现在本连接中**：等待 2MSL 使得本连接持续时间内所产生的所有报文段都从网络中消失，避免干扰下一次新建立的相同端口连接。`,
    mnemonic: '💡 记忆口诀：一发FIN二回ACK，半关之后再发FIN；四次挥手末等2MSL，防丢确认清残余。',
    pitfall: '⚠️ 易错点：只有**主动关闭连接方**才会进入 TIME_WAIT 状态！被动关闭方在收到最后 ACK 后直接 CLOSED。',
    isForgotten: true,
    difficulty: 'medium',
    tags: ['408高频', '网络协议', 'TCP状态机'],
    repetition: 0,
    intervalDays: 1,
    easinessFactor: 2.5,
    reviewCount: 0,
    masteryLevel: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fc-cs408-os-02',
    title: '虚拟内存地址转换全流程与 TLB / PageTable / Cache',
    domain: 'cs_408',
    subject: '操作系统',
    chapter: '内存管理',
    front: 'CPU 给出逻辑地址后，访问 TLB（快表）、PageTable（页表）、Cache（高速缓存）和主存的完整时序与判断分支是什么？',
    back: `### 1. 查找顺序核心法则
\`CPU 逻辑地址\` $\\to$ \`查 TLB (快表)\` $\\to$ \`查 PageTable (慢表)\` $\\to$ \`物理地址生成\` $\\to$ \`查 Cache\` $\\to$ \`访问主存\`

### 2. 关键判断分支与制约关系
- **TLB 命中 $\\implies$ 页表必定命中**（因为 TLB 是页表在硬件高速缓存中的子集）；
- **页表未命中 $\\implies$ 触发“缺页异常”**，必须由操作系统从外存调页入主存，此时 TLB 必然未命中；
- **TLB 命中与 Cache 命中相互独立**：TLB 缓存的是“虚页号到实页号的映射”，Cache 缓存的是“主存块数据”，TLB 命中不保证 Cache 命中！
- **缺页中断处理完成后**：重新执行刚才引发缺页的那条机器指令！`,
    mnemonic: '💡 记忆口诀：先虚后实，先快后慢；TLB命中页必在，缺页调盘再重执；Cache装数据，TLB装地址。',
    pitfall: '⚠️ 经典陷阱：缺页中断属于“内部异常（故障 Fault）”，处理完后返回当前发生异常的指令重新执行，而不是下一条指令！',
    isForgotten: true,
    difficulty: 'hard',
    tags: ['408大题', '虚拟内存', 'TLB与Cache'],
    repetition: 0,
    intervalDays: 1,
    easinessFactor: 2.1,
    reviewCount: 0,
    masteryLevel: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fc-cs408-net-02',
    title: 'TCP 拥塞控制四种算法与阈值变化',
    domain: 'cs_408',
    subject: '计算机网络',
    chapter: '传输层',
    front: '慢开始、拥塞避免、快重传、快恢复四个阶段中，拥塞窗口 (cwnd) 和慢开始门限 (ssthresh) 是如何动态调整的？收到 3 个重复 ACK 和超时重传的处理有何区别？',
    back: `### 1. 阶段演化规律
1. **慢开始 (Slow Start)**：$cwnd < ssthresh$，每收到一个 ACK，cwnd 翻倍（指数级增长）；
2. **拥塞避免 (Congestion Avoidance)**：$cwnd \\ge ssthresh$，每个 RTT 周期内 cwnd 仅增加 1 MSS（加法增大，线性增长）；
3. **网络拥塞 (超时 Timeout)**：
   - $ssthresh = \\max(cwnd / 2, 2)$；
   - $cwnd = 1$；
   - 重新进入慢开始阶段！
4. **快重传与快恢复 (收到 3 个 Duplicate ACK)**：
   - 收到连续 3 个冗余 ACK，立即重传丢失的报文段；
   - $ssthresh = cwnd / 2$；
   - $cwnd = ssthresh$（或 $ssthresh + 3$）；
   - 直接进入**拥塞避免**，而不回退到 1！`,
    mnemonic: '💡 记忆口诀：超时断崖跌到一，门限折半重起步；三冗重传不用慌，门限减半快恢复。',
    pitfall: '⚠️ 考研大题计算陷阱：注意横坐标是“传输轮次（RTT）”还是接收端确认的报文数，超时重传门限折半后向下取整还是向上取整。',
    isForgotten: true,
    difficulty: 'medium',
    tags: ['408统考大题', '拥塞控制', '计网计算'],
    repetition: 0,
    intervalDays: 1,
    easinessFactor: 2.3,
    reviewCount: 0,
    masteryLevel: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

function loadFlashcards(): FlashcardItem[] {
  try {
    const p = getFlashcardsFilePath()
    if (!fs.existsSync(p)) {
      saveFlashcards(INITIAL_FLASHCARDS)
      return INITIAL_FLASHCARDS
    }
    const raw = fs.readFileSync(p, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    saveFlashcards(INITIAL_FLASHCARDS)
    return INITIAL_FLASHCARDS
  } catch {
    return INITIAL_FLASHCARDS
  }
}

function saveFlashcards(cards: FlashcardItem[]): void {
  const p = getFlashcardsFilePath()
  fs.writeFileSync(p, JSON.stringify(cards, null, 2), 'utf8')
}

// ===== API 端点实现 =====

// 1. 获取闪卡列表
flashcardsRouter.get('/flashcards/list', (req, res) => {
  try {
    const { domain, subject, forgottenOnly } = req.query as {
      domain?: string
      subject?: string
      forgottenOnly?: string
    }

    let cards = loadFlashcards()

    if (domain && domain !== 'all') {
      cards = cards.filter(c => c.domain === domain)
    }
    if (subject && subject !== 'all') {
      cards = cards.filter(c => c.subject === subject)
    }
    if (forgottenOnly === 'true') {
      cards = cards.filter(c => c.isForgotten)
    }

    res.json({
      success: true,
      cards,
      totalCount: cards.length,
      forgottenCount: cards.filter(c => c.isForgotten).length,
      dueCount: cards.filter(c => {
        if (!c.nextReviewAt) return true
        return new Date(c.nextReviewAt) <= new Date()
      }).length
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || '获取闪卡列表失败' })
  }
})

// 2. 创建新闪卡
flashcardsRouter.post('/flashcards/create', (req, res) => {
  try {
    const {
      title,
      domain = 'cs_408',
      subject = '操作系统',
      chapter = '核心考点',
      front,
      back,
      mnemonic,
      pitfall,
      isForgotten = true,
      difficulty = 'medium',
      tags = []
    } = req.body

    if (!title?.trim() || !front?.trim() || !back?.trim()) {
      res.status(400).json({ error: '标题、正面问题和背面解析不能为空' })
      return
    }

    const cards = loadFlashcards()
    const now = new Date().toISOString()
    const newCard: FlashcardItem = {
      id: `fc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      domain,
      subject,
      chapter,
      front: front.trim(),
      back: back.trim(),
      mnemonic: mnemonic?.trim(),
      pitfall: pitfall?.trim(),
      isForgotten: Boolean(isForgotten),
      difficulty,
      tags: Array.isArray(tags) ? tags : [subject, '自定义考点'],
      repetition: 0,
      intervalDays: 1,
      easinessFactor: 2.5,
      reviewCount: 0,
      masteryLevel: isForgotten ? 0 : 1,
      nextReviewAt: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      createdAt: now,
      updatedAt: now
    }

    cards.unshift(newCard)
    saveFlashcards(cards)
    res.json({ success: true, card: newCard })
  } catch (err: any) {
    res.status(500).json({ error: err.message || '创建卡片失败' })
  }
})

// 3. 更新闪卡
flashcardsRouter.put('/flashcards/:id', (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    const cards = loadFlashcards()
    const idx = cards.findIndex(c => c.id === id)

    if (idx === -1) {
      res.status(404).json({ error: '卡片不存在' })
      return
    }

    cards[idx] = {
      ...cards[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    saveFlashcards(cards)
    res.json({ success: true, card: cards[idx] })
  } catch (err: any) {
    res.status(500).json({ error: err.message || '更新卡片失败' })
  }
})

// 4. 切换易忘状态 (⭐ 容易遗忘)
flashcardsRouter.post('/flashcards/toggle-forgotten', (req, res) => {
  try {
    const { id, isForgotten } = req.body as { id: string; isForgotten?: boolean }
    const cards = loadFlashcards()
    const card = cards.find(c => c.id === id)

    if (!card) {
      res.status(404).json({ error: '未找到指定卡片' })
      return
    }

    card.isForgotten = typeof isForgotten === 'boolean' ? isForgotten : !card.isForgotten
    card.updatedAt = new Date().toISOString()
    if (card.isForgotten && card.masteryLevel > 1) {
      card.masteryLevel = 1
    }

    saveFlashcards(cards)
    res.json({ success: true, card })
  } catch (err: any) {
    res.status(500).json({ error: err.message || '更新易忘标记失败' })
  }
})

// 5. 记录复习结果（结合 SM-2 艾宾浩斯间隔算法）
flashcardsRouter.post('/flashcards/review', (req, res) => {
  try {
    const { id, remembered, grade: rawGrade } = req.body as {
      id: string
      remembered: boolean
      grade?: number
    }

    const cards = loadFlashcards()
    const card = cards.find(c => c.id === id)

    if (!card) {
      res.status(404).json({ error: '卡片不存在' })
      return
    }

    // 若未传入显式 grade，则根据 remembered 自适应评分
    const grade = typeof rawGrade === 'number' ? rawGrade : (remembered ? 4 : 1)
    const sm2Result = calculateSM2(
      {
        repetition: card.repetition,
        intervalDays: card.intervalDays,
        easinessFactor: card.easinessFactor,
        reviewCount: card.reviewCount,
      },
      grade
    )

    card.repetition = sm2Result.repetition
    card.intervalDays = sm2Result.intervalDays
    card.easinessFactor = sm2Result.easinessFactor
    card.reviewCount = sm2Result.reviewCount
    card.lastReviewedAt = sm2Result.lastReviewAt
    card.nextReviewAt = sm2Result.nextReviewAt

    if (remembered) {
      card.masteryLevel = Math.min(3, card.masteryLevel + 1)
      if (card.masteryLevel >= 3) {
        card.isForgotten = false // 牢固掌握后可自动从易忘队列毕业
      }
    } else {
      card.masteryLevel = 0
      card.isForgotten = true // 遗忘时重新挂星
    }
    card.updatedAt = new Date().toISOString()

    saveFlashcards(cards)
    res.json({ success: true, card, sm2Result })
  } catch (err: any) {
    res.status(500).json({ error: err.message || '复习记录失败' })
  }
})

// 6. 删除卡片
flashcardsRouter.delete('/flashcards/:id', (req, res) => {
  try {
    const { id } = req.params
    let cards = loadFlashcards()
    const lenBefore = cards.length
    cards = cards.filter(c => c.id !== id)

    if (cards.length === lenBefore) {
      res.status(404).json({ error: '卡片未找到' })
      return
    }

    saveFlashcards(cards)
    res.json({ success: true, message: '卡片已成功删除' })
  } catch (err: any) {
    res.status(500).json({ error: err.message || '删除卡片失败' })
  }
})

// 7. AI 一键提炼知识点闪卡
flashcardsRouter.post('/flashcards/ai-generate', async (req, res) => {
  try {
    const { concept, text, subject = '操作系统', domain = 'cs_408' } = req.body

    if (!concept && !text) {
      res.status(400).json({ error: '请输入想提炼的知识点概念或提供讲义文本' })
      return
    }

    const inputDesc = concept ? `知识点概念：${concept}` : `讲义/参考书片段：\n${text.slice(0, 3000)}`
    const prompt = `你是一个深谙全国硕士研究生招生考试（408计算机综合与考研数学）的顶级命题与记忆学专家。
请根据以下知识点，制作 1 张极其精准、适合考研反复背诵的知识点记忆闪卡 (Flashcard)：

【知识点输入】：
学科：${subject}
${inputDesc}

【任务要求】：
1. title: 简短明了的知识点名称（10-25字）；
2. front: 正面记忆提问。设计成考研高频设问形式，直击该知识点的核心机制与极易混淆处；
3. back: 背面深度解析。分点列出核心考点要点、机制原理、核心公式（支持 KaTeX LaTeX $...$），排版清晰美观；
4. mnemonic: 记忆口诀/速记技巧。编一个琅琅上口、通俗生动的考研助记口诀；
5. pitfall: 考研命题陷阱。点出统考大题或选择题最常见的易错干扰项或丢分陷阱；
6. chapter: 推断所属章节（如：存储系统、进程管理、线性表、极限等）。

请严格只输出合法的 JSON 格式，禁止输出任何前缀或 markdown 外的多余字符：
{
  "title": "知识点标题",
  "chapter": "所属章节",
  "front": "正面考研提问",
  "back": "背面核心解析要点与公式",
  "mnemonic": "朗朗上口的速记口诀",
  "pitfall": "典型命题陷阱分析",
  "difficulty": "medium",
  "tags": ["${subject}", "核心考点"]
}`

    let cardData: any = null
    if (anthropic) {
      try {
        const model = config.ai?.model || 'deepseek-flash'
        const aiRes: any = await anthropic.messages.create({
          model,
          max_tokens: 2500,
          system: '你是一个严格输出结构化 JSON 的考研知识卡片生成引擎。只输出纯 JSON 对象，格式规范。',
          messages: [{ role: 'user', content: prompt }]
        })

        let raw = ''
        if (Array.isArray(aiRes.content)) {
          const t = aiRes.content.find((c: any) => c.type === 'text')
          raw = t?.text || aiRes.content[0]?.text || ''
        } else if (typeof aiRes.content === 'string') {
          raw = aiRes.content
        }

        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          cardData = JSON.parse(jsonMatch[0])
        }
      } catch (aiErr: any) {
        console.warn('AI generate flashcard failed, fallback to heuristic template:', aiErr.message)
      }
    }

    if (!cardData) {
      const targetName = concept || '408核心概念'
      cardData = {
        title: `${targetName} 核心机制与考点精解`,
        chapter: `${subject}高频章节`,
        front: `关于【${targetName}】，其核心定义、工作机理与在系统中的关键作用是什么？`,
        back: `### 核心考点机制\n1. **基本定义**：${targetName} 是该学科的重要考研考点；\n2. **实现原理**：注重掌握其硬件/软件运行环境与状态转移；\n3. **考研真题考法**：常以综合大题或核心选择题形式考查对比与计算。`,
        mnemonic: `💡 记忆口诀：吃透${targetName}概念理，区分物理与逻辑；公式定义记牢固，真题大题不丢分。`,
        pitfall: `⚠️ 典型陷阱：注意不要混淆概念的适用边界与前提条件。`,
        difficulty: 'medium',
        tags: [subject, '考研必背']
      }
    }

    res.json({
      success: true,
      cardData: {
        domain,
        subject,
        ...cardData
      }
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI 生成闪卡失败' })
  }
})

// 8. 导出闪卡到 Obsidian 知识库 (wiki/03-记忆闪卡/)
flashcardsRouter.post('/flashcards/export-obsidian', (req, res) => {
  try {
    const cards = loadFlashcards()
    const targetDir = 'wiki/03-记忆闪卡'
    let exportedCount = 0

    for (const card of cards) {
      const cleanTitle = card.title.replace(/[\\/:*?"<>|]/g, '_')
      const filePath = `${targetDir}/${card.subject}/${cleanTitle}.md`
      const content = `---
title: ${card.title}
type: flashcard
domain: ${card.domain}
subject: ${card.subject}
chapter: ${card.chapter || '核心考点'}
isForgotten: ${card.isForgotten}
masteryLevel: ${card.masteryLevel}
reviewCount: ${card.reviewCount}
tags: [${card.tags.join(', ')}]
updated: ${new Date().toISOString().split('T')[0]}
---

# 🎴 考研记忆闪卡：${card.title}

> **学科**：${card.subject} · ${card.chapter || '通用考点'}  
> **易忘状态**：${card.isForgotten ? '🔥 重点易忘标记' : '✅ 正常掌握'}  
> **艾宾浩斯复习轮次**：第 ${card.repetition} 轮 (已复习 ${card.reviewCount} 次)

---

## ❓ 记忆挑战（正面提问）

${card.front}

---

## 💡 核心解析与机理（背面答案）

${card.back}

${card.mnemonic ? `\n> **${card.mnemonic}**\n` : ''}
${card.pitfall ? `\n> **${card.pitfall}**\n` : ''}
`
      createFile(config.vaultPath, filePath, content)
      markSelfWrite(filePath)
      exportedCount++
    }

    invalidateCache()
    res.json({
      success: true,
      message: `已将 ${exportedCount} 张记忆闪卡同步写入 Obsidian 知识库！`,
      targetDir
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || '导出 Obsidian 失败' })
  }
})
