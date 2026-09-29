const fs = require('fs');

['7c8695f.js', '2158b5b.js', 'b898392.js', '1b2d695.js'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('rooms-intro-leave') || content.includes('navigateFirst') || content.includes('rooms__content-door')) {
    console.log('Found in', file);
    let idx = content.indexOf('rooms-intro-leave');
    if (idx !== -1) console.log(content.slice(idx - 100, idx + 400));
  }
});
