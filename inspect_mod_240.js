const fs = require('fs');
const content = fs.readFileSync('b898392.js', 'utf8');
const idx = content.indexOf('240:function');
console.log(content.slice(idx, idx + 4000));
