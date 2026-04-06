const fs = require('fs');
const path = require('path');

const srcPaths = [
    path.join(__dirname, 'src', 'pages'),
    path.join(__dirname, 'src', 'components'),
    path.join(__dirname, 'src', 'layouts'),
];

const LIGHT_DARK_REPLACEMENTS = [
    // Backgrounds
    { regex: /bg-\[\#0A0D14\]/g, replacement: 'bg-slate-50 dark:bg-[#0A0D14]' },
    { regex: /bg-\[\#0F1219\]/g, replacement: 'bg-white dark:bg-[#0F1219]' },
    { regex: /bg-\[\#11141A\]/g, replacement: 'bg-white dark:bg-[#11141A]' },
    { regex: /bg-\[\#11161D\]/g, replacement: 'bg-white dark:bg-[#11161D]' },
    { regex: /bg-\[\#151921\]/g, replacement: 'bg-slate-100 dark:bg-[#151921]' },
    { regex: /bg-\[\#181C25\]/g, replacement: 'bg-slate-200 dark:bg-[#181C25]' },
    // Text colors
    { regex: /\btext-white\b/g, replacement: 'text-slate-900 dark:text-white' },
    { regex: /\btext-slate-400\b/g, replacement: 'text-slate-600 dark:text-slate-400' },
    { regex: /\btext-slate-300\b/g, replacement: 'text-slate-700 dark:text-slate-300' },
    // Borders
    { regex: /border-white\/5/g, replacement: 'border-slate-200 dark:border-white/5' },
    { regex: /border-white\/10/g, replacement: 'border-slate-300 dark:border-white/10' },
    { regex: /border-white\/\[0\.03\]/g, replacement: 'border-transparent dark:border-white/[0.03]' },
    // Glass effects
    { regex: /bg-white\/\[0\.02\]/g, replacement: 'bg-slate-900/[0.02] dark:bg-white/[0.02]' },
    { regex: /bg-white\/\[0\.03\]/g, replacement: 'bg-slate-900/[0.03] dark:bg-white/[0.03]' },
    { regex: /bg-white\/5\b/g, replacement: 'bg-slate-900/5 dark:bg-white/5' },
];

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            for (const { regex, replacement } of LIGHT_DARK_REPLACEMENTS) {
                // To avoid doubling, ensure we don't replace if it's already dark:
                // Simplest way: if the string already has dark:bg-[#0A0D14], we shouldn't replace again.
                // Since this runs once, regex is fine. But let's be careful.
                const matches = content.match(regex);
                if (matches) {
                    content = content.replace(regex, replacement);
                    modified = true;
                }
            }
            if (modified) {
                // Fix any double replacements accidentally created like "dark:bg-slate-50 dark:bg-[#0A0D14]"
                content = content.replace(/dark:bg-slate-(\d+) dark:bg-\[\#[0-9A-F]+\]/g, (match) => {
                    return match.split(' ')[1]; // keep only the dark part if it had a dark prefix
                });
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

srcPaths.forEach(processDirectory);
console.log('✅ Light mode classes injected.');
