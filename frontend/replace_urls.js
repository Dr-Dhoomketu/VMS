const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');
const walk = (d) => {
  let res = [];
  fs.readdirSync(d).forEach(f => {
    let p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) res = res.concat(walk(p));
    else if (p.endsWith('.js') || p.endsWith('.jsx')) res.push(p);
  });
  return res;
};

walk(dir).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Replace string literals with template literals containing the env var
  let newContent = content.replace(/['"`]http:\/\/localhost:5000(.*?)['"`]/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}$1`');
  
  // Also fix socket.io connection in utils/socket.js
  if (file.endsWith('socket.js')) {
    newContent = newContent.replace(/io\(['"`]http:\/\/localhost:5000['"`]/g, 'io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"');
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
});
