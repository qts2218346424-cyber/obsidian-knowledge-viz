const fs = require('fs');
const katex = require('./node_modules/katex');

// 读 mathFlashcards.ts
const code = fs.readFileSync('./server/data/mathFlashcards.ts', 'utf8');

// 读 MarkdownRenderer.tsx
const mrSrc = fs.readFileSync('./src/components/MarkdownRenderer.tsx', 'utf8');

// 提取两个卡片
const c1 = code.match(/id:\s*['"]fc-math-prob-04['"][\s\S]*?back:\s*`([\s\S]*?)`/)[1];
const c2 = code.match(/id:\s*['"]fc-math-prob-sampling-dist['"][\s\S]*?back:\s*`([\s\S]*?)`/)[1];

console.log('Testing c1 (fc-math-prob-04)...');
test(c1);

console.log('Testing c2 (fc-math-prob-sampling-dist)...');
test(c2);

function test(text) {
  // 找所有 $...$ 和 $$...$$
  const matches = [...text.matchAll(/\$\$([\s\S]+?)\$\$|(?<!\$)\$([^\$\n]+?)\$(?!\$)/g)];
  for (const m of matches) {
    const raw = m[1] || m[2];
    const isBlock = Boolean(m[1]);
    try {
      katex.renderToString(raw, { displayMode: isBlock, throwOnError: true });
    } catch (e) {
      console.log(`[KaTeX Error]: ${raw} => ${e.message}`);
    }
  }
}
