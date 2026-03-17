const fs = require('fs');
let file = 'c:/Users/Amit/Desktop/privault/Privault/app/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/bg-white\/\[0\.02\]/g, 'bg-foreground/[0.02]');
data = data.replace(/bg-white\/\[0\.05\]/g, 'bg-foreground/[0.05]');
data = data.replace(/text-gray-600/g, 'text-fg-muted');
data = data.replace(/group-hover:text-white/g, 'group-hover:text-foreground');
data = data.replace(/hover:text-white/g, 'hover:text-foreground');

fs.writeFileSync(file, data);

// Check if any bg-[# or whatever is left in components and app:
function check(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(f => {
        let fullPath = dir + '/' + f.name;
        if (f.isDirectory()) {
            check(fullPath);
        } else if (f.isFile() && f.name.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.match(/text-white|bg-black|text-black|bg-white\b|bg-\[\#|border-\[\#/)) {
                console.log(fullPath);
            }
        }
    });
}
check('c:/Users/Amit/Desktop/privault/Privault/app');
check('c:/Users/Amit/Desktop/privault/Privault/components');
console.log('Done mapping.');
