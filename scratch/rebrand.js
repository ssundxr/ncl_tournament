const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '..', 'src'));
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Special case for branding.ts where we want to keep the replacement logic intact, but update it.
  // Currently branding.ts has: .replace(/\bNCL\b/g, "NFL");
  // We want to just remove that, or change it to keep NCL.
  if (file.includes('branding.ts')) {
    content = content.replace(/\.replace\(\/\\bNCL\\b\/g, "NFL"\)/g, '');
  }
  
  const newContent = content.replace(/NFL/g, 'NCL');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changed++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Replaced NFL with NCL in ${changed} files.`);
