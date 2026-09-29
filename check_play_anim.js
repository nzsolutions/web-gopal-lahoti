const fs = require('fs');
const content = fs.readFileSync('b898392.js', 'utf8');
let idx = content.indexOf('playAnimation');
console.log(content.slice(idx - 100, idx + 1500));
