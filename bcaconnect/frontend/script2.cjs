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
    // Typography downscale
    { regex: /text-5xl/g, val: "text-4xl" },
    { regex: /text-4xl/g, val: "text-3xl" },
    { regex: /text-3xl/g, val: "text-2xl" },
    { regex: /text-2xl/g, val: "text-xl" },
    
    // Icon downscale
    { regex: /size-20/g, val: "size-14" },
    { regex: /size-16/g, val: "size-12" },
    { regex: /size-14/g, val: "size-10" },

    // Skeleton heights
    { regex: /h-52/g, val: "h-36" },
    
    // Margins / Paddings / Gaps
    { regex: /p-10/g, val: "p-6" },
    { regex: /p-8/g, val: "p-6" },
    { regex: /gap-10/g, val: "gap-6" },
    { regex: /gap-8/g, val: "gap-5" },
    
    // Border Radius
    { regex: /rounded-\[2\.5rem\]/g, val: "rounded-[1.5rem]" },
    { regex: /rounded-\[2rem\]/g, val: "rounded-[1.5rem]" },
    { regex: /rounded-3xl/g, val: "rounded-2xl" }
];

// Target only dashboard and admin pages to not affect landing page size
const targetDirs = [
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\admin',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\vendor',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\bank',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\dashboard',
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
                    console.log(`Tightened UI in: ${file}`);
                }
            });
        });
    }
});
