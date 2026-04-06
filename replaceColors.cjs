const fs = require('fs');
const path = require('path');

const filesToUpdate = ['src/App.tsx', 'src/components/LoadingScreen.tsx'];

const replacements = [
  { regex: /#FF6B6B/g, replacement: 'var(--primary)' },
  { regex: /#ef5a5a/g, replacement: 'var(--primary-hover)' },
  { regex: /#FFE8E8/g, replacement: 'var(--primary-light)' },
  { regex: /#FFF0F0/g, replacement: 'var(--primary-lighter)' },
  { regex: /#FF8E8E/g, replacement: 'var(--primary-gradient-end)' },
  { regex: /#111111/g, replacement: 'var(--text-main)' },
  { regex: /#444444/g, replacement: 'var(--text-secondary)' },
  { regex: /#666666/g, replacement: 'var(--text-secondary)' },
  { regex: /#999999/g, replacement: 'var(--text-muted)' },
  { regex: /#EEEEEE/g, replacement: 'var(--border-main)' },
  { regex: /#E5E7EB/g, replacement: 'var(--border-main)' },
  { regex: /#F7F7F9/g, replacement: 'var(--bg-input)' },
  { regex: /#F1F3F5/g, replacement: 'var(--bg-muted)' },
  { regex: /bg-\[#FFFFFF\]/g, replacement: 'bg-[var(--bg-card)]' },
  { regex: /bg-white/g, replacement: 'bg-[var(--bg-card)]' },
  { regex: /text-white/g, replacement: 'text-[var(--bg-main)]' },
  { regex: /bg-slate-50/g, replacement: 'bg-[var(--bg-input)]' },
  { regex: /border-slate-100/g, replacement: 'border-[var(--border-main)]' },
  { regex: /text-slate-500/g, replacement: 'text-[var(--text-secondary)]' },
  { regex: /bg-slate-100/g, replacement: 'bg-[var(--bg-muted)]' },
  { regex: /border-slate-200/g, replacement: 'border-[var(--border-main)]' },
  { regex: /text-slate-400/g, replacement: 'text-[var(--text-muted)]' },
  { regex: /#050505/g, replacement: 'var(--bg-main)' },
  { regex: /#333333/g, replacement: 'var(--bg-muted)' }
];

filesToUpdate.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(({ regex, replacement }) => {
      content = content.replace(regex, replacement);
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
