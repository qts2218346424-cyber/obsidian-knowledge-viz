import crypto from 'node:crypto'

/**
 * 基于 Node.js 原生 crypto.scrypt 的高强度密码哈希计算
 */
export function hashPassword(
  password: string,
  salt = crypto.randomBytes(16).toString('hex')
): Promise<{ hash: string; salt: string }> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err)
      resolve({ hash: derivedKey.toString('hex'), salt })
    })
  })
}

/**
 * 恒定时间密码比对，杜绝时序侧信道反推风险
 */
export async function verifyPassword(
  password: string,
  hash: string,
  salt: string
): Promise<boolean> {
  try {
    const calculated = await hashPassword(password, salt)
    const bufA = Buffer.from(calculated.hash, 'hex')
    const bufB = Buffer.from(hash, 'hex')
    if (bufA.length !== bufB.length) return false
    return crypto.timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

/**
 * 生成 32 字节高强度随机十六进制会话 Token
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * 生成用户唯一 ID
 */
export function generateUserId(): string {
  return 'usr_' + crypto.randomBytes(8).toString('hex')
}
