const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let count = 0;
walkDir('./src', function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    let original = content;

    // Fix page headers with p-5 or p-4 and bg-white / bg-card
    const regex1 = /className="([^"]*)flex justify-between items-center ([^"]*p-[45][^"]*)"/g;
    content = content.replace(regex1, (match, p1, p2) => {
        if (match.includes('sm:flex-row') || match.includes('md:flex-row')) return match;
        return `className="${p1}flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${p2}"`;
    });
    
    // Fix page headers where bg-white is before flex
    const regex1b = /className="([^"]*p-[45][^"]*)flex justify-between items-center([^"]*)"/g;
    content = content.replace(regex1b, (match, p1, p2) => {
        if (match.includes('sm:flex-row') || match.includes('md:flex-row')) return match;
        return `className="${p1}flex flex-col md:flex-row justify-between items-start md:items-center gap-4${p2}"`;
    });

    // Fix search bars with fixed widths
    content = content.replace(/w-\[300px\]/g, 'w-full md:w-[300px]');
    content = content.replace(/w-\[250px\]/g, 'w-full md:w-[250px]');
    content = content.replace(/w-\[400px\]/g, 'w-full md:w-[400px]');

    if (original !== content) {
      fs.writeFileSync(filePath, content);
      count++;
    }
  }
});
console.log('Updated ' + count + ' files.');
