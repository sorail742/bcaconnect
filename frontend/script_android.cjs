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
    // Avatars: force Android compliance (rounded-full and object-cover completely filling the container)
    { regex: /rounded-\[10px\](.*?)bg-foreground\/\[0\.03\](.*?)<img(.*?)className="size-6 object-cover"/gs, val: "rounded-full overflow-hidden border border-foreground/[0.05] $1bg-foreground/[0.03]$2<img$3className=\"w-full h-full object-cover\"" },
    { regex: /rounded-xl(.*?)<img(.*?)className="w-full h-full object-cover"/gs, val: "rounded-full overflow-hidden border border-foreground/[0.05]$1<img$2className=\"w-full h-full object-cover\"" },
    
    // Grid Mobile fix globally (change grid-cols-2 to grid-cols-1 sm:grid-cols-2 to prevent mobile clipping width)
    { regex: /className="grid grid-cols-2 md:grid-cols-4/g, val: "className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" },
    { regex: /className="grid grid-cols-2 lg:grid-cols-4/g, val: "className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" },
];

const targetDirs = [
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\admin',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\vendor',
    'c:\\Users\\keith\\bcaconnect\\frontend\\src\\pages\\bank',
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
                    console.log(`Applied Android Forms & Responsive Widths in: ${file}`);
                }
            });
        });
    }
});
