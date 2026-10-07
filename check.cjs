const fs = require('fs');
const parser = require('@babel/parser');

try {
  const code = fs.readFileSync('src/pages/radiologist/AdvancedReporting.tsx', 'utf8');
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  console.log('No syntax errors found');
} catch (e) {
  console.error(e.message);
  console.error(`Line: ${e.loc?.line}, Column: ${e.loc?.column}`);
}
