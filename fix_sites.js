const fs = require('fs');

let content = fs.readFileSync('src/pages/unnathi/SitesList.tsx', 'utf8');

// Replace the td block for status
content = content.replace(
  /<td className="px-6 py-4 whitespace-nowrap">[\s\S]*?<span className=\{`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \$\{[\s\S]*?company\.status === 'Active' \? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'[\s\S]*?\}`\} >[\s\S]*?\{company\.status\}[\s\S]*?<\/span>[\s\S]*?<\/td>/,
  ''
);

// Fallback simpler regex if above fails
content = content.replace(
  /<td className="px-6 py-4 whitespace-nowrap">\s*<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \$\{\s*company\.status === 'Active' \? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'\s*\}`}>\s*\{company\.status\}\s*<\/span>\s*<\/td>/,
  ''
);

fs.writeFileSync('src/pages/unnathi/SitesList.tsx', content);
