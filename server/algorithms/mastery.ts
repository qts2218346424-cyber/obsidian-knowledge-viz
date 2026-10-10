import { CORE_SYLLABUS, type SyllabusNode } from '../data/syllabus.js'
import { database, type DbMasteryRecord } from '../db/database.js'

export interface MasteryHierarchyNode {
  name: string
  score: number
  status: 'red' | 'yellow' | 'green'
  attempted: number
  correct: number
  children?: MasteryHierarchyNode[]
  syllabusId?: string
}

export interface DomainMasterySummary {
  domain: string
  totalPoints: number
  masteredCount: number     // green
  inProgressCount: number   // yellow
  weakCount: number         // red
  averageScore: number
  tree: MasteryHierarchyNode[]
}

/**
 * 考点综合掌握度与热力图计算引擎
 */
export class MasteryEngine {
  /**
   * 记录一次作答对考点掌握度的影响
   */
  static recordAttempt(syllabusId: string, isCorrect: boolean): void {
    const node = CORE_SYLLABUS.find(s => s.id === syllabusId)
    if (!node) return

    const records = database.getAllMasteryRecords()
    const existing = records.find(r => r.syllabusId === syllabusId)

    const prevAttempted = existing?.totalAttempted ?? 0
    const prevCorrect = existing?.correctCount ?? 0
    const prevWrong = existing?.wrongCount ?? 0

    const newAttempted = prevAttempted + 1
    const newCorrect = isCorrect ? prevCorrect + 1 : prevCorrect
    const newWrong = !isCorrect ? prevWrong + 1 : prevWrong

    // 计算掌握度 (0 - 100): 正确率 * 尝试权重奖励 (多次正确置信度提升)
    const accuracy = newCorrect / newAttempted
    const confidenceFactor = Math.min(1.0, newAttempted / 5.0) // 至少做 5 次置信度拉满
    const score = Math.round(accuracy * 100 * (0.5 + 0.5 * confidenceFactor))

    let status: 'red' | 'yellow' | 'green' = 'red'
    if (score >= 80) status = 'green'
    else if (score >= 50) status = 'yellow'

    const updatedRecord: DbMasteryRecord = {
      syllabusId: node.id,
      domain: node.domain,
      subject: node.subject,
      level1: node.level1,
      level2: node.level2,
      level3: node.level3,
      totalAttempted: newAttempted,
      correctCount: newCorrect,
      wrongCount: newWrong,
      masteryScore: score,
      status,
      updatedAt: new Date().toISOString()
    }

    database.upsertMasteryRecord(updatedRecord)
  }

