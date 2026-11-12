import path from 'path'
import fs from 'fs'
import { DatabaseSync } from 'node:sqlite'

/**
 * 结构化数据库持久层（基于 Node.js 官方原生 SQLite DatabaseSync）
 * 彻底告别高频读写 Markdown 文件的并发冲突与全量遍历性能瓶颈
 */

export interface DbQuizRecord {
  id: string
  userId?: string
  mode: string
  totalQuestions: number
  correctCount: number
  wrongCount: number
  timeTaken: number
  score: number
  domain: string
  createdAt: string
  detailsJson: string
}

export interface DbErrorQuestion {
  id: string
  userId?: string
  domain: string
  subject: string
  chapter: string
  syllabusId: string
  question: string
  optionsJson: string
  userAnswer: string
  correctAnswer: string
  explanation: string
  errorType: string
  difficulty: string
  sourceNote: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DbSM2Flashcard {
  cardId: string
  userId?: string
  title: string
  subject: string
  syllabusId: string
  repetition: number
  intervalDays: number
  easinessFactor: number
  reviewCount: number
  lastReviewAt: string
  nextReviewAt: string
  lastGrade: number
  historyJson: string
}

export interface DbChatConversation {
  id: string
  userId: string
  projectId?: string
  title: string
  provider?: string
  model?: string
  agentId?: string
  messages: any[]
  createdAt: string
  updatedAt: string
}

export interface DbMasteryRecord {
  syllabusId: string
  domain: string
  subject: string
  level1: string
  level2: string
  level3: string
  totalAttempted: number
  correctCount: number
  wrongCount: number
  masteryScore: number
  status: 'red' | 'yellow' | 'green'
  updatedAt: string
}

export type UserRole = 'admin' | 'editor' | 'student'

export type PointLogType =
  | 'checkin'
  | 'chat_deduct'
  | 'admin_grant'
  | 'admin_deduct'
  | 'initial_grant'
  | 'coupon_redeem'
  | 'recharge'

export interface DbCouponCode {
  code: string
  points: number
  maxUses: number
  usedCount: number
  expiresAt?: string
  description?: string
  createdBy?: string
  createdAt: string
}

export interface DbCouponRedemption {
  id: string
  code: string
  userId: string
  points: number
  redeemedAt: string
}

export interface DbPointLog {
  id: string
  userId: string
  type: PointLogType
  amount: number
  balanceAfter: number
  remark?: string
  operatorId?: string
  createdAt: string
}

export interface DbUser {
  id: string
  username: string
  displayName: string
  passwordHash: string
  salt: string
  role: UserRole
  points: number
  lastCheckinAt?: string
  securityQuestion?: string
  securityAnswerHash?: string
  securityAnswerSalt?: string
  recoveryCode?: string
  createdAt: string
  updatedAt: string
}

export interface DbSession {
  token: string
  userId: string
  createdAt: string
  expiresAt: string
}

export type StudyStage = 'not_started' | 'foundation' | 'reinforcement' | 'sprint' | 'mock'

export interface SubjectGoalConfig {
  stage: StudyStage
  targetScore: number
  manualProgress?: number
  note?: string
}

export interface StudyDailyTask {
  id: string
  title: string
  domain: 'cs_408' | 'math' | 'english' | 'politics' | 'general'
  done: boolean
  date: string
}

export interface DbStudyGoal {
  userId: string
  targetSchool: string
  targetTotalScore: number
  weeklyQuestionGoal: number
  dailyVocabGoal: number
  subjectGoals: {
    cs_408: SubjectGoalConfig
    math: SubjectGoalConfig
    english: SubjectGoalConfig
    politics: SubjectGoalConfig
  }
  dailyTasks: StudyDailyTask[]
  updatedAt: string
}

class CoreForgeDatabase {
  private db: DatabaseSync | null = null
  private dbPath: string = ''
  private isInitialized = false

  init(dataDir: string) {
    if (this.isInitialized) return
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    this.dbPath = path.join(dataDir, 'coreforge.sqlite')

    try {
      this.db = new DatabaseSync(this.dbPath)
      this.migrate()
      this.isInitialized = true
      console.log(`[Database] SQLite 数据库已成功挂载: ${this.dbPath}`)
    } catch (err: any) {
      console.error('[Database] SQLite 初始化异常:', err.message)
    }
  }


  private migrate() {
    if (!this.db) return

    // 1. 做题历史记录表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS quiz_records (
        id TEXT PRIMARY KEY,
        mode TEXT,
        total_questions INTEGER,
        correct_count INTEGER,
        wrong_count INTEGER,
        time_taken INTEGER,
        score REAL,
        domain TEXT,
        created_at TEXT,
        details_json TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_quiz_created ON quiz_records(created_at);
      CREATE INDEX IF NOT EXISTS idx_quiz_domain ON quiz_records(domain);
    `)

    // 2. 错题本表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS error_questions (
        id TEXT PRIMARY KEY,
        domain TEXT,
        subject TEXT,
        chapter TEXT,
        syllabus_id TEXT,
        question TEXT,
        options_json TEXT,
        user_answer TEXT,
        correct_answer TEXT,
        explanation TEXT,
        error_type TEXT,
        difficulty TEXT,
        source_note TEXT,
        status TEXT,
        created_at TEXT,
        updated_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_err_subject ON error_questions(subject);
      CREATE INDEX IF NOT EXISTS idx_err_syllabus ON error_questions(syllabus_id);
      CREATE INDEX IF NOT EXISTS idx_err_status ON error_questions(status);
    `)

    // 3. SM-2 艾宾浩斯闪卡状态表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sm2_flashcards (
        card_id TEXT PRIMARY KEY,
        title TEXT,
        subject TEXT,
        syllabus_id TEXT,
        repetition INTEGER DEFAULT 0,
        interval_days INTEGER DEFAULT 1,
        easiness_factor REAL DEFAULT 2.5,
        review_count INTEGER DEFAULT 0,
        last_review_at TEXT,
        next_review_at TEXT,
        last_grade INTEGER DEFAULT 0,
        history_json TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_sm2_next_review ON sm2_flashcards(next_review_at);
      CREATE INDEX IF NOT EXISTS idx_sm2_subject ON sm2_flashcards(subject);
    `)

    // 4. 考点掌握度热力聚合表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS syllabus_mastery (
        syllabus_id TEXT PRIMARY KEY,
        domain TEXT,
        subject TEXT,
        level1 TEXT,
        level2 TEXT,
        level3 TEXT,
        total_attempted INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        wrong_count INTEGER DEFAULT 0,
        mastery_score REAL DEFAULT 0.0,
        status TEXT DEFAULT 'red',
        updated_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_mastery_domain ON syllabus_mastery(domain);
      CREATE INDEX IF NOT EXISTS idx_mastery_status ON syllabus_mastery(status);
    `)

