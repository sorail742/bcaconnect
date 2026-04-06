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
    // Margins / Paddings / Gaps (General final tightening)
    { regex: /p-10/g, val: "p-8" },
    { regex: /py-32/g, val: "py-24" },
    { regex: /pt-32/g, val: "pt-24" },
    { regex: /mt-32/g, val: "mt-24" },
    { regex: /mb-32/g, val: "mb-24" },
    { regex: /gap-16/g, val: "gap-12" },
    
    // Border Radius tightening 
    { regex: /rounded-\[3rem\]/g, val: "rounded-3xl" },
    { regex: /rounded-\[2\.5rem\]/g, val: "rounded-3xl" },
    { regex: /rounded-\[2rem\]/g, val: "rounded-2xl" },
    { regex: /rounded-\[1\.5rem\]/g, val: "rounded-2xl" }
];

const targetDirs = [
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\components'
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
                    console.log(`Polished UI in: ${file}`);
                }
            });
        });
    }
});
