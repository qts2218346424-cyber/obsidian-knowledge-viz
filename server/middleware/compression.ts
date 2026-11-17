import zlib from 'zlib'
import type { Request, Response, NextFunction } from 'express'

const COMPRESSIBLE_MIME_RE = /^(?:text\/|application\/(?:json|javascript|manifest\+json|xml|xhtml\+xml)|image\/svg\+xml)/i
const MIN_COMPRESS_BYTES = 1024

/**
 * 零外部依赖的高性能自适应 Brotli / Gzip 压缩中间件
 * - 严格豁免 SSE 流 (text/event-stream)、HTTP 206 分块媒体流与小体积响应
 * - 采用 Brotli quality=4 / Gzip level=6 平衡极低 CPU 延迟与 75%~85% 传输体积缩减
 */
export function adaptiveCompression(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'HEAD' || req.headers['x-no-compression']) {
    next()
    return
  }

  // 豁免 SSE 实时事件流、AI 流式对话与音频 Range 流接口
  if (
    req.headers.accept?.includes('text/event-stream') ||
    req.headers.range ||
    req.path.startsWith('/api/music/stream') ||
    req.path === '/api/local-agents/chat' ||
    req.path === '/api/chat' ||
    req.path.endsWith('/events') ||
    req.path.endsWith('/stream')
  ) {
    next()
    return
  }

  const acceptEncoding = String(req.headers['accept-encoding'] || '')
  const encoding: 'br' | 'gzip' | null = /\bbr\b/.test(acceptEncoding)
    ? 'br'
    : /\bgzip\b/.test(acceptEncoding)
      ? 'gzip'
      : null

  if (!encoding) {
    next()
    return
  }

  const origWrite = res.write.bind(res)
  const origEnd = res.end.bind(res)
  const origOn = res.on.bind(res)
  let decided = false
  let forwardingDrain = false
  let compressor: zlib.BrotliCompress | zlib.Gzip | null = null
  const pendingChunks: { chunk: Buffer; encoding?: BufferEncoding }[] = []
  let bufferedBytes = 0

  origOn('close', () => {
    if (compressor && !compressor.destroyed) {
      compressor.destroy()
    }
  })

  function shouldCompress(): boolean {
    if (res.headersSent) return false
    if (res.statusCode === 204 || res.statusCode === 206 || res.statusCode === 304) return false
    if (res.getHeader('Content-Encoding')) return false
    const contentType = String(res.getHeader('Content-Type') || '')
    if (contentType.includes('text/event-stream')) return false
    return COMPRESSIBLE_MIME_RE.test(contentType)
  }

  function initStream(useCompression: boolean): boolean {
    decided = true
    if (res.headersSent) {
      useCompression = false
    } else {
      res.AppendVarySafe?.()
      const existingVary = String(res.getHeader('Vary') || '')
      if (!existingVary.toLowerCase().includes('accept-encoding')) {
        res.setHeader('Vary', existingVary ? `${existingVary}, Accept-Encoding` : 'Accept-Encoding')
      }
    }

    if (!useCompression) {
      let ok = true
      for (const item of pendingChunks) {
        ok = origWrite(item.chunk)
      }
      pendingChunks.length = 0
      return ok
    }

    if (!res.headersSent) {
      res.removeHeader('Content-Length')
      res.removeHeader('Accept-Ranges')
      const etag = res.getHeader('ETag')
      if (typeof etag === 'string' && !etag.startsWith('W/')) {
        res.setHeader('ETag', `W/${etag}`)
      }
      res.setHeader('Content-Encoding', encoding!)
    }

    compressor =
      encoding === 'br'
        ? zlib.createBrotliCompress({
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
            },
          })
        : zlib.createGzip({ level: 6 })

    compressor.on('data', (chunk: Buffer) => {
      if (origWrite(chunk) === false) {
        compressor?.pause()
      }
    })

    compressor.on('drain', () => {
      forwardingDrain = true
      try {
        res.emit('drain')
      } finally {
        forwardingDrain = false
      }
    })

    origOn('drain', () => {
      if (!forwardingDrain) {
        compressor?.resume()
      }
    })

    compressor.on('end', () => {
      origEnd()
    })

    compressor.on('error', () => {
      origEnd()
    })

    let ok = true
    for (const item of pendingChunks) {
      ok = compressor.write(item.chunk)
    }
    pendingChunks.length = 0
    return ok
  }

  function toBuffer(chunk: any, enc?: BufferEncoding): Buffer | null {
    if (chunk === undefined || chunk === null) return null
    if (Buffer.isBuffer(chunk)) return chunk
    if (chunk instanceof Uint8Array) return Buffer.from(chunk)
    return Buffer.from(String(chunk), enc || 'utf-8')
  }

  ;(res as any).write = function (chunk: any, encOrCb?: any, cb?: any): boolean {
    const enc = typeof encOrCb === 'string' ? (encOrCb as BufferEncoding) : undefined
    const callback = typeof encOrCb === 'function' ? encOrCb : cb

    // 若已探测到是 SSE 流，直接透传不缓冲
    const ct = String(res.getHeader('Content-Type') || '')
    if (!decided && ct.includes('text/event-stream')) {
      initStream(false)
    }

    const buf = toBuffer(chunk, enc)
    if (!buf) {
      return origWrite(chunk, encOrCb, cb)
    }

    if (!decided) {
      pendingChunks.push({ chunk: buf, encoding: enc })
      bufferedBytes += buf.length
      let ok = true
      if (bufferedBytes >= MIN_COMPRESS_BYTES) {
        ok = initStream(shouldCompress())
      }
      if (callback) callback()
      return ok
    }

    if (compressor) {
      return compressor.write(buf, callback)
    }
    return origWrite(buf, callback)
  }

  ;(res as any).end = function (chunk?: any, encOrCb?: any, cb?: any): Response {
    const enc = typeof encOrCb === 'string' ? (encOrCb as BufferEncoding) : undefined
    const callback = typeof encOrCb === 'function' ? encOrCb : cb
    const buf = toBuffer(chunk, enc)

    if (!decided) {
      if (buf) {
        pendingChunks.push({ chunk: buf, encoding: enc })
        bufferedBytes += buf.length
      }
      const canCompress = bufferedBytes >= MIN_COMPRESS_BYTES && shouldCompress()
      initStream(canCompress)
      if (compressor) {
        compressor.end(callback)
        return res
      }
      return origEnd(undefined as any, callback)
    }

    if (compressor) {
      if (buf) compressor.end(buf, callback)
      else compressor.end(callback)
      return res
    }

    if (buf) return origEnd(buf, callback)
    return origEnd(undefined as any, callback)
  }

  next()
}
declare module 'http' {
  interface ServerResponse {
    AppendVarySafe?: () => void
  }
}
