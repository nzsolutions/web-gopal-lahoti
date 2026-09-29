const fs = require('fs');
const content = fs.readFileSync('9e62187.js', 'utf8');
let idx = content.indexOf('var v=');
if (idx === -1) idx = content.indexOf('v=');
console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 300)));
