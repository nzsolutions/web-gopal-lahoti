const fs = require('fs');
const css = fs.readFileSync('9e62187.js', 'utf8');

// extract CSS strings
const cssMatches = css.match(/\.rooms[^{]*\{[^}]*\}/g) || [];
console.log('CSS classes found:', cssMatches.slice(0, 15));
