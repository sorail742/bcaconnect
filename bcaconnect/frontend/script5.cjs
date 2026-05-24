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
    // Extremely tight gaps reflecting VEiD reference
    { regex: /gap-6/g, val: "gap-4" },
    { regex: /gap-5/g, val: "gap-3" },
    { regex: /p-6/g, val: "p-4" },
    { regex: /p-5/g, val: "p-4" },

    // Typography (Match reference: main numbers text-lg/xl, subtitles text-xs/sm)
    { regex: /text-3xl/g, val: "text-xl" },
    { regex: /text-2xl/g, val: "text-lg" },
    { regex: /text-xl/g, val: "text-[16px]" },
    { regex: /text-lg/g, val: "text-sm" },
    { regex: /text-\[11px\]/g, val: "text-[10px]" },

    // Skeleton/Grid Heights
    { regex: /h-28/g, val: "h-24" }, // Make node grids slightly shorter
    { regex: /size-9/g, val: "size-8" },
    { regex: /size-8/g, val: "size-6" },
];

const targetDirs = [
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\admin',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\vendor',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\bank',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\dashboard'
];

targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        walk(dir, (err, files) => {
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
                    console.log(`VEiD Dense Scale in: ${file}`);
                }
            });
        });
    }
});
