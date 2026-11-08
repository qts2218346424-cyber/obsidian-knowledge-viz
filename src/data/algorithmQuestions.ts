export interface AlgorithmQuestion {
  id: string
  year: number
  title: string
  score: number
  difficulty: '基础' | '中等' | '挑战'
  tags: string[]
  dataStructureType: '链表' | '数组' | '二叉树' | '图' | '查找'
  fullPrompt: string
  headerDef: string
  starterCode: string
  starterIdea?: string
  optimalIdea: string
  optimalCode: string
  timeComplexity: string
  spaceComplexity: string
  bruteForceAnalysis: string
  keyTestCases: Array<{ input: string; output: string }>
}

export const ALGORITHM_QUESTIONS_408: AlgorithmQuestion[] = [
  {
    id: '408-2009',
    year: 2009,
    title: '单链表中查找倒数第 k 个位置结点',
    score: 13,
    difficulty: '基础',
    tags: ['双指针', '快慢指针', '单链表', '2009统考'],
    dataStructureType: '链表',
    fullPrompt: `已知一个带有表头结点的单链表，结点结构为 (data, link)。假设该链表只给出了头指针 list。在不改变链表的前提下，请设计一个尽可能高效的算法，查找链表中倒数第 k 个位置上的结点（k 为正整数）。
若查找成功，算法输出该结点的 data 域的值，并返回 1；否则，只返回 0。

要求：
(1) 简述算法的基本设计思想；
(2) 详细描述算法的步骤（程序流程）；
(3) 根据设计思想，采用 C 或 C++ 语言描述算法，关键之处给出简要注释；
(4) 说明你所设计的算法的时间复杂度和空间复杂度。`,
    headerDef: `typedef struct LNode {
    int data;
    struct LNode *link;
} LNode, *LinkList;`,
    starterCode: `// 408 统考 2009 算法设计题
// 若查找成功，输出结点 data 域的值并返回 1；否则返回 0
int Search_k(LinkList list, int k) {
    // 请在此处实现你的核心算法
    
}`,
    optimalIdea: `采用双指针（快慢指针）一次遍历算法：
1. 定义两个指针 p 和 q，初值均指向链表的第一个有效结点（即头结点的后继结点 list->link）；
2. 先让指针 p 沿着链表向前移动 k 个结点；若移动过程中遇到 NULL（说明链表长度小于 k），则查找失败，直接返回 0；
3. 指针 p 移动到第 k 个结点后，指针 p 和 q 同时向前同步单步移动；
4. 当 p 移动到链表最后一个结点（即 p->link == NULL）时，指针 q 刚好指向倒数第 k 个结点；
5. 输出 q->data 并返回 1。`,
    optimalCode: `int Search_k(LinkList list, int k) {
    if (list == NULL || list->link == NULL || k <= 0) return 0;
    
    LNode *p = list->link;
    LNode *q = list->link;
    int count = 0;
    
    // 指针 p 先向前移动 k 步
    while (p != NULL) {
        if (count < k) {
            count++;
        } else {
            q = q->link; // p 走了 k 步后，q 开始同步后移
        }
        p = p->link;
    }
    
    // 若链表长度小于 k，查找失败
    if (count < k) {
        return 0;
    }
    
    // 此时 q 即为倒数第 k 个结点
    printf("倒数第 %d 个结点的值为: %d\\n", k, q->data);
    return 1;
}`,
    timeComplexity: '时间复杂度为 O(n)，只需遍历链表一次即可定位；',
    spaceComplexity: '空间复杂度为 O(1)，仅使用辅助指针变量 p 与 q。',
    bruteForceAnalysis: '若先完整遍历一遍计算链表总长 L，再二次遍历到第 L-k+1 个结点：时间复杂度仍为 O(n) 但需遍历两遍，阅卷通常扣 1~2 分；若使用辅助数组存储全部结点，空间复杂度退化为 O(n)，扣 3 分。',
    keyTestCases: [
      { input: '链表: 1 -> 2 -> 3 -> 4 -> 5, k = 2', output: '输出: 4, 返回 1' },
      { input: '链表: 1 -> 2, k = 5 (k > 链表长)', output: '返回 0 (查找失败)' },
    ]
  },
  {
    id: '408-2010',
    year: 2010,
    title: '循环左移数组中元素 p 个位置',
    score: 13,
    difficulty: '中等',
    tags: ['数组逆置', '空间原地换算法', '2010统考'],
    dataStructureType: '数组',
    fullPrompt: `设将 n (n > 1) 个整数存放到一维数组 R 中。试设计一个在时间和空间两方面都尽可能高效的算法。将 R 中保存的序列循环左移 p (0 < p < n) 个位置，即将 R 中的数据由 (X_0, X_1, ..., X_{n-1}) 变换为 (X_p, X_{p+1}, ..., X_{n-1}, X_0, X_1, ..., X_{p-1})。

要求：
(1) 给出算法的基本设计思想；
(2) 根据设计思想，采用 C 或 C++ 语言描述算法，关键之处给出简要注释；
(3) 说明你所设计的算法的时间复杂度和空间复杂度。`,
    headerDef: `// 数组循环左移，n 为数组长度，p 为左移步数 (0 < p < n)`,
    starterCode: `// 辅助逆置函数与主移位函数
void Reverse(int R[], int from, int to) {
    // 逆置数组 R 中下标从 from 到 to 的部分
}

void LeftShift(int R[], int n, int p) {
    // 请在此处实现循环左移核心逻辑
    
}`,
    optimalIdea: `采用“三次逆置法”（原地逆转）：
将原数组视为两部分 A = R[0 ... p-1] 和 B = R[p ... n-1]，即原序列为 AB，目标序列为 BA。
根据线性代数求逆性质 (A^{-1} B^{-1})^{-1} = BA：
1. 先将前 p 个元素 A 逆置，得到 A^{-1}；
2. 再将后 n-p 个元素 B 逆置，得到 B^{-1}；
3. 最后将整个数组全部逆置 (A^{-1} B^{-1})^{-1}，即得到 BA。`,
    optimalCode: `void Reverse(int R[], int from, int to) {
    int temp;
    while (from < to) {
        temp = R[from];
        R[from] = R[to];
        R[to] = temp;
        from++;
        to--;
    }
}

void LeftShift(int R[], int n, int p) {
    if (p <= 0 || p >= n) return;
    
    // 1. 逆置前 p 个元素: R[0 ... p-1]
    Reverse(R, 0, p - 1);
    // 2. 逆置后 n-p 个元素: R[p ... n-1]
    Reverse(R, p, n - 1);
    // 3. 整体逆置全部元素: R[0 ... n-1]
    Reverse(R, 0, n - 1);
}`,
    timeComplexity: '时间复杂度为 O(n)，Reverse 分别耗时 p/2, (n-p)/2, n/2 次交换，总次数约 n 次；',
    spaceComplexity: '空间复杂度为 O(1)，原地交换，仅占用临时变量 temp。',
    bruteForceAnalysis: '若开辟一个大小为 p 或 n 的辅助数组暂存数据再写回：空间复杂度为 O(p) 或 O(n)，违反统考“空间尽可能高效”要求，阅卷扣 3~4 分；若每次循环左移 1 位，循环 p 次：时间复杂度退化为 O(p*n)，阅卷扣 4~5 分。',
    keyTestCases: [
      { input: 'R = [1, 2, 3, 4, 5, 6, 7], n = 7, p = 3', output: 'R 变为 [4, 5, 6, 7, 1, 2, 3]' },
    ]
  },
  {
    id: '408-2011',
    year: 2011,
    title: '求两个等长升序序列合并后的中位数',
    score: 15,
    difficulty: '挑战',
    tags: ['二分查找', '折半剪枝', '2011统考'],
    dataStructureType: '数组',
    fullPrompt: `一个长度为 L (L >= 1) 的升序序列 S，处在第 ⌈L/2⌉ 个位置的数称为 S 的中位数。例如序列 S1 = (11, 13, 15, 17, 19)，中位数为 15。
现有两个等长升序序列 A 和 B，试设计一个在时间和空间两方面都尽可能高效的算法，找出两个升序序列 A 和 B 归并后的中位数。

要求：
(1) 给出算法的基本设计思想；
(2) 根据设计思想，采用 C 或 C++ 语言描述算法，关键之处给出简要注释；
(3) 说明你所设计的算法的时间复杂度和空间复杂度。`,
    headerDef: `// A 和 B 分别为升序数组，n 为序列长度`,
    starterCode: `int FindMedian(int A[], int B[], int n) {
    // 请在此处实现寻找两个等长序列中位数的核心算法
    
}`,
    optimalIdea: `采用折半查找（二分剪枝剪除不可能区间）：
分别求出序列 A 和 B 的中位数 a 和 b：
1. 若 a == b，则该数即为两序列合并后的中位数，直接返回；
2. 若 a < b，舍弃 A 中较小的一半（包含 a 之前部分）以及 B 中较大的一半（包含 b 之后部分）；
3. 若 a > b，舍弃 A 中较大的一半以及 B 中较小的一半；
4. 保持每次舍弃的两段长度相等，在保留的子序列中重复上述过程，直到子序列长度缩小为 1 为止。`,
    optimalCode: `int FindMedian(int A[], int B[], int n) {
    int s1 = 0, d1 = n - 1; // A 序列的左右边界
    int s2 = 0, d2 = n - 1; // B 序列的左右边界
    int m1, m2;
    
    while (s1 < d1 && s2 < d2) {
        m1 = s1 + (d1 - s1) / 2;
        m2 = s2 + (d2 - s2) / 2;
        
        if (A[m1] == B[m2]) {
            return A[m1];
        }
        
        if (A[m1] < B[m2]) {
            // A 的中位数小于 B 的中位数，舍弃 A 的前半段和 B 的后半段
            if ((s1 + d1) % 2 == 0) { // 元素个数为奇数
                s1 = m1;
                d2 = m2;
            } else { // 元素个数为偶数
                s1 = m1 + 1;
                d2 = m2;
            }
        } else {
            // A 的中位数大于 B 的中位数，舍弃 A 的后半段和 B 的前半段
            if ((s1 + d1) % 2 == 0) {
                d1 = m1;
                s2 = m2;
            } else {
                d1 = m1;
                s2 = m2 + 1;
            }
        }
    }
    
    return A[s1] < B[s2] ? A[s1] : B[s2];
}`,
    timeComplexity: '时间复杂度为 O(log_2 n)，每次二分排除一半元素；',
    spaceComplexity: '空间复杂度为 O(1)，仅使用常数个指针与中点索引。',
    bruteForceAnalysis: '若使用双指针归并扫描到第 n 个元素：时间复杂度为 O(n)，空间复杂度 O(1)，这是良好的次优解，阅卷通常给 10~11 分（扣 4~5 分）；若开辟 2n 数组完整归并再取中位数，空间 O(n) 时间 O(n)，扣 6 分。',
    keyTestCases: [
      { input: 'A = [11, 13, 15, 17, 19], B = [2, 4, 6, 8, 20]', output: '中位数 = 11' },
      { input: 'A = [1, 3, 5], B = [2, 4, 6]', output: '中位数 = 3' },
    ]
  },
  {
    id: '408-2013',
    year: 2013,
    title: '寻找数组中出现次数超过一半的主元素',
    score: 13,
    difficulty: '中等',
    tags: ['摩尔投票法', '主元素', '2013统考'],
    dataStructureType: '数组',
    fullPrompt: `已知一个整数序列 A = (a_0, a_1, ..., a_{n-1})，其中 0 <= a_i < n (0 <= i < n)。若存在 a_{p1} = a_{p2} = ... = a_{pm} = x 且 m > n/2 (0 <= pk < n, 1 <= k <= m)，则称 x 为 A 的主元素。例如 A = (0, 5, 5, 3, 5, 7, 5, 5)，5 为主元素；而 (0, 5, 5, 3, 5, 1, 5, 7) 则没有主元素。
假设 A 中的 n 个元素保存在一个一维数组中，请设计一个在时间和空间两方面都尽可能高效的算法，找出 A 的主元素。若存在主元素，输出该元素；否则输出 -1。

要求：
(1) 给出算法的基本设计思想；
(2) 根据设计思想，采用 C 或 C++ 语言描述算法，关键之处给出简要注释；
(3) 说明你所设计的算法的时间复杂度和空间复杂度。`,
    headerDef: `// n 为数组长度，返回主元素的值，若无则返回 -1`,
    starterCode: `int MajorityElement(int A[], int n) {
    // 请在此处实现寻找主元素的核心算法
    
}`,
    optimalIdea: `采用“摩尔投票法”（Boyer-Moore 投票算法）：
1. 选取候选主元素：让第一个元素作为候选 candidate，计数器 count = 1；
2. 向后遍历数组：若当前元素等于 candidate，count++；若不等于，count--；
3. 当 count 降为 0 时，将当前元素设为新的 candidate，重置 count = 1；
4. 遍历完成后，candidate 即为唯一可能的主元素；
5. 第二次扫描验证：重新统计 candidate 出现的实际次数，若大于 n/2 则返回 candidate，否则返回 -1。`,
    optimalCode: `int MajorityElement(int A[], int n) {
    if (n <= 0) return -1;
    
    int candidate = A[0];
    int count = 1;
    
    // 第一阶段：寻找候选主元素
    for (int i = 1; i < n; i++) {
        if (A[i] == candidate) {
            count++;
        } else {
            count--;
            if (count == 0) {
                candidate = A[i];
                count = 1;
            }
        }
    }
    
    // 第二阶段：验证候选元素出现的实际次数
    int actualCount = 0;
    for (int i = 0; i < n; i++) {
        if (A[i] == candidate) {
            actualCount++;
        }
    }
    
    if (actualCount > n / 2) {
        return candidate;
    }
    return -1;
}`,
    timeComplexity: '时间复杂度为 O(n)，只需遍历数组两次；',
    spaceComplexity: '空间复杂度为 O(1)，仅使用 candidate 与 count 两个整型变量。',
    bruteForceAnalysis: '若开辟大小为 n 的哈希/计数数组：空间复杂度 O(n)，因题干已限制 0 <= a_i < n，此解法可给 10~11 分（扣 2~3 分）；若双重循环统计每个元素频率：时间复杂度 O(n^2)，属于严重暴力解，给 4~6 分；若先排序再验证，时间复杂度 O(n log n)，给 8~9 分。',
    keyTestCases: [
      { input: 'A = [0, 5, 5, 3, 5, 7, 5, 5], n = 8', output: '返回 5 (主元素)' },
      { input: 'A = [0, 5, 5, 3, 5, 1, 5, 7], n = 8', output: '返回 -1 (无主元素)' },
    ]
  },
  {
    id: '408-2018',
    year: 2018,
    title: '找出数组中未出现的最小正整数',
    score: 13,
    difficulty: '中等',
    tags: ['哈希映射', '空间原地利用', '2018统考'],
    dataStructureType: '数组',
    fullPrompt: `给定一个含 n (n >= 1) 个整数的数组，请设计一个在时间上尽可能高效的算法，找出数组中未出现的最小正整数。
例如，数组 {-5, 3, 2, 3} 中未出现的最小正整数是 1；数组 {1, 2, 3} 中未出现的最小正整数是 4。

要求：
(1) 给出算法的基本设计思想；
(2) 根据设计思想，采用 C 或 C++ 语言描述算法，关键之处给出简要注释；
(3) 说明你所设计的算法的时间复杂度和空间复杂度。`,
    headerDef: `// n 为数组长度，返回未出现的最小正整数`,
    starterCode: `int FindMissMin(int A[], int n) {
    // 请在此处实现你的核心算法
    
}`,
    optimalIdea: `核心数学性质：长度为 n 的数组中，未出现的最小正整数必定在 [1, n+1] 范围内。
1. 开辟一个长度为 n 的标记数组 B，初值全置为 0；
2. 遍历原数组 A，若 A[i] 落在 1 到 n 之间，则令 B[A[i]-1] = 1 标记该正整数已出现；
3. 顺序遍历标记数组 B，找到第一个为 0 的位置 i，则未出现的最小正整数即为 i + 1；
4. 若 B 中所有元素均为 1，则未出现的最小正整数为 n + 1。`,
    optimalCode: `#include <stdlib.h>
#include <string.h>

int FindMissMin(int A[], int n) {
    // 分配标记数组，标记 1 到 n 是否出现
    int *B = (int *)malloc(sizeof(int) * n);
    memset(B, 0, sizeof(int) * n);
    
    // 遍历原数组进行标记
    for (int i = 0; i < n; i++) {
        if (A[i] > 0 && A[i] <= n) {
            B[A[i] - 1] = 1;
        }
    }
    
    // 查找未出现的最小正整数
    int i;
    for (i = 0; i < n; i++) {
        if (B[i] == 0) break;
    }
    
    free(B);
    return i + 1;
}`,
    timeComplexity: '时间复杂度为 O(n)，遍历数组 A 与 B 各一次；',
    spaceComplexity: '空间复杂度为 O(n)，辅助标记数组 B 占用 n 个空间（统考官方标答解法）。',
    bruteForceAnalysis: '若先进行排序（如快速排序）再遍历：时间复杂度为 O(n log n)，题目明确强调“在时间上尽可能高效”，排序解法阅卷扣 2~3 分；若从 1 开始逐个判断是否存在于数组中，时间复杂度 O(n^2)，扣 5~6 分。',
    keyTestCases: [
      { input: 'A = [-5, 3, 2, 3], n = 4', output: '返回 1' },
      { input: 'A = [1, 2, 3], n = 3', output: '返回 4' },
    ]
  },
  {
    id: '408-2020',
    year: 2020,
    title: '求三个升序数组构成的三元组最小距离',
    score: 15,
    difficulty: '挑战',
    tags: ['三指针', '贪心递进', '2020统考'],
    dataStructureType: '数组',
    fullPrompt: `定义三元组 (a, b, c)（a, b, c 均为整数）的距离 D = |a - b| + |b - c| + |c - a|。
给定 3 个非空整数集合 S1、S2 和 S3，按升序分别存储在 3 个一维数组中。请设计一个在时间和空间两方面都尽可能高效的算法，计算并输出所有可能的三元组中的最小距离。
例如 S1 = {-1, 0, 9}, S2 = {-25, -10, 10, 11}, S3 = {2, 9, 17, 30, 41}，最小距离为 2，对应三元组为 (9, 10, 9)。

要求：
(1) 给出算法的基本设计思想；
(2) 根据设计思想，采用 C 或 C++ 语言描述算法，关键之处给出简要注释；
(3) 说明你所设计的算法的时间复杂度和空间复杂度。`,
    headerDef: `// n1, n2, n3 分别为三个数组长度，返回三元组最小距离`,
    starterCode: `int FindMinDistance(int S1[], int n1, int S2[], int n2, int S3[], int n3) {
    // 请在此处实现求三元组最小距离的核心算法
    
}`,
    optimalIdea: `几何性质分析：距离 D = |a - b| + |b - c| + |c - a| 等价于 2 * (max(a,b,c) - min(a,b,c))。
因此最小化 D 就是最小化三元组中最大值与最小值的差值！
采用“三指针贪心推进法”：
1. 初始时，三个指针 i = 0, j = 0, k = 0 分别指向三个升序数组的起始位置；
2. 计算当前三元组距离并更新记录全局最小值；
3. 每次贪心将当前三元组中“数值最小”的那个元素对应的指针向后移动一位（因为移动较大元素只会让极差更大，唯有增大最小值才可能缩小极差）；
4. 任一指针越界时循环终止，全局最小值即为所求。`,
    optimalCode: `#include <stdlib.h>
#include <limits.h>

int abs_val(int x) { return x < 0 ? -x : x; }

int FindMinDistance(int S1[], int n1, int S2[], int n2, int S3[], int n3) {
    int i = 0, j = 0, k = 0;
    int minD = INT_MAX;
    
    while (i < n1 && j < n2 && k < n3) {
        int a = S1[i], b = S2[j], c = S3[k];
        int curD = abs_val(a - b) + abs_val(b - c) + abs_val(c - a);
        if (curD < minD) {
            minD = curD;
        }
        
        // 贪心移动三者中的最小值指针
        if (a <= b && a <= c) {
            i++;
        } else if (b <= a && b <= c) {
            j++;
        } else {
            k++;
        }
    }
    
    return minD;
}`,
    timeComplexity: '时间复杂度为 O(n1 + n2 + n3)，每次循环必有至少一个指针推进，最多推进 (n1+n2+n3) 次；',
    spaceComplexity: '空间复杂度为 O(1)，只使用了常数个指针与临时变量。',
    bruteForceAnalysis: '若使用三重循环穷举所有可能的三元组组合：时间复杂度高达 O(n1 * n2 * n3)，直接违反题目“在时间上尽可能高效”要求，阅卷封顶给 5~6 分（扣 9~10 分）。',
    keyTestCases: [
      { input: 'S1=[-1,0,9], S2=[-25,-10,10,11], S3=[2,9,17,30,41]', output: '最小距离 = 2 (对应三元组 (9, 10, 9))' },
    ]
  }
]
