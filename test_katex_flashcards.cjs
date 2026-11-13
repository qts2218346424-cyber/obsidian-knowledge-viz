const fs = require('fs');
const content = fs.readFileSync('./server/data/mathFlashcards.ts', 'utf8');
const cardMatches = content.match(/\{[\s\S]*?id:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"][^'"]*三大抽样分布[\s\S]*?\n  \},/g);
if (cardMatches) {
  cardMatches.forEach((c, i) => console.log('=== CARD', i+1, '===\n', c));
}
