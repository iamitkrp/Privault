const fs = require('fs');

function replaceColors(file) {
    let data = fs.readFileSync(file, 'utf8');

    data = data.replace(/bg-black/g, 'bg-background');
    data = data.replace(/text-white/g, 'text-foreground');
    data = data.replace(/bg-\[#333\]/g, 'bg-bg-secondary');
    data = data.replace(/border-\[#333\]/g, 'border-border-secondary');
    data = data.replace(/border-white\/10/g, 'border-foreground/10');
    data = data.replace(/border-white\/20/g, 'border-foreground/20');
    data = data.replace(/hover:bg-white\/10/g, 'hover:bg-foreground/10');
    data = data.replace(/bg-black\/40/g, 'bg-background/40');
    data = data.replace(/bg-black\/80/g, 'bg-background/80');
    data = data.replace(/text-gray-400/g, 'text-fg-secondary');
    data = data.replace(/text-gray-500/g, 'text-fg-muted');

    fs.writeFileSync(file, data);
}

replaceColors('c:/Users/Amit/Desktop/privault/Privault/app/privacy/page.tsx');
replaceColors('c:/Users/Amit/Desktop/privault/Privault/app/terms/page.tsx');
replaceColors('c:/Users/Amit/Desktop/privault/Privault/app/(auth)/forgot-password/page.tsx');
replaceColors('c:/Users/Amit/Desktop/privault/Privault/app/(auth)/verify-email/page.tsx');
replaceColors('c:/Users/Amit/Desktop/privault/Privault/app/(auth)/layout.tsx');

console.log('Done');
