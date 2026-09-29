const fs = require('fs');

['b898392.js', '2158b5b.js', '7c8695f.js'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let idx = 0;
  while ((idx = content.indexOf('navigate', idx)) !== -1) {
    const snippet = content.slice(Math.max(0, idx - 40), Math.min(content.length, idx + 200));
    if (snippet.includes('camera') || snippet.includes('scene') || snippet.includes('room') || snippet.includes('mesh') || snippet.includes('gsap') || snippet.includes('timeline')) {
      console.log(`[${file}]`, snippet);
      break;
    }
    idx += 8;
  }
});
