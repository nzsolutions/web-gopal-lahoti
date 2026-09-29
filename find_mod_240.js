const fs = require('fs');

['7c8695f.js', '2158b5b.js', 'b898392.js', '1b2d695.js'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const idx = content.indexOf('240:function');
  const idx2 = content.indexOf('240:(');
  const found = idx !== -1 ? idx : idx2;
  if (found !== -1) {
    console.log('Module 240 in', file);
    console.log(content.slice(found, found + 1200));
  }
});
