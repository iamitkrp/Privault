const fs = require('fs');
const file = 'c:/Users/Amit/Desktop/privault/Privault/app/(main)/settings/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/bg-\[#0a0a0a\]/g, 'bg-bg-secondary');
data = data.replace(/bg-\[#111\]/g, 'bg-bg-tertiary');
data = data.replace(/bg-\[#050505\]/g, 'bg-background');
data = data.replace(/border-\[#222\]/g, 'border-border');
data = data.replace(/border-\[#333\]/g, 'border-border-secondary');

data = data.replace(/bg-\[#ff4500\]/g, 'bg-success');
data = data.replace(/text-\[#ff4500\]/g, 'text-success');
data = data.replace(/border-\[#ff4500\]\/20/g, 'border-success/20');
data = data.replace(/border-\[#ff4500\]\/10/g, 'border-success/10');
data = data.replace(/border-\[#ff4500\]/g, 'border-success');
data = data.replace(/bg-\[#ff4500\]\/10/g, 'bg-success/10');
data = data.replace(/focus:ring-\[#ff4500\]/g, 'focus:ring-success');
data = data.replace(/focus:border-\[#ff4500\]/g, 'focus:border-success');
data = data.replace(/shadow-\[0_0_15px_rgba\(255,69,0,0\.4\)\]/g, 'shadow-[0_0_15px_rgba(var(--success),0.4)]');

data = data.replace(/text-white/g, 'text-foreground');
data = data.replace(/bg-white\b/g, 'bg-foreground');
data = data.replace(/text-black/g, 'text-background');
data = data.replace(/hover:bg-gray-200/g, 'hover:opacity-90');

data = data.replace(/text-gray-400/g, 'text-fg-secondary');
data = data.replace(/text-gray-500/g, 'text-fg-muted');

data = data.replace(/text-orange-400/g, 'text-warning');
data = data.replace(/bg-orange-400\/5/g, 'bg-warning/5');
data = data.replace(/border-orange-400\/20/g, 'border-warning/20');
data = data.replace(/bg-orange-400/g, 'bg-warning');
data = data.replace(/hover:bg-orange-300/g, 'hover:bg-warning/80');

data = data.replace(/text-red-500/g, 'text-error');
data = data.replace(/bg-red-500\/5/g, 'bg-error/5');
data = data.replace(/bg-red-500\/10/g, 'bg-error/10');
data = data.replace(/bg-red-500/g, 'bg-error');
data = data.replace(/border-red-500\/10/g, 'border-error/10');
data = data.replace(/border-red-500\/20/g, 'border-error/20');
data = data.replace(/border-red-500\/30/g, 'border-error/30');
data = data.replace(/border-red-500/g, 'border-error');
data = data.replace(/focus:ring-red-500/g, 'focus:ring-error');
data = data.replace(/focus:border-red-500/g, 'focus:border-error');
data = data.replace(/hover:bg-red-500\/20/g, 'hover:bg-error/20');
data = data.replace(/hover:text-red-300/g, 'hover:text-error/80');
data = data.replace(/text-red-400/g, 'text-error/80');
data = data.replace(/bg-red-950\/20/g, 'bg-error/10');
data = data.replace(/hover:bg-red-600/g, 'hover:bg-error/90');

data = data.replace(/bg-white\/5/g, 'bg-foreground/5');
data = data.replace(/hover:bg-white\/10/g, 'hover:bg-foreground/10');
data = data.replace(/hover:bg-white\/5/g, 'hover:bg-foreground/5');

fs.writeFileSync(file, data);
console.log('Done');
