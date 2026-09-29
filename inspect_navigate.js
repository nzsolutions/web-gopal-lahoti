const fs = require('fs');
const content = fs.readFileSync('b898392.js', 'utf8');
let idx = content.indexOf('navigate:function');
if (idx === -1) idx = content.indexOf('navigate(');
if (idx === -1) idx = content.indexOf('navigate =');
console.log('Navigate search:', idx);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 2500));
}
