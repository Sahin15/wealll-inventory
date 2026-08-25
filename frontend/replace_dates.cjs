const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.jsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('toLocaleDateString()') || content.includes('toLocaleString()')) {
    // Inject import if not exists
    if (!content.includes('import { formatDate } from')) {
      // determine relative path to src/utils/dateFormatter
      const relativePath = path.relative(path.dirname(file), path.join(srcDir, 'utils', 'dateFormatter')).replace(/\\/g, '/');
      const importStatement = `import { formatDate } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}';\n`;
      content = content.replace(/(import.*?\n)(?!import)/s, `$1${importStatement}`);
    }

    // Replace new Date(X).toLocaleDateString() -> formatDate(X)
    content = content.replace(/new Date\((.*?)\)\.toLocaleDateString\(\)/g, 'formatDate($1)');
    
    // Replace new Date(X).toLocaleString() -> formatDate(X, true)
    content = content.replace(/new Date\((.*?)\)\.toLocaleString\(\)/g, 'formatDate($1, true)');

    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
