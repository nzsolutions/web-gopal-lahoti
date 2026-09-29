const fs = require('fs');

['3744fee.js', '9e62187.js', '0b35dab.js'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  console.log('=== Checking', file, '===');
  
  // Find references to "rooms"
  let idx = 0;
  while ((idx = content.indexOf('rooms', idx)) !== -1) {
    console.log(content.slice(Math.max(0, idx - 40), Math.min(content.length, idx + 120)));
    idx += 500;
  }
});
