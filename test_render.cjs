const fs = require('fs');

// 提取 MarkdownRenderer 里面的处理函数
const mrSrc = fs.readFileSync('./src/components/MarkdownRenderer.tsx', 'utf8');

// 提取 fc-math-prob-sampling-dist 的 back
const cardSrc = fs.readFileSync('./server/data/mathFlashcards.ts', 'utf8');
const m = cardSrc.match(/id:\s*['"]fc-math-prob-sampling-dist['"][\s\S]*?back:\s*`([\s\S]*?)`/);
if (!m) {
  console.log('Not found card');
  process.exit(1);
}
const backText = m[1];
console.log('Original Back:\n', backText);

// 测试经过 breakInlineSubItems 和 normalizeMathSegments 之后
// 找 MarkdownRenderer 中 normalizedContent 的生成逻辑
console.log('--- Checking where error happens ---');
