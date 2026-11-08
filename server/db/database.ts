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

export interface DbUser {
  id: string
  username: string
  displayName: string
  passwordHash: string
  salt: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface DbSession {
  token: string
  userId: string
  createdAt: string
  expiresAt: string
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
  }

  // ===== Quiz Records Operations =====
  insertQuizRecord(record: DbQuizRecord): void {
    if (!this.db) return
    const stmt = this.db.prepare(`
      INSERT INTO quiz_records (id, mode, total_questions, correct_count, wrong_count, time_taken, score, domain, created_at, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      record.id,
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

  getQuizRecords(limit = 50, domain?: string): DbQuizRecord[] {
    if (!this.db) return []
    let query = 'SELECT * FROM quiz_records'
    const params: any[] = []
    if (domain) {
      query += ' WHERE domain = ?'
      params.push(domain)
    }
    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(limit)

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params)
    return rows.map((r: any) => ({
      id: r.id,
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
        id, domain, subject, chapter, syllabus_id, question, options_json,
        user_answer, correct_answer, explanation, error_type, difficulty,
        source_note, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        user_answer = excluded.user_answer,
        error_type = excluded.error_type,
        status = excluded.status,
        updated_at = excluded.updated_at
    `)
    stmt.run(
      item.id,
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
      item.createdAt,
      item.updatedAt
    )
  }

  getErrorQuestions(filter?: { subject?: string; status?: string; syllabusId?: string }): DbErrorQuestion[] {
    if (!this.db) return []
    let query = 'SELECT * FROM error_questions WHERE 1=1'
    const params: any[] = []
    if (filter?.subject) {
      query += ' AND subject = ?'
      params.push(filter.subject)
    }
    if (filter?.status) {
      query += ' AND status = ?'
      params.push(filter.status)
    }
    if (filter?.syllabusId) {
      query += ' AND syllabus_id = ?'
      params.push(filter.syllabusId)
    }
    query += ' ORDER BY updated_at DESC'

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params)
    return rows.map((r: any) => ({
      id: r.id,
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
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
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
    const row = this.db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(username) as any
    if (!row) return null
    return {
      id: row.id,
      username: row.username,
      displayName: row.display_name,
      passwordHash: row.password_hash,
      salt: row.salt,
      role: row.role as UserRole,
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
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  listUsers(): Omit<DbUser, 'passwordHash' | 'salt'>[] {
    if (!this.db) return []
    const rows = this.db.prepare('SELECT id, username, display_name, role, created_at, updated_at FROM users ORDER BY created_at ASC').all() as any[]
    return rows.map(r => ({
      id: r.id,
      username: r.username,
      displayName: r.display_name,
      role: r.role as UserRole,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }))
  }

  insertUser(user: DbUser): void {
    if (!this.db) return
    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, display_name, password_hash, salt, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      user.id,
      user.username,
      user.displayName,
      user.passwordHash,
      user.salt,
      user.role,
      user.createdAt,
      user.updatedAt
    )
  }

  updateUser(id: string, updates: { displayName?: string; role?: UserRole; passwordHash?: string; salt?: string }): void {
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

    if (fields.length === 0) return

    fields.push('updated_at = ?')
    values.push(new Date().toISOString())
    values.push(id)

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
    this.db.prepare(query).run(...values)
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
        u.id, u.username, u.display_name, u.password_hash, u.salt, u.role, u.created_at as user_created_at, u.updated_at
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
        createdAt: row.user_created_at,
        updatedAt: row.updated_at,
      },
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
}

export const database = new CoreForgeDatabase()
