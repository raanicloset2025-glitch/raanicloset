const fs = require('fs');
let content = fs.readFileSync('src/components/NavbarWrapper.tsx', 'utf8');
content = content.replace(/\\f/g, 'f');
content = content.replace(/\x0c/g, 'f');
fs.writeFileSync('src/components/NavbarWrapper.tsx', content);
let content2 = fs.readFileSync('src/app/product/[id]/page.tsx', 'utf8');
content2 = content2.replace(/\\m/g, 'm');
content2 = content2.replace(/\x0c/g, 'm');
fs.writeFileSync('src/app/product/[id]/page.tsx', content2);
