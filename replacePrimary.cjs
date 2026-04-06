const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/components/SajuVisuals.tsx');
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/#FF6B6B/g, 'var(--primary)');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated SajuVisuals.tsx`);
}
