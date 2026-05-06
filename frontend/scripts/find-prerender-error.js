const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '..', 'node_modules', 'next');
const distDir = path.join(nextDir, 'dist');

function findFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findFiles(fullPath, results);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = findFiles(distDir);
console.log('Found', files.length, 'files in next/dist');

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('Export encountered an error')) {
    console.log('Found in:', file);
  }
}
