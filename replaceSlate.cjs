const fs = require('fs');
const path = require('path');

const filesToUpdate = ['src/App.tsx', 'src/components/SajuVisuals.tsx'];

const replacements = [
  { regex: /text-slate-800/g, replacement: 'text-[var(--text-main)]' },
  { regex: /text-slate-900/g, replacement: 'text-[var(--text-main)]' },
  { regex: /text-slate-600/g, replacement: 'text-[var(--text-secondary)]' },
  { regex: /text-slate-700/g, replacement: 'text-[var(--text-secondary)]' },
  { regex: /text-slate-400/g, replacement: 'text-[var(--text-muted)]' },
  { regex: /text-slate-500/g, replacement: 'text-[var(--text-muted)]' },
  { regex: /text-slate-200/g, replacement: 'text-[var(--bg-muted)]' },
  { regex: /bg-slate-50/g, replacement: 'bg-[var(--bg-input)]' },
  { regex: /bg-slate-100/g, replacement: 'bg-[var(--bg-muted)]' },
  { regex: /bg-slate-200/g, replacement: 'bg-[var(--border-main)]' },
  { regex: /bg-slate-700/g, replacement: 'bg-[var(--text-secondary)]' },
  { regex: /bg-slate-800/g, replacement: 'bg-[var(--text-main)]' },
  { regex: /bg-slate-900/g, replacement: 'bg-[var(--text-main)]' },
  { regex: /border-slate-100/g, replacement: 'border-[var(--border-main)]' },
  { regex: /border-slate-200/g, replacement: 'border-[var(--border-main)]' },
  { regex: /border-t-slate-800/g, replacement: 'border-t-[var(--text-main)]' },
  { regex: /hover:bg-slate-200/g, replacement: 'hover:bg-[var(--border-main)]' },
  { regex: /hover:bg-slate-800/g, replacement: 'hover:bg-[var(--text-secondary)]' }
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