    // 5. 多用户体系与权限表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    `)

    // 6. 考生专属 AI 对话历史记录表 (chat_conversations)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        project_id TEXT,
        title TEXT NOT NULL,
        provider TEXT,
        model TEXT,
        agent_id TEXT,
        messages_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_chat_conv_user ON chat_conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_conv_updated ON chat_conversations(updated_at);
    `)

    // 7. 伴学积分变动明细流水表 (point_logs)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS point_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        balance_after REAL NOT NULL,
        remark TEXT,
        operator_id TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_point_logs_user ON point_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_point_logs_created ON point_logs(created_at);
    `)

    // 8. 优惠码/卡密积分兑换表 (coupon_codes & coupon_redemptions)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS coupon_codes (
        code TEXT PRIMARY KEY,
        points REAL NOT NULL,
        max_uses INTEGER NOT NULL DEFAULT 1,
        used_count INTEGER NOT NULL DEFAULT 0,
        expires_at TEXT,
        description TEXT,
        created_by TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_coupons_created ON coupon_codes(created_at);

      CREATE TABLE IF NOT EXISTS coupon_redemptions (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        user_id TEXT NOT NULL,
        points REAL NOT NULL,
        redeemed_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_redemptions_user ON coupon_redemptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_redemptions_code ON coupon_redemptions(code);
    `)

    // 9. 考生个人研学目标与今日冲刺清单表 (study_goals)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS study_goals (
        user_id TEXT PRIMARY KEY,
        target_school TEXT DEFAULT '目标院校 · 计算机学硕/专硕',
        target_total_score INTEGER DEFAULT 380,
        weekly_question_goal INTEGER DEFAULT 100,
        daily_vocab_goal INTEGER DEFAULT 30,
        subject_goals_json TEXT,
        daily_tasks_json TEXT,
        updated_at TEXT NOT NULL
      );
    `)

    // 8. 多租户数据隔离字段与积分字段自动补齐 (向后兼容)
    this.ensureColumn('quiz_records', 'user_id', "TEXT DEFAULT 'default'")
    this.ensureColumn('error_questions', 'user_id', "TEXT DEFAULT 'default'")
    this.ensureColumn('error_questions', 'notes', "TEXT DEFAULT ''")
    this.ensureColumn('sm2_flashcards', 'user_id', "TEXT DEFAULT 'default'")
    this.ensureColumn('users', 'points', 'REAL DEFAULT 5.0')
    this.ensureColumn('users', 'last_checkin_at', 'TEXT')
    this.ensureColumn('users', 'security_question', 'TEXT')
    this.ensureColumn('users', 'security_answer_hash', 'TEXT')
    this.ensureColumn('users', 'security_answer_salt', 'TEXT')
    this.ensureColumn('users', 'recovery_code', 'TEXT')

    // 平滑修复旧用户可能为 null 的积分值
    try {
      this.db.exec('UPDATE users SET points = 5.0 WHERE points IS NULL')
    } catch {}

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_records(user_id);
      CREATE INDEX IF NOT EXISTS idx_err_user ON error_questions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sm2_user ON sm2_flashcards(user_id);
    `)
  }

  private ensureColumn(tableName: string, columnName: string, columnDef: string) {
    if (!this.db) return
    try {
      const columns = this.db.prepare(`PRAGMA table_info(${tableName})`).all()
      const exists = columns.some((col) => col.name === columnName)
      if (!exists) {
        this.db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`)
        console.log(`[Database Migration] 为表 ${tableName} 成功补齐租户字段: ${columnName}`)
      }
    } catch (err) {
      console.warn(`[Database Migration] 检查列 ${tableName}.${columnName} 异常:`, err.message)
    }
  }

  // ===== Quiz Records Operations =====
  insertQuizRecord(record: DbQuizRecord): void {
    if (!this.db) return
    const stmt = this.db.prepare(`
      INSERT INTO quiz_records (id, user_id, mode, total_questions, correct_count, wrong_count, time_taken, score, domain, created_at, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      record.id,
      record.userId || 'default',
      record.mode,
      record.totalQuestions,
      record.correctCount,
      record.wrongCount,
      record.timeTaken,
      record.score,
      record.domain,
      record.createdAt,
      record.detailsJson
    )
  }

  getQuizRecords(limit = 50, domain?: string, userId?: string): DbQuizRecord[] {
    if (!this.db) return []
    let query = 'SELECT * FROM quiz_records WHERE 1=1'
    const params: any[] = []
    if (userId) {
      query += ' AND user_id = ?'
      params.push(userId)
    }
    if (domain) {
      query += ' AND domain = ?'
      params.push(domain)
    }
    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(limit)

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params)
    return rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      mode: r.mode,
      totalQuestions: r.total_questions,
      correctCount: r.correct_count,
      wrongCount: r.wrong_count,
      timeTaken: r.time_taken,
      score: r.score,
      domain: r.domain,
      createdAt: r.created_at,
      detailsJson: r.details_json,
    }))
  }

  // ===== Error Questions Operations =====
  upsertErrorQuestion(item: DbErrorQuestion): void {
    if (!this.db) return
    const stmt = this.db.prepare(`
      INSERT INTO error_questions (
        id, user_id, domain, subject, chapter, syllabus_id, question, options_json,
        user_answer, correct_answer, explanation, error_type, difficulty,
        source_note, status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        user_answer = excluded.user_answer,
        error_type = excluded.error_type,
        status = excluded.status,
        notes = CASE WHEN excluded.notes IS NOT NULL AND excluded.notes != '' THEN excluded.notes ELSE error_questions.notes END,
        updated_at = excluded.updated_at
    `)
    stmt.run(
      item.id,
      item.userId || 'default',
      item.domain,
      item.subject,
      item.chapter,
      item.syllabusId,
      item.question,
      item.optionsJson,
      item.userAnswer,
      item.correctAnswer,
      item.explanation,
      item.errorType,
      item.difficulty,
      item.sourceNote,
      item.status,
      item.notes || '',
      item.createdAt,
      item.updatedAt
    )
  }

  updateErrorQuestion(id: string, updates: Partial<DbErrorQuestion>, userId?: string): boolean {
    if (!this.db) return false
    const fields: string[] = []
    const params: any[] = []

    if (updates.status !== undefined) {
      fields.push('status = ?')
      params.push(updates.status)
    }
    if (updates.errorType !== undefined) {
      fields.push('error_type = ?')
      params.push(updates.errorType)
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?')
      params.push(updates.notes)
    }
    if (updates.userAnswer !== undefined) {
      fields.push('user_answer = ?')
      params.push(updates.userAnswer)
    }
    if (updates.difficulty !== undefined) {
      fields.push('difficulty = ?')
      params.push(updates.difficulty)
    }
    if (fields.length === 0) return true

    fields.push('updated_at = ?')
    params.push(new Date().toISOString().split('T')[0])

    let query = `UPDATE error_questions SET ${fields.join(', ')} WHERE id = ?`
    params.push(id)

    if (userId && userId !== 'all') {
      query += " AND (user_id = ? OR user_id IS NULL OR user_id = 'default')"
      params.push(userId)
    }

    const res = this.db.prepare(query).run(...params)
    return res.changes > 0
  }

  deleteErrorQuestion(id: string, userId?: string): boolean {
    if (!this.db) return false
    let query = 'DELETE FROM error_questions WHERE id = ?'
    const params: any[] = [id]
    if (userId && userId !== 'all') {
      query += " AND (user_id = ? OR user_id IS NULL OR user_id = 'default')"
      params.push(userId)
    }
    const res = this.db.prepare(query).run(...params)
    // 联动清理 SM-2 关联卡片
    try {
      this.db.prepare('DELETE FROM sm2_flashcards WHERE card_id = ?').run(id)
    } catch {}
    return res.changes > 0
  }

  batchUpdateErrorQuestions(ids: string[], updates: Partial<DbErrorQuestion>, userId?: string): number {
    if (!this.db || ids.length === 0) return 0
    let count = 0
    for (const id of ids) {
      if (this.updateErrorQuestion(id, updates, userId)) {
        count++
      }
    }
    return count
  }

  getErrorQuestionStats(userId?: string): {
    total: number
    active: number
    mastered: number
    dueToday: number
    subjectBreakdown: Record<string, number>
    errorTypeBreakdown: Record<string, number>
  } {
    if (!this.db) {
      return { total: 0, active: 0, mastered: 0, dueToday: 0, subjectBreakdown: {}, errorTypeBreakdown: {} }
    }
    const todayStr = new Date().toISOString().split('T')[0]
    let userFilter = ''
    const params: any[] = []
    if (userId && userId !== 'all') {
      userFilter = " AND (user_id = ? OR user_id IS NULL OR user_id = 'default')"
      params.push(userId)
    }

    // 统计总数、待攻克、已掌握
    const summaryStmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status != 'mastered' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'mastered' THEN 1 ELSE 0 END) as mastered
      FROM error_questions WHERE 1=1 ${userFilter}
    `)
    const summaryRow = summaryStmt.get(...params) as any

    // 统计今日待复习到期数 (通过关联 sm2_flashcards)
    let dueToday = 0
    try {
      const dueStmt = this.db.prepare(`
        SELECT COUNT(DISTINCT e.id) as due_count
        FROM error_questions e
        LEFT JOIN sm2_flashcards s ON e.id = s.card_id
        WHERE e.status != 'mastered' 
          AND (s.next_review_at IS NULL OR s.next_review_at <= ?)
          ${userFilter.replace(/user_id/g, 'e.user_id')}
      `)
      const dueParams = [todayStr, ...params]
      const dueRow = dueStmt.get(...dueParams) as any
      dueToday = dueRow?.due_count || 0
    } catch {}

    // 学科分布
    const subjStmt = this.db.prepare(`
      SELECT subject, COUNT(*) as count 
      FROM error_questions 
      WHERE 1=1 ${userFilter} 
      GROUP BY subject
    `)
    const subjRows = subjStmt.all(...params) as any[]
    const subjectBreakdown: Record<string, number> = {}
    for (const r of subjRows) {
      subjectBreakdown[r.subject || '其他'] = r.count
    }

    // 错因分布
    const errTypeStmt = this.db.prepare(`
      SELECT error_type, COUNT(*) as count 
      FROM error_questions 
      WHERE 1=1 ${userFilter} 
      GROUP BY error_type
    `)
    const errTypeRows = errTypeStmt.all(...params) as any[]
    const errorTypeBreakdown: Record<string, number> = {}
    for (const r of errTypeRows) {
      errorTypeBreakdown[r.error_type || '未归类'] = r.count
    }

    return {
      total: summaryRow?.total || 0,
      active: summaryRow?.active || 0,
      mastered: summaryRow?.mastered || 0,
      dueToday,
      subjectBreakdown,
      errorTypeBreakdown,
    }
  }

  getErrorQuestions(filter?: {
    subject?: string
    status?: string
    syllabusId?: string
    userId?: string
    errorType?: string
    search?: string
    domain?: string
  }): (DbErrorQuestion & { sm2?: any })[] {
    if (!this.db) return []
    let query = `
      SELECT 
        e.*,
        s.repetition,
        s.interval_days,
        s.easiness_factor,
        s.review_count,
        s.next_review_at
      FROM error_questions e
      LEFT JOIN sm2_flashcards s ON e.id = s.card_id
      WHERE 1=1
    `
    const params: any[] = []
    if (filter?.userId && filter.userId !== 'all') {
      query += " AND (e.user_id = ? OR e.user_id IS NULL OR e.user_id = 'default')"
      params.push(filter.userId)
    }
    if (filter?.domain) {
      query += ' AND e.domain = ?'
      params.push(filter.domain)
    }
    if (filter?.subject && filter.subject !== 'all' && filter.subject !== '全部') {
      query += ' AND e.subject = ?'
      params.push(filter.subject)
    }
    if (filter?.status && filter.status !== 'all' && filter.status !== '全部') {
      if (filter.status === 'active') {
        query += " AND (e.status = 'active' OR e.status = 'reviewing' OR e.status IS NULL)"
      } else {
        query += ' AND e.status = ?'
        params.push(filter.status)
      }
    }
    if (filter?.errorType && filter.errorType !== 'all' && filter.errorType !== '全部') {
      query += ' AND e.error_type = ?'
      params.push(filter.errorType)
    }
    if (filter?.syllabusId) {
      query += ' AND e.syllabus_id = ?'
      params.push(filter.syllabusId)
    }
    if (filter?.search && filter.search.trim()) {
      const kw = `%${filter.search.trim()}%`
      query += ' AND (e.question LIKE ? OR e.explanation LIKE ? OR e.notes LIKE ? OR e.chapter LIKE ?)'
      params.push(kw, kw, kw, kw)
    }
    query += ' ORDER BY e.updated_at DESC, e.created_at DESC'

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params)
    return rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      domain: r.domain,
      subject: r.subject,
      chapter: r.chapter,
      syllabusId: r.syllabus_id,
      question: r.question,
      optionsJson: r.options_json,
      userAnswer: r.user_answer,
      correctAnswer: r.correct_answer,
      explanation: r.explanation,
      errorType: r.error_type,
      difficulty: r.difficulty,
      sourceNote: r.source_note,
      status: r.status || 'active',
      notes: r.notes || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      sm2: r.review_count !== undefined ? {
        repetition: r.repetition || 0,
        intervalDays: r.interval_days || 1,
        easinessFactor: r.easiness_factor || 2.5,
        reviewCount: r.review_count || 0,
        nextReviewAt: r.next_review_at || null,
      } : undefined,
    }))
  }

  // ===== SM-2 Flashcards Operations =====
  getSM2Flashcard(cardId: string): DbSM2Flashcard | null {
    if (!this.db) return null
    const stmt = this.db.prepare('SELECT * FROM sm2_flashcards WHERE card_id = ?')
    const row = stmt.get(cardId) as any
    if (!row) return null
    return {
      cardId: row.card_id,
      title: row.title,
      subject: row.subject,
      syllabusId: row.syllabus_id,
      repetition: row.repetition,
      intervalDays: row.interval_days,
      easinessFactor: row.easiness_factor,
      reviewCount: row.review_count,
      lastReviewAt: row.last_review_at,
      nextReviewAt: row.next_review_at,
      lastGrade: row.last_grade,
      historyJson: row.history_json,
    }
  }

  upsertSM2Flashcard(card: DbSM2Flashcard): void {
    if (!this.db) return
    const stmt = this.db.prepare(`
      INSERT INTO sm2_flashcards (
        card_id, title, subject, syllabus_id, repetition, interval_days,
        easiness_factor, review_count, last_review_at, next_review_at,
        last_grade, history_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(card_id) DO UPDATE SET
        repetition = excluded.repetition,
        interval_days = excluded.interval_days,
        easiness_factor = excluded.easiness_factor,
        review_count = excluded.review_count,
        last_review_at = excluded.last_review_at,
        next_review_at = excluded.next_review_at,
        last_grade = excluded.last_grade,
        history_json = excluded.history_json
    `)
    stmt.run(
      card.cardId,
      card.title,
      card.subject,
      card.syllabusId,
      card.repetition,
      card.intervalDays,
      card.easinessFactor,
      card.reviewCount,
      card.lastReviewAt,
      card.nextReviewAt,
      card.lastGrade,
      card.historyJson
    )
  }

  getDueFlashcards(targetDateIso: string, subject?: string): DbSM2Flashcard[] {
    if (!this.db) return []
    let query = 'SELECT * FROM sm2_flashcards WHERE (next_review_at <= ? OR next_review_at IS NULL)'
    const params: any[] = [targetDateIso]
    if (subject) {
      query += ' AND subject = ?'
      params.push(subject)
    }
    query += ' ORDER BY next_review_at ASC'

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params)
    return rows.map((r: any) => ({
      cardId: r.card_id,
      title: r.title,
      subject: r.subject,
      syllabusId: r.syllabus_id,
      repetition: r.repetition,
      intervalDays: r.interval_days,
      easinessFactor: r.easiness_factor,
      reviewCount: r.review_count,
      lastReviewAt: r.last_review_at,
      nextReviewAt: r.next_review_at,
      lastGrade: r.last_grade,
      historyJson: r.history_json,
    }))
  }

  // ===== Syllabus Mastery Operations =====
  upsertMasteryRecord(item: DbMasteryRecord): void {
    if (!this.db) return
    const stmt = this.db.prepare(`
      INSERT INTO syllabus_mastery (
        syllabus_id, domain, subject, level1, level2, level3,
        total_attempted, correct_count, wrong_count, mastery_score,
        status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(syllabus_id) DO UPDATE SET
        total_attempted = excluded.total_attempted,
        correct_count = excluded.correct_count,
        wrong_count = excluded.wrong_count,
        mastery_score = excluded.mastery_score,
        status = excluded.status,
        updated_at = excluded.updated_at
    `)
    stmt.run(
      item.syllabusId,
      item.domain,
      item.subject,
      item.level1,
      item.level2,
      item.level3,
      item.totalAttempted,
      item.correctCount,
      item.wrongCount,
      item.masteryScore,
      item.status,
      item.updatedAt
    )
  }

  getAllMasteryRecords(domain?: string): DbMasteryRecord[] {
    if (!this.db) return []
    let query = 'SELECT * FROM syllabus_mastery'
    const params: any[] = []
    if (domain) {
      query += ' WHERE domain = ?'
      params.push(domain)
    }
    query += ' ORDER BY mastery_score ASC'

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params)
    return rows.map((r: any) => ({
      syllabusId: r.syllabus_id,
      domain: r.domain,
      subject: r.subject,
      level1: r.level1,
      level2: r.level2,
      level3: r.level3,
      totalAttempted: r.total_attempted,
      correctCount: r.correct_count,
      wrongCount: r.wrong_count,
      masteryScore: r.mastery_score,
      status: r.status,
      updatedAt: r.updated_at,
    }))
  }

  // ===== Multi-User & Session Operations =====
  getUserCount(): number {
    if (!this.db) return 0
    const row = this.db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number } | undefined
    return row?.cnt || 0
  }

  findUserByUsername(username: string): DbUser | null {
    if (!this.db) return null
    const row = this.db
      .prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE OR display_name = ? COLLATE NOCASE')
      .get(username, username) as any
    if (!row) return null
    return {
      id: row.id,
      username: row.username,
      displayName: row.display_name,
      passwordHash: row.password_hash,
      salt: row.salt,
      role: row.role as UserRole,
      points: typeof row.points === 'number' ? row.points : 5.0,
      lastCheckinAt: row.last_checkin_at || undefined,
      securityQuestion: row.security_question || undefined,
      securityAnswerHash: row.security_answer_hash || undefined,
      securityAnswerSalt: row.security_answer_salt || undefined,
      recoveryCode: row.recovery_code || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  findUserById(id: string): DbUser | null {
    if (!this.db) return null
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any
    if (!row) return null
    return {
      id: row.id,
      username: row.username,
      displayName: row.display_name,
      passwordHash: row.password_hash,
      salt: row.salt,
      role: row.role as UserRole,
      points: typeof row.points === 'number' ? row.points : 5.0,
      lastCheckinAt: row.last_checkin_at || undefined,
      securityQuestion: row.security_question || undefined,
      securityAnswerHash: row.security_answer_hash || undefined,
      securityAnswerSalt: row.security_answer_salt || undefined,
      recoveryCode: row.recovery_code || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  listUsers(): Omit<DbUser, 'passwordHash' | 'salt'>[] {
    if (!this.db) return []
    const rows = this.db.prepare('SELECT id, username, display_name, role, points, last_checkin_at, created_at, updated_at FROM users ORDER BY created_at ASC').all() as any[]
    return rows.map(r => ({
      id: r.id,
      username: r.username,
      displayName: r.display_name,
      role: r.role as UserRole,
      points: typeof r.points === 'number' ? r.points : 5.0,
      lastCheckinAt: r.last_checkin_at || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }))
  }

  insertUser(user: DbUser): void {
    if (!this.db) return
    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, display_name, password_hash, salt, role, points, last_checkin_at, security_question, security_answer_hash, security_answer_salt, recovery_code, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      user.id,
      user.username,
      user.displayName,
      user.passwordHash,
      user.salt,
      user.role,
      user.points !== undefined ? user.points : 5.0,
      user.lastCheckinAt || null,
      user.securityQuestion || null,
      user.securityAnswerHash || null,
      user.securityAnswerSalt || null,
      user.recoveryCode || null,
      user.createdAt,
      user.updatedAt
    )
  }

  updateUser(
    id: string,
    updates: {
      displayName?: string
      role?: UserRole
      passwordHash?: string
      salt?: string
      securityQuestion?: string | null
      securityAnswerHash?: string | null
      securityAnswerSalt?: string | null
      recoveryCode?: string | null
    }
  ): void {
    if (!this.db) return
    const fields: string[] = []
    const values: any[] = []

    if (updates.displayName !== undefined) {
      fields.push('display_name = ?')
      values.push(updates.displayName)
    }
    if (updates.role !== undefined) {
      fields.push('role = ?')
      values.push(updates.role)
    }
    if (updates.passwordHash !== undefined && updates.salt !== undefined) {
      fields.push('password_hash = ?', 'salt = ?')
      values.push(updates.passwordHash, updates.salt)
    }
    if (updates.securityQuestion !== undefined) {
      fields.push('security_question = ?')
      values.push(updates.securityQuestion)
    }
    if (updates.securityAnswerHash !== undefined && updates.securityAnswerSalt !== undefined) {
      fields.push('security_answer_hash = ?', 'security_answer_salt = ?')
      values.push(updates.securityAnswerHash, updates.securityAnswerSalt)
    }
    if (updates.recoveryCode !== undefined) {
      fields.push('recovery_code = ?')
      values.push(updates.recoveryCode)
    }

    if (fields.length === 0) return

    fields.push('updated_at = ?')
    values.push(new Date().toISOString())
    values.push(id)

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
    this.db.prepare(query).run(...values)
  }

  findUserSecurityInfo(username: string): {
    exists: boolean
    username: string
    hasSecurityQuestion: boolean
    securityQuestion?: string
    hasRecoveryCode: boolean
  } | null {
    const user = this.findUserByUsername(username)
    if (!user) return null
    return {
      exists: true,
      username: user.username,
      hasSecurityQuestion: Boolean(user.securityQuestion && user.securityAnswerHash),
      securityQuestion: user.securityQuestion || undefined,
      hasRecoveryCode: Boolean(user.recoveryCode),
    }
  }

  deleteUser(id: string): void {
    if (!this.db) return
    this.db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id)
    this.db.prepare('DELETE FROM users WHERE id = ?').run(id)
  }

  insertSession(session: DbSession): void {
    if (!this.db) return
    const stmt = this.db.prepare(`
      INSERT INTO sessions (token, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run(session.token, session.userId, session.createdAt, session.expiresAt)
  }

  findSessionByToken(token: string): { session: DbSession; user: DbUser } | null {
    if (!this.db) return null
    const query = `
      SELECT 
        s.token, s.user_id, s.created_at as session_created_at, s.expires_at,
        u.id, u.username, u.display_name, u.password_hash, u.salt, u.role, u.points, u.last_checkin_at, u.created_at as user_created_at, u.updated_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ?
    `
    const row = this.db.prepare(query).get(token) as any
    if (!row) return null

    // 检查是否过期
    if (new Date(row.expires_at).getTime() < Date.now()) {
      this.deleteSession(token)
      return null
    }

    return {
      session: {
        token: row.token,
        userId: row.user_id,
        createdAt: row.session_created_at,
        expiresAt: row.expires_at,
      },
      user: {
        id: row.id,
        username: row.username,
        displayName: row.display_name,
        passwordHash: row.password_hash,
        salt: row.salt,
        role: row.role as UserRole,
        points: typeof row.points === 'number' ? row.points : 5.0,
        lastCheckinAt: row.last_checkin_at || undefined,
        createdAt: row.user_created_at,
        updatedAt: row.updated_at,
      },
    }
  }

  // ===== AI 伴学积分与每日签到操作 =====
  private getTodayDateString(): string {
    // 强制基于东八区（UTC+8）中国标准时间计算当日日期字符串 YYYY-MM-DD
    const nowUtc = Date.now()
    const chinaTime = new Date(nowUtc + 8 * 3600 * 1000)
    return chinaTime.toISOString().slice(0, 10)
  }

  getUserPoints(userId: string): { points: number; lastCheckinAt?: string; canCheckinToday: boolean } | null {
    if (!this.db || !userId) return null
    const row = this.db.prepare('SELECT points, last_checkin_at FROM users WHERE id = ?').get(userId) as any
    if (!row) return null
    const today = this.getTodayDateString()
    const points = typeof row.points === 'number' ? row.points : 5.0
    const lastCheckinAt = row.last_checkin_at || undefined
    return {
      points,
      lastCheckinAt,
      canCheckinToday: lastCheckinAt !== today,
    }
  }

  checkinUser(userId: string): { success: boolean; points: number; earned: number; message: string; lastCheckinAt: string } {
    if (!this.db || !userId) {
      return { success: false, points: 0, earned: 0, message: '数据库不可用或用户未登录', lastCheckinAt: '' }
    }
    const user = this.findUserById(userId)
    if (!user) {
      return { success: false, points: 0, earned: 0, message: '用户不存在', lastCheckinAt: '' }
    }
    const today = this.getTodayDateString()
    if (user.lastCheckinAt === today) {
      return {
        success: false,
        points: user.points,
        earned: 0,
        message: '今日已完成签到，请明天再来领取！',
        lastCheckinAt: today,
      }
    }

    const earned = 1.0
    const newPoints = Math.round((user.points + earned) * 100) / 100
    const now = new Date().toISOString()

    this.db.prepare('UPDATE users SET points = ?, last_checkin_at = ?, updated_at = ? WHERE id = ?')
      .run(newPoints, today, now, userId)

    const logId = `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    this.db.prepare(`
      INSERT INTO point_logs (id, user_id, type, amount, balance_after, remark, operator_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, userId, 'checkin', earned, newPoints, '每日签到赠送 1.0 积分', null, now)

    return {
      success: true,
      points: newPoints,
      earned,
      message: '签到成功！已获得 1 积分，助力 AI 伴学研考提分',
      lastCheckinAt: today,
    }
  }

  refundUserPoints(
    userId: string,
    amount: number = 0.1,
    remark: string = 'AI 伴学提问异常自动原路返还'
  ): { success: boolean; points: number; refunded: number } {
    if (!this.db || !userId) return { success: false, points: 0, refunded: 0 }
    const user = this.findUserById(userId)
    if (!user) return { success: false, points: 0, refunded: 0 }
    const refunded = Math.round(amount * 100) / 100
    const newPoints = Math.round((user.points + refunded) * 100) / 100
    const now = new Date().toISOString()
    this.db.prepare('UPDATE users SET points = ?, updated_at = ? WHERE id = ?').run(newPoints, now, userId)
    const logId = `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    this.db.prepare(`
      INSERT INTO point_logs (id, user_id, type, amount, balance_after, remark, operator_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, userId, 'refund', refunded, newPoints, remark, null, now)
    return { success: true, points: newPoints, refunded }
  }

  deductUserPoints(
    userId: string,
    amount: number = 0.1,
    remark: string = 'AI 伴学单次对话'
  ): { success: boolean; points: number; deducted: number; message?: string } {
    if (!this.db || !userId) {
      return { success: false, points: 0, deducted: 0, message: '服务不可用' }
    }
    const user = this.findUserById(userId)
    if (!user) {
      return { success: false, points: 0, deducted: 0, message: '用户不存在' }
    }

    // 超级管理员免受阻断
    const isAdmin = user.role === 'admin'
    if (!isAdmin && user.points < amount) {
      return {
        success: false,
        points: user.points,
        deducted: 0,
        message: `伴学积分不足（当前剩余 ${user.points.toFixed(1)} 积分，单次提问消耗 ${amount} 积分）。每日签到可领 1 积分，或请管理员分配积分。`,
      }
    }

    const deducted = amount
    const newPoints = Math.max(0, Math.round((user.points - deducted) * 100) / 100)
    const now = new Date().toISOString()

    this.db.prepare('UPDATE users SET points = ?, updated_at = ? WHERE id = ?')
      .run(newPoints, now, userId)

    const logId = `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    this.db.prepare(`
      INSERT INTO point_logs (id, user_id, type, amount, balance_after, remark, operator_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, userId, 'chat_deduct', -deducted, newPoints, remark, null, now)

    return {
      success: true,
      points: newPoints,
      deducted,
    }
  }

  grantUserPoints(
    userId: string,
    amount: number,
    operatorId?: string,
    remark?: string
  ): { success: boolean; points: number; delta: number; message?: string } {
    if (!this.db || !userId) {
      return { success: false, points: 0, delta: 0, message: '服务不可用' }
    }
    const user = this.findUserById(userId)
    if (!user) {
      return { success: false, points: 0, delta: 0, message: '目标用户不存在' }
    }

    const delta = Math.round(amount * 100) / 100
    const newPoints = Math.max(0, Math.round((user.points + delta) * 100) / 100)
    const now = new Date().toISOString()

    this.db.prepare('UPDATE users SET points = ?, updated_at = ? WHERE id = ?')
      .run(newPoints, now, userId)

    const logType: PointLogType = delta >= 0 ? 'admin_grant' : 'admin_deduct'
    const note = remark || (delta >= 0 ? `管理员分配增加 ${delta} 积分` : `管理员调整扣减 ${Math.abs(delta)} 积分`)
    const logId = `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    this.db.prepare(`
      INSERT INTO point_logs (id, user_id, type, amount, balance_after, remark, operator_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, userId, logType, delta, newPoints, note, operatorId || null, now)

    return {
      success: true,
      points: newPoints,
      delta,
      message: `已成功为用户分配积分，当前余额: ${newPoints}`,
    }
  }

  listPointLogs(userId: string, limit: number = 20): DbPointLog[] {
    if (!this.db || !userId) return []
    try {
      const rows = this.db.prepare(`
        SELECT id, user_id, type, amount, balance_after, remark, operator_id, created_at
        FROM point_logs
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `).all(userId, limit) as any[]

      return rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        type: r.type as PointLogType,
        amount: r.amount,
        balanceAfter: r.balance_after,
        remark: r.remark || '',
        operatorId: r.operator_id || undefined,
        createdAt: r.created_at,
      }))
    } catch {
      return []
    }
  }

  // ===== 优惠码兑换与自主充值操作 =====

  redeemCoupon(userId: string, rawCode: string): { success: boolean; points: number; earned: number; message: string } {
    if (!this.db || !userId) {
      return { success: false, points: 0, earned: 0, message: '系统未就绪或未登录' }
    }
    const code = String(rawCode || '').trim().toUpperCase()
    if (!code) {
      return { success: false, points: 0, earned: 0, message: '请输入有效的兑换码' }
    }

    const user = this.findUserById(userId)
    if (!user) {
      return { success: false, points: 0, earned: 0, message: '用户不存在' }
    }

    const coupon = this.db.prepare('SELECT * FROM coupon_codes WHERE code = ?').get(code) as any
    if (!coupon) {
      return { success: false, points: user.points, earned: 0, message: '兑换码不存在或输入有误，请核对后重试' }
    }

    // 检查是否过期
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
      return { success: false, points: user.points, earned: 0, message: '该优惠码已过期失效' }
    }

    // 检查使用次数
    if (coupon.used_count >= coupon.max_uses) {
      return { success: false, points: user.points, earned: 0, message: '该优惠码已达到最大兑换次数上限' }
    }

    // 检查当前用户是否已兑换过该优惠码
    const existing = this.db.prepare('SELECT id FROM coupon_redemptions WHERE code = ? AND user_id = ?').get(code, userId)
    if (existing) {
      return { success: false, points: user.points, earned: 0, message: '您已经使用过该优惠码，不可重复兑换' }
    }

    const earned = Number(coupon.points)
    const newPoints = Math.round((user.points + earned) * 100) / 100
    const now = new Date().toISOString()
    const redemptionId = `red_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const logId = `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    // 原子更新优惠码使用计数与用户积分
    this.db.prepare('UPDATE coupon_codes SET used_count = used_count + 1 WHERE code = ?').run(code)
    this.db.prepare('UPDATE users SET points = ?, updated_at = ? WHERE id = ?').run(newPoints, now, userId)
    this.db.prepare(`
      INSERT INTO coupon_redemptions (id, code, user_id, points, redeemed_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(redemptionId, code, userId, earned, now)

    const remark = coupon.description ? `优惠码兑换[${code}]: ${coupon.description}` : `优惠码兑换[${code}]`
    this.db.prepare(`
      INSERT INTO point_logs (id, user_id, type, amount, balance_after, remark, operator_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, userId, 'coupon_redeem', earned, newPoints, remark, null, now)

    return {
      success: true,
      points: newPoints,
      earned,
      message: `🎉 成功兑换 ${earned} 伴学积分！当前可用余额: ${newPoints} 积分`,
    }
  }

  createCoupons(
    data: {
      points: number
      count: number
      maxUses?: number
      description?: string
      expiresAt?: string
      customCode?: string
    },
    createdBy?: string
  ): DbCouponCode[] {
    if (!this.db) return []
    const points = Math.max(0.1, Number(data.points) || 10)
    const count = Math.min(100, Math.max(1, Number(data.count) || 1))
    const maxUses = Math.max(1, Number(data.maxUses) || 1)
    const now = new Date().toISOString()
    const stmt = this.db.prepare(`
      INSERT INTO coupon_codes (code, points, max_uses, used_count, expires_at, description, created_by, created_at)
      VALUES (?, ?, ?, 0, ?, ?, ?, ?)
    `)

    const generated: DbCouponCode[] = []
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 去除易混淆字符 0, 1, I, O

    const generateRandomCode = () => {
      let part1 = ''
      let part2 = ''
      for (let i = 0; i < 4; i++) {
        part1 += alphabet[Math.floor(Math.random() * alphabet.length)]
        part2 += alphabet[Math.floor(Math.random() * alphabet.length)]
      }
      return `CF-${part1}-${part2}`
    }

    for (let i = 0; i < count; i++) {
      let code = (count === 1 && data.customCode)
        ? data.customCode.trim().toUpperCase()
        : generateRandomCode()

      // 确保 code 唯一
      let attempts = 0
      while (attempts < 10) {
        const exist = this.db.prepare('SELECT code FROM coupon_codes WHERE code = ?').get(code)
        if (!exist) break
        code = generateRandomCode()
        attempts++
      }

      try {
        stmt.run(
          code,
          points,
          maxUses,
          data.expiresAt || null,
          data.description || null,
          createdBy || null,
          now
        )
        generated.push({
          code,
          points,
          maxUses,
          usedCount: 0,
          expiresAt: data.expiresAt,
          description: data.description,
          createdBy,
          createdAt: now,
        })
      } catch (err: any) {
        console.error('[Database] 生成优惠码异常:', err.message)
      }
    }

    return generated
  }

  listCoupons(): DbCouponCode[] {
    if (!this.db) return []
    try {
      const rows = this.db.prepare('SELECT * FROM coupon_codes ORDER BY created_at DESC').all() as any[]
      return rows.map(r => ({
        code: r.code,
        points: r.points,
        maxUses: r.max_uses,
        usedCount: r.used_count,
        expiresAt: r.expires_at || undefined,
        description: r.description || undefined,
        createdBy: r.created_by || undefined,
        createdAt: r.created_at,
      }))
    } catch {
      return []
    }
  }

  deleteCoupon(code: string): boolean {
    if (!this.db || !code) return false
    try {
      this.db.prepare('DELETE FROM coupon_codes WHERE code = ?').run(code.trim().toUpperCase())
      return true
    } catch {
      return false
    }
  }

  rechargeUserPoints(
    userId: string,
    amount: number,
    channel: string = '在线快捷充值'
  ): { success: boolean; points: number; recharged: number; message: string } {
    if (!this.db || !userId) {
      return { success: false, points: 0, recharged: 0, message: '服务不可用' }
    }
    const user = this.findUserById(userId)
    if (!user) {
      return { success: false, points: 0, recharged: 0, message: '用户不存在' }
    }
    const recharged = Math.max(0.1, Math.round(Number(amount) * 100) / 100)
    const newPoints = Math.round((user.points + recharged) * 100) / 100
    const now = new Date().toISOString()
    const logId = `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    this.db.prepare('UPDATE users SET points = ?, updated_at = ? WHERE id = ?')
      .run(newPoints, now, userId)

    this.db.prepare(`
      INSERT INTO point_logs (id, user_id, type, amount, balance_after, remark, operator_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, userId, 'recharge', recharged, newPoints, `自主充值: ${channel}`, null, now)

    return {
      success: true,
      points: newPoints,
      recharged,
      message: `充值成功！已到账 ${recharged} 伴学积分，当前余额: ${newPoints} 积分`,
    }
  }

  deleteSession(token: string): void {
    if (!this.db) return
    this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
  }

  deleteUserSessions(userId: string): void {
    if (!this.db) return
    this.db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId)
  }

  cleanExpiredSessions(): void {
    if (!this.db) return
    this.db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString())
  }

  // ===== 考生专属 AI 对话历史持久化操作 =====
  getUserChatConversations(userId: string): DbChatConversation[] {
    if (!this.db || !userId) return []
    try {
      const rows = this.db.prepare(
        'SELECT * FROM chat_conversations WHERE user_id = ? ORDER BY updated_at DESC'
      ).all(userId) as any[]

      return rows.map(r => {
        let messages: any[] = []
        try {
          messages = JSON.parse(r.messages_json || '[]')
        } catch {
          messages = []
        }
        return {
          id: r.id,
          userId: r.user_id,
          projectId: r.project_id || 'default',
          title: r.title,
          provider: r.provider,
          model: r.model,
          agentId: r.agent_id,
          messages,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }
      })
    } catch (e: any) {
      console.error('[Database] 读取用户对话历史失败:', e.message)
      return []
    }
  }

  saveUserChatConversations(userId: string, conversations: any[]): void {
    if (!this.db || !userId || !Array.isArray(conversations)) return
    const now = new Date().toISOString()
    const stmt = this.db.prepare(`
      INSERT INTO chat_conversations (id, user_id, project_id, title, provider, model, agent_id, messages_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        provider = excluded.provider,
        model = excluded.model,
        agent_id = excluded.agent_id,
        messages_json = excluded.messages_json,
        updated_at = excluded.updated_at
    `)

    for (const c of conversations) {
      if (!c.id) continue
      try {
        stmt.run(
          c.id,
          userId,
          c.projectId || 'default',
          c.title || '新会话',
          c.provider || 'deepseek',
          c.model || '',
          c.agentId || 'coreforge-ai',
          JSON.stringify(c.messages || []),
          c.createdAt ? new Date(c.createdAt).toISOString() : now,
          c.updatedAt ? new Date(c.updatedAt).toISOString() : now
        )
      } catch (err: any) {
        console.error('[Database] 保存单条会话失败:', err.message)
      }
    }
  }

  deleteChatConversation(userId: string, conversationId: string): boolean {
    if (!this.db) return false
    try {
      this.db.prepare('DELETE FROM chat_conversations WHERE user_id = ? AND id = ?').run(userId, conversationId)
      return true
    } catch {
      return false
    }
  }

  // ===== 个人研学目标与今日冲刺清单 (study_goals) =====
  getDefaultStudyGoal(userId: string): DbStudyGoal {
    const today = this.getTodayDateString()
    return {
      userId,
      targetSchool: '985/211 计算机考研目标',
      targetTotalScore: 380,
      weeklyQuestionGoal: 100,
      dailyVocabGoal: 30,
      subjectGoals: {
        cs_408: { stage: 'foundation', targetScore: 115, manualProgress: 0 },
        math: { stage: 'foundation', targetScore: 120, manualProgress: 0 },
        english: { stage: 'foundation', targetScore: 75, manualProgress: 0 },
        politics: { stage: 'not_started', targetScore: 70, manualProgress: 0 },
      },
      dailyTasks: [
        { id: `task-${today}-1`, title: '完成 1 组 408 / 数学真题专项练习', domain: 'cs_408', done: false, date: today },
        { id: `task-${today}-2`, title: '复习到期易忘闪卡与错题本', domain: 'math', done: false, date: today },
        { id: `task-${today}-3`, title: '考研英语高频词背诵与长难句精读', domain: 'english', done: false, date: today },
      ],
      updatedAt: new Date().toISOString(),
    }
  }

  getStudyGoal(userId: string): DbStudyGoal {
    const uid = userId || 'default'
    const defaults = this.getDefaultStudyGoal(uid)
    if (!this.db) return defaults
    try {
      const row = this.db.prepare('SELECT * FROM study_goals WHERE user_id = ?').get(uid) as any
      if (!row) return defaults

      let subjectGoals = defaults.subjectGoals
      try {
        if (row.subject_goals_json) {
          const parsed = JSON.parse(row.subject_goals_json)
          subjectGoals = {
            cs_408: { ...defaults.subjectGoals.cs_408, ...(parsed.cs_408 || {}) },
            math: { ...defaults.subjectGoals.math, ...(parsed.math || {}) },
            english: { ...defaults.subjectGoals.english, ...(parsed.english || {}) },
            politics: { ...defaults.subjectGoals.politics, ...(parsed.politics || {}) },
          }
        }
      } catch {}

      let dailyTasks = defaults.dailyTasks
      const today = this.getTodayDateString()
      try {
        if (row.daily_tasks_json) {
          const parsed = JSON.parse(row.daily_tasks_json)
          if (Array.isArray(parsed)) {
            const todayTasks = parsed.filter((t: any) => t && t.date === today)
            if (todayTasks.length > 0) {
              dailyTasks = todayTasks
            } else if (parsed.length > 0) {
              // 新的一天：继承昨日自定义任务的模板标题但重置完成状态
              dailyTasks = parsed.slice(0, 8).map((t: any, idx: number) => ({
                id: `task-${today}-${idx + 1}`,
                title: String(t.title || ''),
                domain: t.domain || 'general',
                done: false,
                date: today,
              })).filter((t: any) => t.title)
            }
          }
        }
      } catch {}

      return {
        userId: uid,
        targetSchool: row.target_school || defaults.targetSchool,
        targetTotalScore: Number(row.target_total_score) || defaults.targetTotalScore,
        weeklyQuestionGoal: Number(row.weekly_question_goal) || defaults.weeklyQuestionGoal,
        dailyVocabGoal: Number(row.daily_vocab_goal) || defaults.dailyVocabGoal,
        subjectGoals,
        dailyTasks,
        updatedAt: row.updated_at || defaults.updatedAt,
      }
    } catch {
      return defaults
    }
  }

  upsertStudyGoal(
    userId: string,
    patch: Partial<Omit<DbStudyGoal, 'userId' | 'updatedAt'>>
  ): DbStudyGoal {
    const uid = userId || 'default'
    const current = this.getStudyGoal(uid)
    const today = this.getTodayDateString()

    const merged: DbStudyGoal = {
      userId: uid,
      targetSchool: patch.targetSchool !== undefined ? String(patch.targetSchool).trim().slice(0, 80) : current.targetSchool,
      targetTotalScore: patch.targetTotalScore !== undefined ? Math.min(500, Math.max(100, Number(patch.targetTotalScore) || 380)) : current.targetTotalScore,
      weeklyQuestionGoal: patch.weeklyQuestionGoal !== undefined ? Math.min(2000, Math.max(10, Number(patch.weeklyQuestionGoal) || 100)) : current.weeklyQuestionGoal,
      dailyVocabGoal: patch.dailyVocabGoal !== undefined ? Math.min(500, Math.max(5, Number(patch.dailyVocabGoal) || 30)) : current.dailyVocabGoal,
      subjectGoals: patch.subjectGoals
        ? {
            cs_408: { ...current.subjectGoals.cs_408, ...(patch.subjectGoals.cs_408 || {}) },
            math: { ...current.subjectGoals.math, ...(patch.subjectGoals.math || {}) },
            english: { ...current.subjectGoals.english, ...(patch.subjectGoals.english || {}) },
            politics: { ...current.subjectGoals.politics, ...(patch.subjectGoals.politics || {}) },
          }
        : current.subjectGoals,
      dailyTasks: Array.isArray(patch.dailyTasks)
        ? patch.dailyTasks.slice(0, 20).map((t, idx) => ({
            id: t.id || `task-${today}-${idx + 1}`,
            title: String(t.title || '').trim().slice(0, 120),
            domain: t.domain || 'general',
            done: Boolean(t.done),
            date: today,
          })).filter(t => t.title.length > 0)
        : current.dailyTasks,
      updatedAt: new Date().toISOString(),
    }

    if (this.db) {
      this.db.prepare(`
        INSERT INTO study_goals (
          user_id, target_school, target_total_score, weekly_question_goal, daily_vocab_goal,
          subject_goals_json, daily_tasks_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          target_school = excluded.target_school,
          target_total_score = excluded.target_total_score,
          weekly_question_goal = excluded.weekly_question_goal,
          daily_vocab_goal = excluded.daily_vocab_goal,
          subject_goals_json = excluded.subject_goals_json,
          daily_tasks_json = excluded.daily_tasks_json,
          updated_at = excluded.updated_at
      `).run(
        merged.userId,
        merged.targetSchool,
        merged.targetTotalScore,
        merged.weeklyQuestionGoal,
        merged.dailyVocabGoal,
        JSON.stringify(merged.subjectGoals),
        JSON.stringify(merged.dailyTasks),
        merged.updatedAt
      )
    }

    return merged
  }

  close() {
    if (this.db) {
      try {
        this.db.close()
      } catch {}
      this.db = null
      this.isInitialized = false
    }
  }
}

export const database = new CoreForgeDatabase()
