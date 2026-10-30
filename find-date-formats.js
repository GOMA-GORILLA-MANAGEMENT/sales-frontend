// This script helps find all places where dates are formatted and need to be updated
// Run this with: node find-date-formats.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findFiles(dir, extensions = ['.jsx', '.js']) {
  let files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.includes(path.extname(item))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function findDateFormats(files) {
  const patterns = [
    /new Date\([^)]+\)\.toLocaleDateString\(\)/g,
    /new Date\([^)]+\)\.toLocaleString\(\)/g,
    /\.toLocaleDateString\(\)/g,
    /\.toLocaleString\(\)/g
  ];
  
  const results = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          results.push({
            file,
            pattern: pattern.toString(),
            matches: matches.length,
            lines: content.split('\n').map((line, index) => 
              pattern.test(line) ? { line: index + 1, content: line.trim() } : null
            ).filter(Boolean)
          });
        }
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }
  
  return results;
}

const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir);
const results = findDateFormats(files);

console.log('=== Date Formatting Patterns Found ===\n');

for (const result of results) {
  console.log(`📁 File: ${result.file}`);
  console.log(`🔍 Pattern: ${result.pattern}`);
  console.log(`📊 Matches: ${result.matches}`);
  
  if (result.lines && result.lines.length > 0) {
    console.log('📍 Lines:');
    result.lines.forEach(line => {
      console.log(`   Line ${line.line}: ${line.content}`);
    });
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
}

if (results.length === 0) {
  console.log('✅ No date formatting patterns found that need updating!');
}

console.log('\n📝 To update these files:');
console.log('1. Import: import { formatDateWithTimezone } from "../../utils/helpers";');
console.log('2. Replace: new Date(dateString).toLocaleDateString()');
console.log('   With: formatDateWithTimezone(dateString, { year: "numeric", month: "short", day: "numeric" })');