  /**
   * 获取按科目层级组织的热力树
   */
  static getHierarchyHeatmap(targetDomain?: 'cs_408' | 'math'): DomainMasterySummary[] {
    const dbRecords = database.getAllMasteryRecords()
    const recordMap = new Map<string, DbMasteryRecord>()
    for (const r of dbRecords) {
      recordMap.set(r.syllabusId, r)
    }

    const domains: ('cs_408' | 'math')[] = targetDomain ? [targetDomain] : ['cs_408', 'math']
    const results: DomainMasterySummary[] = []

    for (const dom of domains) {
      const nodes = CORE_SYLLABUS.filter(s => s.domain === dom)
      let totalScore = 0
      let green = 0
      let yellow = 0
      let red = 0

      // 按 科目 -> level1 -> level2 聚合
      const subjectMap = new Map<string, Map<string, Map<string, SyllabusNode[]>>>()

      for (const node of nodes) {
        if (!subjectMap.has(node.subject)) subjectMap.set(node.subject, new Map())
        const l1Map = subjectMap.get(node.subject)!
        if (!l1Map.has(node.level1)) l1Map.set(node.level1, new Map())
        const l2Map = l1Map.get(node.level1)!
        if (!l2Map.has(node.level2)) l2Map.set(node.level2, [])
        l2Map.get(node.level2)!.push(node)
      }

      const tree: MasteryHierarchyNode[] = []

      for (const [subjectName, l1Map] of subjectMap.entries()) {
        const l1Nodes: MasteryHierarchyNode[] = []

        for (const [l1Name, l2Map] of l1Map.entries()) {
          const l2Nodes: MasteryHierarchyNode[] = []

          for (const [l2Name, leafNodes] of l2Map.entries()) {
            const leaves: MasteryHierarchyNode[] = leafNodes.map(leaf => {
              const rec = recordMap.get(leaf.id)
              const score = rec ? rec.masteryScore : 0
              const status = rec ? rec.status : 'red'
              const attempted = rec ? rec.totalAttempted : 0
              const correct = rec ? rec.correctCount : 0

              totalScore += score
              if (status === 'green') green++
              else if (status === 'yellow') yellow++
              else red++

              return {
                name: leaf.level3,
                score,
                status,
                attempted,
                correct,
                syllabusId: leaf.id,
              }
            })

            const avgL2 = leaves.length > 0 ? Math.round(leaves.reduce((a, b) => a + b.score, 0) / leaves.length) : 0
            l2Nodes.push({
              name: l2Name,
              score: avgL2,
              status: avgL2 >= 80 ? 'green' : avgL2 >= 50 ? 'yellow' : 'red',
              attempted: leaves.reduce((a, b) => a + b.attempted, 0),
              correct: leaves.reduce((a, b) => a + b.correct, 0),
              children: leaves,
            })
          }

          const avgL1 = l2Nodes.length > 0 ? Math.round(l2Nodes.reduce((a, b) => a + b.score, 0) / l2Nodes.length) : 0
          l1Nodes.push({
            name: l1Name,
            score: avgL1,
            status: avgL1 >= 80 ? 'green' : avgL1 >= 50 ? 'yellow' : 'red',
            attempted: l2Nodes.reduce((a, b) => a + b.attempted, 0),
            correct: l2Nodes.reduce((a, b) => a + b.correct, 0),
            children: l2Nodes,
          })
        }

        const avgSubject = l1Nodes.length > 0 ? Math.round(l1Nodes.reduce((a, b) => a + b.score, 0) / l1Nodes.length) : 0
        tree.push({
          name: subjectName,
          score: avgSubject,
          status: avgSubject >= 80 ? 'green' : avgSubject >= 50 ? 'yellow' : 'red',
          attempted: l1Nodes.reduce((a, b) => a + b.attempted, 0),
          correct: l1Nodes.reduce((a, b) => a + b.correct, 0),
          children: l1Nodes,
        })
      }

      results.push({
        domain: dom,
        totalPoints: nodes.length,
        masteredCount: green,
        inProgressCount: yellow,
        weakCount: red,
        averageScore: nodes.length > 0 ? Math.round(totalScore / nodes.length) : 0,
        tree,
      })
    }

    return results
  }

  /**
   * 手动标记或调整考点掌握度状态
   */
  static updateManualStatus(syllabusId: string, status: 'red' | 'yellow' | 'green', score?: number): DbMasteryRecord | null {
    const node = CORE_SYLLABUS.find(s => s.id === syllabusId)
    if (!node) return null

    const records = database.getAllMasteryRecords()
    const existing = records.find(r => r.syllabusId === syllabusId)

    const defaultScore = status === 'green' ? 90 : status === 'yellow' ? 65 : 20
    const finalScore = score !== undefined ? score : defaultScore

    const updatedRecord: DbMasteryRecord = {
      syllabusId: node.id,
      domain: node.domain,
      subject: node.subject,
      level1: node.level1,
      level2: node.level2,
      level3: node.level3,
      totalAttempted: existing?.totalAttempted ?? 1,
      correctCount: status === 'green' ? Math.max(1, existing?.correctCount ?? 1) : (existing?.correctCount ?? 0),
      wrongCount: status === 'red' ? Math.max(1, existing?.wrongCount ?? 1) : (existing?.wrongCount ?? 0),
      masteryScore: finalScore,
      status,
      updatedAt: new Date().toISOString()
    }

    database.upsertMasteryRecord(updatedRecord)
    return updatedRecord
  }

  /**
   * 获取考点详情、关键词及关联错题
   */
  static getNodeDetail(syllabusId: string) {
    const node = CORE_SYLLABUS.find(s => s.id === syllabusId)
    if (!node) return null

    const records = database.getAllMasteryRecords()
    const record = records.find(r => r.syllabusId === syllabusId)
    const errorQuestions = database.getErrorQuestions({ syllabusId })

    return {
      node,
      record: record || {
        syllabusId: node.id,
        domain: node.domain,
        subject: node.subject,
        level1: node.level1,
        level2: node.level2,
        level3: node.level3,
        totalAttempted: 0,
        correctCount: 0,
        wrongCount: 0,
        masteryScore: 0,
        status: 'red' as const,
        updatedAt: null,
      },
      errorQuestions,
    }
  }
}
