const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');
const walk = (d) => {
  let res = [];
  if (!fs.existsSync(d)) return res;
  fs.readdirSync(d).forEach(f => {
    let p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) res = res.concat(walk(p));
    else if (p.endsWith('.js') || p.endsWith('.jsx')) res.push(p);
  });
  return res;
};

walk(dir).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // This cleans up the messy double-nesting created by previous script runs
  content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| `\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| (.*?)\}`\}/g, '${process.env.NEXT_PUBLIC_API_URL || $1}');
  content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL \|\| `\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| (.*?)\}`/g, 'process.env.NEXT_PUBLIC_API_URL || $1');
  
  // Clean up even deeper nesting if any
  content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| (.*?)\}/g, (match, inner) => {
    if (inner.includes('process.env.NEXT_PUBLIC_API_URL')) {
        // Extract the actual value part
        const valueMatch = inner.match(/['"](.*?)['"]/);
        const value = valueMatch ? valueMatch[0] : '"http://localhost:5000"';
        return `\${process.env.NEXT_PUBLIC_API_URL || ${value}}`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Cleaned: ${file}`);
  }
});
