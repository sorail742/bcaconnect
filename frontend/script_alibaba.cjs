const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
    let results = [];
    fs.readdir(dir, (err, list) => {
        if (err) return done(err);
        let i = 0;
        (function next() {
            let file = list[i++];
            if (!file) return done(null, results);
            file = path.resolve(dir, file);
            fs.stat(file, (err, stat) => {
                if (stat && stat.isDirectory()) {
                    walk(file, (err, res) => {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    if (file.endsWith('.jsx')) {
                        results.push(file);
                    }
                    next();
                }
            });
        })();
    });
};

const replacements = [
    // Massive Hero/Section titles
    { regex: /className="([^"]*)text-7xl([^"]*)font-black([^"]*)uppercase([^"]*)"/g, val: "className=\"$1text-4xl md:text-5xl$2font-semibold$3$4\"" },
    { regex: /className="([^"]*)text-4xl([^"]*)font-black([^"]*)uppercase([^"]*)"/g, val: "className=\"$1text-2xl md:text-3xl$2font-semibold$3$4\"" },
    
    // Removing aggressive font-black for standard eCommerce card subtitles
    { regex: /font-black text-\[11px\] uppercase tracking-\[0\.[^]*?em\]/g, val: "font-medium text-xs text-muted-foreground" },
    { regex: /font-black text-\[12px\] uppercase tracking-\[0\.[^]*?em\]/g, val: "font-medium text-sm text-muted-foreground" },
    { regex: /font-black uppercase tracking-tighter/g, val: "font-semibold tracking-tight" },
    { regex: /font-black uppercase tracking-\[0\.2em\]/g, val: "font-semibold" },
    { regex: /tracking-\[0\.[0-9]em\]/g, val: "" },
    { regex: /tracking-\[1em\]/g, val: "" },
    
    // De-sci-fi the shadows
    { regex: /shadow-6xl/g, val: "shadow-md" },
    { regex: /shadow-glow/g, val: "shadow-sm" },
    { regex: /active-press/g, val: "" },

    // Reduce standard big texts
    { regex: /\btext-3xl\b \bfont-black\b/g, val: "text-xl font-semibold" },
    
    // Make uppercase conditional mostly off
    { regex: /\b!uppercase\b/g, val: "" },
];

const targetDirs = [
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\components\\landing',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\components\\layout',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages',
];

targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        walk(dir, (err, files) => {
            if (err) throw err;
            files.forEach(file => {
                let content = fs.readFileSync(file, 'utf8');
                let originalContent = content;
                
                replacements.forEach(rep => {
                    content = content.replace(rep.regex, rep.val);
                });
                
                // Extra global sweep: just remove `font-black text-xl uppercase` style completely
                content = content.replace(/font-black text-foreground text-lg tracking-tight hover:text-primary transition-colors line-clamp-2 italic leading-tight uppercase/g, "font-semibold text-foreground text-sm line-clamp-2");

                if (content !== originalContent) {
                    fs.writeFileSync(file, content, 'utf8');
                    console.log(`Softened aesthetic in: ${file}`);
                }
            });
        });
    }
});
