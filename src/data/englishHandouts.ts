import type { HandoutItem } from './handoutsData'

/**
 * 考研英语核心解题方法论讲义库（英语一 & 英语二双轨通用）
 * 涵盖：传统阅读同义替换定位法、长难句三步剥离与五大从句拆解、新题型七选五/排序逻辑线索词、英译汉拆分组合法、大小作文一档高分句法。
 */
export const ENGLISH_HANDOUTS: HandoutItem[] = [
  {
    id: 'handout-eng-reading-paraphrase',
    title: '阅读理解 Part A：六大题型精准定位与同义替换破译法则',
    domain: 'english',
    subject: '考研英语',
    readTime: '16 分钟',
    difficulty: '真题必考',
    tags: ['考研英语', '阅读理解', '同义替换', '定位法', '干扰项排查'],
    summary: '系统拆解考研阅读 40 分命脉：题文同序定位铁律、事实细节/主旨/例证/态度/词义/推理六大题型破题公式，以及命题组十大设错陷阱清单。',
    keyTheorems: [
      '黄金铁律：考研阅读一切正确选项的本质，都是原文定位句的「同义改写（Paraphrase）」而非原词照抄',
      '题文同序原则：5 道题的出题顺序与文章自然段推进高度一致，跨段定位不超相邻两段',
      '例证题铁律：例子本身永远不选，答案必在例子前一句（或段首）所支撑的核心论点中',
      '转折高于一切：but / however / yet / nevertheless 之后必出题眼，转折后与段首句冲突时以转折后为准',
      '态度题陪跑黑名单：indifferent（漠不关心）、biased/prejudiced（偏见）、puzzled（困惑）、indulgent（纵容）必错',
    ],
    content: `# 阅读理解 Part A：六大题型精准定位与同义替换破译法则

> **考情总览**：传统阅读理解（Section II Part A）共 4 篇文章、20 道单选题、总计 **40 分**，“得阅读者得考研英语”。命题素材严选自 *The Economist*、*The Guardian*、*Scientific American*、*Harvard Business Review* 等严肃外刊，核心考查**精准定位信息区间**与**识别同义替换**的能力。

---

## 一、三步双轨定位法：拒绝盲目通读全文

### 1. 读题干划双锚点（先题后文，只读题干不读选项）
- **一级刚性锚点（不可替换词）**：大写专有名词（人名、机构名、法案名）、年份数字、带引号的特殊概念（如 *"attitude-behavior gap"*）、精确段落号（*Paragraph 3*）。
- **二级弹性锚点（核心实词组合）**：主语名词短语 + 核心谓语动词 + 宾语限定词。警惕题干中的名词在原文中词性转化为动词或形容词！

### 2. 利用「题文同序」锁定区间
- 若第 21 题定位在第 1 段，第 23 题定位在第 3 段末端，则第 22 题**必然落在第 2 段或第 3 段前半部分**。
- 当题干未给出明显专有名词时，直接用上下两题的定位边界“夹逼”出本题所在的唯一自然段。

### 3. 精读定位句及其「黄金上下句」
- 找到定位词所在句后，切勿孤立断章取义：若本句含有 **this / such / these + 抽象名词** 或 **however / instead / in fact**，必须向上追溯指代对象或向下读完转折重心。

---

## 二、六大核心题型标准解题公式

### 1. 事实细节题（占比约 50%）
- **识别标志**：题干含 what / why / how / according to Paragraph X，针对具体事实或因果提问。
- **破题心法**：**比对主谓宾与因果方向**。正确选项往往把原文的具体词进行**上位词概括（抽象化）**或**正话反说（双重否定表肯定）**。
  - 原文示例：*arts coverage simply doesn't attract enough advertising to justify large budgets.*
  - 同义正确项：*arts coverage failing to attract sufficient advertising.*（doesn't attract enough ⇔ failing to attract sufficient）

### 2. 例证题（送分题，切忌就事论事）
- **识别标志**：题干出现 **cite / mention / quote / use the example of / illustrate / demonstrate**。
- **破题心法**：**“例子本身是奴仆，服务前文主论点”**。
  1. 在原文定位例子所在句；
  2. 向上看紧挨着的前一句（若例子在段首，则看上一段末句或本段总结句）；
  3. **凡是选项里还在复述例子里具体人物、具体细节的，一律直接秒杀排除**！

### 3. 词汇与短语指代题
- **识别标志**：*The word/phrase "..." (Line X, Para. Y) most probably means ______.*
- **破题心法**：**“熟词僻义不选字面，超纲难词必有复现”**。
  - **正向同义逻辑**（and / or / 冒号 / 破折号 / 平行排比句）：前后情感色彩与动作方向一致；
  - **反向对立逻辑**（while / whereas / rather than / instead of / unlike / yet）：直接将反义词取反即得答案。

### 4. 主旨大意与最佳标题题
- **识别标志**：*best title / main idea / mainly discuss / primary purpose*。
- **破题心法**：
  - **串线摘帽法**：串联各段首句（遇到第 2 段首句出现 *However / Yet / Question* 时，**二段转折即全文中心论点，一段仅为抛砖引玉的旧观点背景**！）；
  - **中心词复现检验**：最佳标题必须完整涵盖全文高频复现的**核心话题词（Topic）+ 作者核心控制方向（Controlling Idea）**，排除只讲某一段细节的“以偏概全”项和范围过大的“大帽子”项。

### 5. 作者观点态度题
- **识别标志**：*author's attitude towards... / tone of the passage*。
- **三大阵营速判**：
  - **正向支持**：supportive, approving, optimistic, affirmative, appreciative；
  - **负向批判/质疑**：critical, skeptical, doubtful, disapproving, apprehensive（忧虑的）, cautious；
  - **客观中立**：objective, impartial, unbiased, balanced, nuanced（辩证细腻的）。
- **绝对陪跑黑名单（逢见必排）**：
  - 漠不关心类：*indifferent, unconcerned, detached, uninterested*（既然不关心，作者绝不会写几百词讨论）；
  - 主观偏激类：*biased, prejudiced, subjective, arbitrary, contemptuous*；
  - 糊涂困惑类：*puzzled, bewildered, confused, ambiguous*；
  - 纵容妥协类：*indulgent, permissive,compromising*。

### 6. 推理判断题
- **识别标志**：*infer / imply / suggest / learn from Paragraph X*。
- **破题心法**：**考研阅读的“推理”绝不是让你脑补延伸，而是“定位段落核心句的等价转述或段落小结”**！越是紧贴原文表述换个说法的选项，越是标准答案；往前多推一步的“过度推理”必错。

---

## 三、命题组十大高频干扰项陷阱（错题自检清单）

1. **拼凑嫁接（张冠李戴）**：把 A 句的主语拼接到 B 句的宾语上，满眼都是原文原词，但逻辑关系纯属捏造。
2. **因果倒置 / 强加因果**：原文两件事只是时间先后或并列伴随，选项硬加上 *lead to / result from / attribute to*。
3. **偷换情态与绝对化限定**：原文是 *may / sometimes / in part / tend to*，选项偷换成 *must / completely / exclusively / inevitably / never*。
4. **混淆时间与已然/未然态**：把“正在提议（propose to）”偷换为“已经立法生效（have enforced）”。
5. **正反混淆**：漏看原文隐蔽否定词（*hardly, seldom, little, free from, immune to, far from, anything but, devoid of*）。
6. **主次颠倒与比较级无中生有**：原文从未对 A 和 B 做高低比较，选项却无端造出 *more important than / primary factor*。
`,
  },
  {
    id: 'handout-eng-long-sentence',
    title: '长难句三步剥离法：五大核心从句与特殊句式实战拆解',
    domain: 'english',
    subject: '考研英语',
    readTime: '18 分钟',
    difficulty: '真题必考',
    tags: ['考研英语', '长难句', '五大从句', '语法拆解', '倒装强调'],
    summary: '彻底攻克长达 40~60 词的考研外刊长难句：通过“找谓语—去枝叶—切连词”三步手术刀，瞬间透视句子主干与定从、名从、状从、非谓语及倒装结构。',
    keyTheorems: [
      '黄金铁律：一个简单句有且仅有一套主干谓语动词；若有 N 个连词/关系词，则全句必有 N + 1 个谓语动词',
      '三步剥离口诀：一圈连词与标点，二括介短非谓语，三找主谓定核心',
      '同位语从句高频壳名词：fact, belief, idea, notion, assumption, doubt, evidence + that 完整陈述句',
      '分隔结构识别：当主语与谓语之间被双逗号插入语或长定语隔开时，跳读修饰直连主谓',
    ],
    content: `# 长难句三步剥离法：五大核心从句与特殊句式实战拆解

> **痛点诊断**：很多考生背熟了全部大纲单词，却依然读不懂真题句子——根源在于英语采用**树状右分支形合结构（主干在前、层层后置修饰）**，而中文习惯**竹节状流水意合结构**。掌握“三步剥离法”，任何 50 词长句都能在 10 秒内看清骨架。

---

## 一、长难句「三步手术刀剥离法」

### 第一步：圈出全句所有「连接词」与「成对标点」
- **并列连词（平起平坐）**：*and, but, yet, or, while（然而）, not only... but also..., rather than*。
- **从属连词与关系词（降级从句）**：*that, which, who, whose, where, when, what, whether, if, although, while（尽管）, because, since, as, unless, so that*。
- **成对双逗号 / 双破折号**：中间夹着的通常是**插入语**或**同位语解释说明**，第一遍抓主干时可直接用括号括起跳过！

### 第二步：括掉「介词短语」与「非谓语动词短语」（去枝叶）
- **介词短语（in / of / on / with / for / by / through / despite + 名词）**：99% 充当定语或状语修饰成分，绝不能作主干主语或谓语！
- **非谓语三大件（doing / done / to do）**：没有助动词（be/have）辅助的孤立 *doing* 或 *done* 不是真谓语，它们只是分词修饰语。
  - ⚠️ **经典陷阱**：过去分词 *done* 与一般过去时 *did* 长相相同！判断诀窍：若后面紧跟 *by / in / from* 介词短语且无宾语（及物动词不带宾语必被动），且句中后面另有真谓语动词，则前面的 *done* 必为后置定语！

### 第三步：锁定唯一不受连词管辖的「主句主谓宾」
- 划掉所有从句和介词/非谓语修饰后，剩下的**名词 + 时态谓语动词（含情态动词 + 动词原形）**就是全句统帅——主句主干！

---

## 二、考研高频五大从句精准辨析

### 1. 定语从句（形容词功能：修饰前面的先行词名词）
- **常规结构**：先行词名词 + *who / whom / whose / which / that / where / when* + 缺成分（或完整副词性）从句。
- **介词 + which / whom 难点**：如 *a socially negotiated framework **through which** phenomena are interpreted*。还原法：把先行词代入介词后（*interpret phenomena through the framework*），立解逻辑！

### 2. 同位语从句 vs 定语从句（英一翻译必考区分！）
- **外观极为相似**：都是 **抽象名词 + that + 句子**。
- **一秒鉴别公式**：
  - 看 **that 在从句中是否充当主语/宾语/表语成分**！
  - 若从句主谓宾齐全、完整不缺任何名词成分，**that 只起引导作用无实义** ➔ **同位语从句**（解释前面抽象名词的具体内容，如 *The belief **that** scientific discovery proceeds smoothly obscures...*）；
  - 若从句缺少主语或宾语，**that 指代前面的名词** ➔ **定语从句**。

### 3. 主语从句、宾语从句与表语从句
- **It 形式主语外移结构**：*It is widely acknowledged / little wonder / no surprise **that**...* —— 真正的句子主语是后面的 *that* 从句，切忌把 *It* 死译成“它”。
- **What 引导的名词性从句**：**what = the thing(s) that...**（“……的事物/东西/所……的一切”），本身既充当外壳又充当从句内部成分。

### 4. 九大逻辑状语从句（警惕熟连词生义！）
- **while 三大考义**：① 当……时候；② **然而（表前后对比）**；③ **尽管、虽然（放句首时 90% 表让步 = although）**！
- **since 两大考义**：① 自从（主句常用现在完成时）；② **既然、由于（考研阅读 80% 考原因！）**。
- **as 四大考义**：① 正如（as is depicted）；② 随着（as digital devices intrude）；③ 因为；④ 尽管（形容词/名词提前倒装：*Hard as they tried* = *Although they tried hard*）。
- **unless = if... not**（除非；如果不……）；**in that / now that**（在于；既然）。

---

## 三、四大特殊高难句式秒破

1. **否定词/Only 句首部分倒装**：
   - 标志词：*Never / Seldom / Rarely / Little / Hardly... when... / No sooner... than... / Not until... / Not only... / Only + 状语* 置于句首时，主句助动词提前（如 *Seldom **do** consumers purchase...*），还原为正常主谓语序即可理解。
2. **强调句型（It is / was + 被强调成分 + that / who + 其余部分）**：
   - **剥壳检验法**：把 *It is/was* 和 *that/who* 同时捂住删掉，若剩下的词能完美拼成一个语法完整的句子，则 100% 是强调句！翻译时加“正是……”即可。
3. **比较与取舍黄金结构**：
   - **not so much A as B**：与其说是 A，不如说是 B（重心在 B！）；
   - **more A than B**（同一事物两属性对比时）：与其说是 B，不如说是 A（重心在 A！）；
   - **no more... than...**：两者都不……（A 和 B 一样不……）。
4. **独立主格与 with 复合结构**：
   - 名词/代词 + 分词/形容词/介词短语，独立于主句主语之外作伴随或原因状语（如 *Weather permitting, ...* 或 *with algorithms dictating daily feeds*）。
`,
  },
  {
    id: 'handout-eng-newtype-clues',
    title: '新题型 Part B 满分攻略：七选五、段落排序与小标题指代衔接线索',
    domain: 'english',
    subject: '考研英语',
    readTime: '14 分钟',
    difficulty: '高频重难点',
    tags: ['考研英语', '新题型', '七选五', '排序题', '小标题匹配'],
    summary: '新题型本质是一场不考深奥微言大义、只考形式逻辑锁扣的“拼图游戏”。掌握代词单复数指代、逻辑连词方向与核心概念复现三大铁索，5 题稳拿 8~10 分。',
    keyTheorems: [
      '第一铁索（代词指代）：选项首句若含 such / these / this / they / it / the + 名词，必在前文紧邻句中存在同单复数、同性质的先行词',
      '第二铁索（逻辑路标）：however / conversely 前后褒贬必反转；consequently / thus 前因后果；for instance 前观点后具体案例',
      '第三铁索（数字与时间轴）：排序题与七选五中年代推进、a second / another / finally 构成不可逆先后链条',
      '小标题黄金法则：不读琐碎细节，聚焦段落首句 + 段中转折句 + 全段最高频复现核心词组进行同义概括',
    ],
    content: `# 新题型 Part B 满分攻略：七选五、段落排序与小标题指代衔接线索

> **题型定位**：Section II Part B（共 5 题，每题 2 分，总计 **10 分**）。英语（一）轮考**七选五（完形填句/段）**、**段落排序题**与**观点例证匹配**；英语（二）主考**小标题匹配**与**多项信息对应**。新题型是全卷**性价比最高、提分最快**的板块！

---

## 一、七选五（段落/句子填空）三大破局锚点

**严禁通读全文翻译大意硬凑！** 正确的操作顺序是：**先精析 A~G 七个选项的首尾句并圈出显性钩子词，再看空位前后紧邻的一句话进行机械配对**。

### 锚点 1：限定词与指示代词（最强物理锁扣！）
一旦选项开头出现以下词汇，相当于直接告诉你它前面必须站着谁：
- **These / Those + 复数名词**（如 *These running water elements*）：空前一句**必须刚刚提过多个具体的水流元素**（如 *stone fountains and gentle cascades*），若空前是单数概念则绝对排除！
- **This / Such (a) + 抽象名词**（如 *This emerging paradigm shift*）：空前必在描述某种观念或模式的转变。
- **人称代词（He / She / They / It）**：严格核查性别、人数单复数是否与空前主语或宾语严丝合缝。
- **定冠词 The + 普通名词**：在英文语篇中，首次引入新事物用不定冠词 *a/an* 或复数泛指，再次特指回指才用 *the / such*。

### 锚点 2：逻辑衔接副词（判断顺逆关系）
- **转折对立类**：*However, Yet, Nevertheless, Conversely, By contrast, On the contrary, Instead*
  - 锁扣特征：空前讲“正面/传统做法/大众误区”，选项必讲“负面/新兴颠覆/科学真相”（反之亦然）。
- **因果推导类**：*Consequently, Therefore, Thus, Hence, As a result, Accordingly*
  - 锁扣特征：空前陈述客观现象或困境，选项顺势推出必然结果或政策呼吁。
- **递进并列类**：*Moreover, Furthermore, In addition, Similarly, Likewise, Also, Another...*
  - 锁扣特征：空前已经列举了第 1 个理由或维度，选项补充同向的第 2 个维度（话题主体与褒贬方向完全一致！）。
- **举例实证类**：*For example, For instance, Specifically, In particular*
  - 锁扣特征：空前是一句高度概括的抽象论断，选项紧跟具体地名、机构、实验数据或生活场景。

### 锚点 3：空位位置决定选项功能
1. **空在段首**：通常是**本段主题句（承上启下）**，必须能统领空后整段的具体展开内容，同时与上一段末尾顺畅过渡。
2. **空在段中**：重点看**前后夹击**！既要接住前一句的尾巴，又要为后一句的代词（特别是空后第一句若有 *This / Such / They*，那它的爹就在你填的这个选项里！）提供指代源头！
3. **空在段末**：通常是**细节顺延例证**或**段落拔高总结句**。

---

## 二、段落排序题（英一重难点）四步秒杀流

1. **秒定首段（若首段未固定）**：
   - **必排除特征**：凡是首句含代词（*It, They, This, These, Such*）、逻辑连词（*However, Moreover, Therefore, Also*）、或直呼某人姓氏（前文未介绍全名身份，如直接写 *Smith argues* 而非 * Harvard economist Adam Smith argues*）的段落，**100% 绝不可能是文章第一段**！
   - **首段典型长相**：提出宏大时代背景、普适现象、核心定义或设问引出话题。
2. **先做局部「二联捆绑」**：
   - 不急于排全篇顺序，先根据已给定的固定段落（如已知第 2 段为 C，第 5 段为 F）首尾线索，把铁定挨在一起的 **X ➔ Y** 锁死成积木块。
3. **追踪人物称谓与时间链**：
   - 全名带头衔（*Dr. Elena Vance, a neuroscientist at MIT*）**永远先于**简称（*Vance* 或 *She*）；过去背景叙述先于当今新趋势。
4. **通读衔接口复核**：检查每一处相邻段尾与段首是否存在逻辑断层。

---

## 三、小标题匹配 & 多项对应（英二稳拿满分指南）

1. **精读 7 个小标题，划出唯一差异实词**：
   - 7 个小标题结构往往高度工整（如全部是祈使句动宾结构：*Embrace Ambiguity* / *Master Jargon-Free Articulation* / *Practice Active Empathy*），用笔圈出每个标题**最具辨识度的核心名词**。
2. **回段首尾与转折处找同义词群**：
   - 段落里高频出现的近义词网（如 *without drowning them in jargon, crisp updates, lucidity*）直接锁定标题 *Master Jargon-Free Articulation*。
   - **切忌被段落里只出现一次的比喻小词误导**（如段里打比方提了一嘴工资账单，千万别误选“薪酬谈判”干扰项）。
`,
  },
  {
    id: 'handout-eng-translation-split',
    title: '英译汉 Part C 高分密码：拆分顺译、逆序前置与采分点增减词法则',
    domain: 'english',
    subject: '考研英语',
    readTime: '15 分钟',
    difficulty: '真题必考',
    tags: ['考研英语', '英译汉', '翻译技巧', '采分点', '定语从句翻译'],
    summary: '针对阅卷组“按点给分（每句 4 个 0.5 分采分点）”机制，系统讲解长句斜线切分法、后置定语 8 字前置/后置阈值、被动转主动与词义语境引申技巧。',
    keyTheorems: [
      '阅卷给分真相：英语一每句 2 分拆分为 4 个 0.5 分采分块（语法框架分 + 核心多义词精准分），绝非凭主观印象打分',
      '定语从句 8 字阈值律：译成中文不足 8~10 字的短定语前置作“……的”；超过 10 字或表结果转折的长定从独立后置顺译',
      '词义引申黄金律：禁止生搬硬套词汇书第一个死意思，必须看主谓/动宾搭配（如 address a crisis 译为“应对危机”而非“地址”）',
      '宁顺勿死，不漏一词：修饰副词、代词具体指代内容、比较级连接词都是隐形 0.5 分采分点，严禁漏译',
    ],
    content: `# 英译汉 Part C 高分密码：拆分顺译、逆序前置与采分点增减词法则

> **考情对比**：
> - **英语（一）**：在一篇约 400 词的学术哲理文章中划出 **5 个复杂长难句**（每句 2 分，共 **10 分**），句式极精巧、抽象名词多、指代紧密；
> - **英语（二）**：给出约 **150 词的一整段或两段完整短文**进行全文翻译（共 **15 分**），生僻词少，重在语篇连贯与地道现代汉语表达。

---

## 一、考场实战「三阶斜线切分法」

拿到划线句千万别提笔就从第一个词往后硬凑，先在草稿纸上花 30 秒画斜线 \`/\` 切块：

1. **在并列连词（and, but, or）与从属连词（that, which, who, because, although, when）前画斜线 \`/\`**；
2. **在长介词短语（特别是连续两个以上介词套叠）与分词短语（, doing... / , done...）前画斜线 \`/\`**；
3. **把每个小意群先直译成汉语碎片，再按汉语叙事逻辑（先因后果、先时间条件后主句、短修饰在前长解释在后）重新拼装润色**！

---

## 二、四大高频句型标准转换公式

### 1. 定语从句的「前置法、后置法与融合法」
- **前置法（合译）**：当定语从句较短、结构简单、起限定区分作用时，直接放到先行词前面加“**……的**”。
  - 例：*the disruptive paradigm shifts **that actually revolutionize our worldview***
  - 译：*那些**实际上彻底变革了我们世界观的**颠覆性范式转变*。
- **后置法（拆译）**：当定语从句很长、内部还套着从句，或与主句存在因果/转折/承接逻辑时，强行前置会导致中文憋气拗口！此时**重复先行词（或用“这/它/通过这一……”指代）另起半句顺译**。
  - 例：*a socially negotiated framework **through which phenomena are interpreted**.*
  - 译：*一种社会性协商建构的框架体系，**通过这一框架，各种现象才得以被阐释***。
- **状语化译法**：部分非限制性定语从句（*, which...*）实表结果或原因，可顺译为“这导致了……/从而……”。

### 2. 同位语与同位语从句的「破折号 / 冒号增词法」
- 遇到 *The belief / fact / notion / assumption that...*：
  - 短同位语：译为“**认为/即……的信念（事实/观念）**”；
  - 超长同位语：先译主句“**人们秉持一种信念，即：……**”或使用破折号“**——那就是……**”，画面瞬间清爽通透！

### 3. 被动语态的「四路地道脱壳法」
英语酷爱被动（显客观），中文滥用“被”字则满纸翻译腔！遇到 *be + done* 优先采用以下四种转化：
1. **换用文雅被动标记词**：*受到……、遭到……、得以……、由……所……、为……所……*；
2. **译为汉语无主句 / 泛指主语句**：加 *人们普遍认为……、据证实……、大家常说……*（对应 *It is argued / believed / demonstrated that...*）；
3. **宾语提前变主动**：把 *by* 后面的动作发出者直接提作中文主语；
4. **是……的判断句式**：如 *The theory was first proposed in 1924* ➔ *该理论**是在** 1924 年首次提出的*。

### 4. 抽象名词动词化（词性转译神技）
英语喜欢静态名词化表达（Nominalization），汉语喜欢动态动词表达：
- 原文：*the inexorable **decline** in the scope and seriousness of their arts coverage*
- 生硬直译：*在他们的艺术报道的范围和严肃性中的不可阻挡的下降*（拗口晦涩！）
- 词性转译高分译法：*报纸艺术报道的广度与深度正**不可逆转地走向衰落***（名词 decline 转为动词短语，流畅自然！）。

---

## 三、阅卷场保分铁律（多拿 2~3 分的关键细节）

1. **代词必须考虑是否“还原真身”**：划线句中的 *it / they / this / doing so* 若结合上文一句话能明确指代具体概念，建议译出“这样做（即用外语发表论文）”或紧贴指代单复数，切忌乱译成无关对象。
2. **专有名词音译与规范处理**：不认识的外国人名按音节大方音译（如 *Hawthorne* 译为“霍桑”），首字母大写的机构/期刊保留常识译名或稳妥意译，绝不可空着不写英文原词交白卷。
3. **字迹工整、杜绝涂改黑疙瘩**：先在草稿区排好中文语序再誊写上答题卡，保证主干谓语清晰、没有病句残句。
`,
  },
  {
    id: 'handout-eng-writing-framework',
    title: '大小作文一档高分架构：三段论黄金推进与四大闪光句法矩阵',
    domain: 'english',
    subject: '考研英语',
    readTime: '17 分钟',
    difficulty: '高频重难点',
    tags: ['考研英语', '英语作文', '图画图表作文', '应用文书信', '高分句型'],
    summary: '打破千篇一律的烂大街机械模板：构建“首段精准描图点题—中段多维深度归因/例证—尾段辩证对策升华”的个性化一档框架，配齐倒装、强调、独立主格与无灵主语改写实操。',
    keyTheorems: [
      '考研作文五档评分第一红线：切题完整（涵盖图画/图表核心细节 + 提炼准确立意 + 合理建议），跑题或漏要点直接掉入三档以下',
      '小作文满分三要素：格式规范（称呼顶格 + 正文三段 + 右下角敬语署名）+ 语域得体（公函庄重、朋友亲切）+ 信息点全覆盖',
      '大作文黄金词数区间：英语一 170~200 词（3 段：3 句 + 5 句 + 3 句）；英语二 150~180 词；小作文 100~120 词',
      '告别 very / important / good / many 平庸词：用 of paramount significance、indispensable、a multitude of 实现档次跃迁',
    ],
    content: `# 大小作文一档高分架构：三段论黄金推进与四大闪光句法矩阵

> **分值权重**：英语（一）写作共 **30 分**（小作文 10 分 + 图画/材料大作文 20 分）；英语（二）写作共 **25 分**（小作文 10 分 + 动态/静态图表大作文 15 分）。写作是考前两个月**投入产出比最高、最能拉开 8~10 分差距**的决胜战场！

---

## 一、大作文（Part B）「三段 11 句」黄金推进模型

### 第一段：精准描摹 + 破题点睛（3 句，约 45~55 词）
- **第 1 句（宏观引图/引表）**：
  - 图画类（英一）：*As is vividly depicted in the thought-provoking cartoon, [核心主体人物 + 正在做的关键动作].*
  - 图表类（英二）：*The bar/pie/line chart above clearly illustrates the dramatic changes in [图表统计主题] from [起始年份] to [结束年份].*
- **第 2 句（核心对比细节 / 极值特征）**：
  - 图画对比：*Specifically, while one individual is [动作 A + 神态], the other chooses to [动作 B + 积极姿态], forming a sharp and intriguing contrast.*
  - 图表极值：*Notably, the proportion of [上升项] surged remarkably from X% to Y%, whereas [下降项] witnessed a moderate decline over the same period.*
- **第 3 句（透过现象提炼象征寓意）**：
  - *Simple as the drawing/statistics may appear, the symbolic message conveyed is profound: [核心主题词/品质] plays an indispensable role in contemporary society.*

### 第二段：多维归因 / 利弊论证 + 具象实例（4~5 句，约 80~95 词）
- **第 4 句（总领过渡句）**：
  - *Several interconnected factors account for this noteworthy phenomenon, / Why does such a quality merit our earnest attention?*
- **第 5 句（第一维度：个人心智 / 认知突破）**：
  - *First and foremost, from an individual perspective, [核心主题] serves as a powerful catalyst for personal growth, enabling young minds to overcome inertia and unlock untapped potential.*
- **第 6 句（第二维度：技术演进 / 社会协同）**：
  - *Furthermore, at the societal level, against the backdrop of rapid technological iteration and fierce competition, cultivating [核心主题] fosters sustainable innovation and social harmony.*
- **第 7~8 句（反面假设或时代实例支撑）**：
  - *Take the field of scientific exploration as a compelling example: had pioneers shrunk from daunting uncertainties, humanity would never have achieved breakthroughs ranging from aerospace to artificial intelligence.*

### 第三段：归纳总结 + 可落地双主体建议（3 句，约 40~50 词）
- **第 9 句（立场重申）**：
  - *Taking all these dimensions into consideration, it is imperative that concerted efforts be made to champion [核心正面导向]（或 rectify this undesirable tendency）.*
- **第 10 句（宏观制度/教育引导 + 微观青年行动）**：
  - *On the one hand, educational institutions and media platforms ought to foster an enlightening atmosphere; on the other hand, we university students should integrate lofty ideals with down-to-earth perseverance.*
- **第 11 句（倒装句高光收尾）**：
  - *Only by striking a wise balance between [维度 A] and [维度 B] can we embrace a more promising and fulfilling future.*

---

## 二、小作文（Part A 应用文）零失误审题与结构清单

### 1. 书信类 vs 告示通知类格式红线
- **书信/邮件（Letter / Email）**：
  - 称呼左顶格：*Dear Sir or Madam,*（机构不知姓名）/ *Dear Prof. Williams,*（知名教授）/ *Dear Li Ming,*（好友）；
  - 正文每段首行缩进 4 字母；
  - 右下角结束谦称与署名：*Yours sincerely,* + 换行写 **Li Ming**（**严禁写真实姓名或自造其它英文名，谨防作弊嫌疑判零分！**）。
- **通知告示（Notice）**：
  - 第一行正中央居中写标题：**NOTICE**；
  - 次行靠右写发布日期（如 *June 20, 2026*，有时也可省略或放左下，以居中标题 + 右下落款单位为标准）；
  - 正文三段（招募/活动背景与目的 ➔ 时间地点与具体要求 ➔ 报名联系方式与欢迎参与）；
  - 右下角写发布单位（如 *The Postgraduate Association*）。

### 2. 应用文「三段七句」铁三角
1. **首段（自我介绍 + 写信目的，开门见山绝不寒暄绕弯）**：*I am writing this letter on behalf of the Students' Union to cordially invite you to... / express my heartfelt gratitude for...*
2. **中段（精准兑现题干要求的 2~3 个信息要点，用 First / Moreover 分条呈现，必要时合理微扩充具体时间地点细节使内容丰满）**。
3. **尾段（重申期盼回复 + 礼貌祝愿）**：*I would appreciate it immensely if you could take my proposal into favorable consideration. Looking forward to your early reply.*

---

## 三、普通三档句秒变一档闪光句：四大句法升级对比

1. **升级一：普通人称主语句 ➔ 无灵主语（物称主语）句**
   - 平庸句：*Many people use smartphones too much in recent years.*
   - 一档句：*Recent years have witnessed an alarming prevalence of excessive smartphone immersion among citizens.*
2. **升级二：直白陈述句 ➔ 否定词 / Only 部分倒装句**
   - 平庸句：*We should never ignore the importance of traditional culture.*
   - 一档句：*Under no circumstances should we underestimate the enduring charm and spiritual nourishment of traditional culture.*
3. **升级三：简单因果句 ➔ 强调句型 + 非限制性定语从句**
   - 平庸句：*Persistent curiosity pushes scientists forward.*
   - 一档句：*It is precisely unyielding curiosity that propels researchers across uncharted territories, which ultimately reshapes human civilization.*
4. **升级四：平庸高频词升级速查表**
   - *very important* ➔ **of paramount significance / indispensable / pivotal**
   - *many people think* ➔ **a growing number of observers maintain / a prevailing consensus holds that**
   - *have a good/bad influence on* ➔ **exert a profound/detrimental impact on**
   - *solve the problem* ➔ **address / tackle / alleviate the thorny dilemma**
   - *more and more* ➔ **an increasingly substantial proportion of / progressively**
`,
  },
]
