const fs = require('fs');
const content = fs.readFileSync('b898392.js', 'utf8');
let idx = content.indexOf('key:"navigate"');
console.log('key:"navigate" found at:', idx);
if (idx !== -1) {
  console.log(content.slice(idx - 100, idx + 2500));
}
