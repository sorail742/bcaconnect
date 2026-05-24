const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'c:\\Users\\keith\\bcaconnect\\frontend\\src');

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
    // Colors
    { regex: /bg-\[#050505\]/g, val: "bg-background" },
    { regex: /bg-\[#0A0A0A\]/g, val: "bg-card" },
    { regex: /bg-\[#0D0D0D\]/g, val: "bg-card" },
    { regex: /bg-\[#000000\]/g, val: "bg-background" },
    { regex: /text-white/g, val: "text-foreground" },
    { regex: /bg-white\/([0-9\.]+)/g, val: "bg-foreground/$1" },
    { regex: /border-white\/([0-9\.]+)/g, val: "border-foreground/$1" },
    { regex: /bg-black\/([0-9\.]+)/g, val: "bg-background/$1" },
    { regex: /text-black/g, val: "text-background" },
    { regex: /text-slate-500/g, val: "text-muted-foreground" },
    { regex: /text-slate-400/g, val: "text-muted-foreground/80" },
    
    // Sizing - Typography
    { regex: /text-\[120px\]/g, val: "text-[70px]" },
    { regex: /text-\[100px\]/g, val: "text-[60px]" },
    { regex: /text-\[80px\]/g, val: "text-[50px]" },
    { regex: /text-\[60px\]/g, val: "text-[48px]" },
    { regex: /text-8xl/g, val: "text-6xl md:text-7xl" },
    { regex: /text-6xl/g, val: "text-5xl" },
    { regex: /text-5xl/g, val: "text-4xl" },
    
    // Sizing - Spacing & Padding
    { regex: /py-48/g, val: "py-32" },
    { regex: /pt-48/g, val: "pt-32" },
    { regex: /mt-48/g, val: "mt-32" },
    { regex: /mb-48/g, val: "mb-32" },
    { regex: /gap-24/g, val: "gap-16" },
    { regex: /gap-16/g, val: "gap-10" },
    { regex: /p-16/g, val: "p-10" },
    { regex: /p-12/g, val: "p-8" },
    
    // Sizing - Border Radius
    { regex: /rounded-\[5rem\]/g, val: "rounded-[3rem]" },
    { regex: /rounded-\[4rem\]/g, val: "rounded-[2.5rem]" },
    { regex: /rounded-\[3\.5rem\]/g, val: "rounded-[2rem]" },
    
    // Sizing - Dimensions
    { regex: /size-40/g, val: "size-28" },
    { regex: /size-32/g, val: "size-24" },
    { regex: /size-24/g, val: "size-16" }
];

walk('c:\\Users\\keith\\bcaconnect\\frontend\\src', (err, files) => {
    if (err) throw err;
    let modifiedFiles = 0;
    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;
        
        replacements.forEach(rep => {
            content = content.replace(rep.regex, rep.val);
        });

        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf8');
            modifiedFiles++;
            console.log(`Modified: ${file}`);
        }
    });
    console.log(`Successfully updated ${modifiedFiles} files.`);
});
