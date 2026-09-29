const fs = require('fs');
const content = fs.readFileSync('9e62187.js', 'utf8');
let idx = content.indexOf('.navigate(');
if (idx !== -1) {
  console.log(content.slice(idx - 200, idx + 300));
} else {
  console.log('not found');
}
