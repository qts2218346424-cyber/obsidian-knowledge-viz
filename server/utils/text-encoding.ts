import fs from 'fs'
import zlib from 'zlib'

/**
 * 零外部依赖自适应字符编码解码器
 * 支持 UTF-8 (含/不含 BOM)、UTF-16LE、UTF-16BE、GB18030 / GBK 自动识别与无乱码读取
 */
export function decodeBufferAutoEncoding(buf: Buffer): string {
  if (!buf || buf.length === 0) return ''

  // 1. BOM 显式探测
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.subarray(3).toString('utf8')
  }
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(buf.subarray(2))
  }
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(buf.subarray(2))
  }

  // 2. 严格校验是否为合法 UTF-8 字节流
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true })
    return utf8Decoder.decode(buf)
  } catch {
    // 3. 非 UTF-8 时回退至中文全字符集超集 GB18030（兼容 GBK / GB2312）
    try {
      const gbDecoder = new TextDecoder('gb18030', { fatal: false })
      return gbDecoder.decode(buf)
    } catch {
      return buf.toString('utf8')
    }
  }
}

export function readTextFileAutoEncoding(filePath: string): string {
  const buf = fs.readFileSync(filePath)
  return decodeBufferAutoEncoding(buf)
}

/**
 * 零外部依赖原生提取 .docx (ZIP 容器内 word/document.xml) 纯净段落文本
 * 当宿主未安装 Python markitdown/python-docx 时作为高可靠纯 Node 兜底，彻底杜绝二进制 PK 乱码
 */
export function extractDocxTextNative(filePath: string): string {
  const buf = fs.readFileSync(filePath)
  // ZIP Local File Header Magic: 0x04034b50 ('PK\x03\x04')
  if (buf.length < 30 || buf.readUInt32LE(0) !== 0x04034b50) {
    return ''
  }

  // 从末尾查找 End of Central Directory (EOCD: 0x06054b50)
  let eocdOffset = -1
  const minSearch = Math.max(0, buf.length - 65557)
  for (let i = buf.length - 22; i >= minSearch; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i
      break
    }
  }
  if (eocdOffset === -1) return ''

  const cdEntries = buf.readUInt16LE(eocdOffset + 10)
  const cdOffset = buf.readUInt32LE(eocdOffset + 16)
  let ptr = cdOffset

  for (let idx = 0; idx < cdEntries && ptr + 46 <= buf.length; idx++) {
    if (buf.readUInt32LE(ptr) !== 0x02014b50) break
    const compressionMethod = buf.readUInt16LE(ptr + 10)
    const compressedSize = buf.readUInt32LE(ptr + 20)
    const fileNameLen = buf.readUInt16LE(ptr + 28)
    const extraLen = buf.readUInt16LE(ptr + 30)
    const commentLen = buf.readUInt16LE(ptr + 32)
    const localHeaderOffset = buf.readUInt32LE(ptr + 42)
    const entryName = buf.subarray(ptr + 46, ptr + 46 + fileNameLen).toString('utf8')

    if (entryName === 'word/document.xml' && localHeaderOffset + 30 <= buf.length) {
      const localNameLen = buf.readUInt16LE(localHeaderOffset + 26)
      const localExtraLen = buf.readUInt16LE(localHeaderOffset + 28)
      const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen
      const compressedSlice = buf.subarray(dataStart, dataStart + compressedSize)

      let xmlContent = ''
      if (compressionMethod === 0) {
        xmlContent = compressedSlice.toString('utf8')
      } else if (compressionMethod === 8) {
        xmlContent = zlib.inflateRawSync(compressedSlice).toString('utf8')
      }

      if (xmlContent) {
        return xmlContent
          .replace(/<\/w:p>/gi, '\n')
          .replace(/<w:br[^>]*\/?>/gi, '\n')
          .replace(/<w:tab[^>]*\/?>/gi, '\t')
          .replace(/<\/w:tr>/gi, '\n')
          .replace(/<\/w:tc>/gi, ' | ')
          .replace(/<[^>]+>/g, '')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/[ \t]+\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim()
      }
    }

    ptr += 46 + fileNameLen + extraLen + commentLen
  }

  return ''
}
