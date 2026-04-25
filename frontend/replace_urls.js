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
  // Improved regex to replace all localhost:5000 occurrences with the env variable
  let newContent = content.replace(/['"`]http:\/\/localhost:5000(.*?)['"`]/g, (match, p1) => {
    return `\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${p1}`;
  });

  // Since we replaced 'url' with ${env}url, we need to make sure the whole thing is inside backticks ``
  // But wait, the regex above only replaces the string part. 
  // If the code was: fetch('http://localhost:5000/api')
  // It becomes: fetch(`${process.env...}/api`)
  
  // Let's do a safer replacement for common patterns
  newContent = content.replace(/'http:\/\/localhost:5000(.*?)'/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}$1`');
  newContent = newContent.replace(/"http:\/\/localhost:5000(.*?)"/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}$1`');
  newContent = newContent.replace(/`http:\/\/localhost:5000(.*?)`/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}$1`');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated: ${file}`);
  }
});
