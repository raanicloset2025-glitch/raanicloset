const fs = require('fs');
let content = fs.readFileSync('src/components/LuxuryFooter.tsx', 'utf8');
content = content.replace('href={\"tel:${adminStore.contactPhone || '+91 141 256 7890'}"}', 'href={\	el:${adminStore.contactPhone || '+91 141 256 7890'}\}');
content = content.replace('href={\"tel:{adminStore.contactPhone || '+91 141 256 7890'}\"}', 'href={\	el:{adminStore.contactPhone || '+91 141 256 7890'}\}');
content = content.replace('href="mailto:{adminStore.supportEmail || "concierge@raanicloset.com"}"', 'href={\mailto:{adminStore.supportEmail || 'concierge@raanicloset.com'}\}');
fs.writeFileSync('src/components/LuxuryFooter.tsx', content);
