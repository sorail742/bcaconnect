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
    // Heights
    { regex: /h-28/g, val: "h-20" },
    { regex: /h-24/g, val: "h-16" },
    { regex: /h-20/g, val: "h-14" },
    { regex: /h-16/g, val: "h-12" },
    { regex: /h-14/g, val: "h-11" },
    { regex: /h-36/g, val: "h-28" },
    
    // Widths
    { regex: /w-96/g, val: "w-80" },

    // Padding / Margins / Gaps (Ultra dense)
    { regex: /px-12/g, val: "px-6" },
    { regex: /space-y-16/g, val: "space-y-8" },
    { regex: /space-y-10/g, val: "space-y-6" },
    { regex: /space-y-12/g, val: "space-y-6" },
    { regex: /space-y-8/g, val: "space-y-4" },
    { regex: /pb-32/g, val: "pb-16" },
    { regex: /pb-20/g, val: "pb-10" },
    { regex: /p-8/g, val: "p-6" },
    { regex: /p-6/g, val: "p-5" },
    { regex: /gap-10/g, val: "gap-6" },
    { regex: /gap-8/g, val: "gap-6" },
    { regex: /gap-6/g, val: "gap-4" },
    
    // Iconic sizes
    { regex: /size-14/g, val: "size-10" },
    { regex: /size-12/g, val: "size-9" },
    { regex: /size-10/g, val: "size-8" },
    { regex: /size-8/g, val: "size-6" },
    { regex: /size-7/g, val: "size-5" },
    
    // text adjustments
    { regex: /text-4xl/g, val: "text-3xl" },
    { regex: /text-3xl/g, val: "text-2xl" },
    { regex: /text-2xl/g, val: "text-xl" },
    { regex: /text-xl/g, val: "text-lg" },
    
    // Drop lingering massive radiuses
    { regex: /rounded-3xl/g, val: "rounded-2xl" },
    { regex: /rounded-\[2rem\]/g, val: "rounded-xl" }
];

const targetDirs = [
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\admin',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\vendor',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\bank',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\dashboard',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\components\\layout',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\components\\ui'
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
                    console.log(`Deep scale in: ${file}`);
                }
            });
        });
    }
});
