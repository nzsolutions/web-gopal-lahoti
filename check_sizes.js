const fs = require('fs');

// We can inspect the mp4 atom or check file sizes
const dir = 'public/assets/videos';
fs.readdirSync(dir).forEach(f => {
  const stat = fs.statSync(dir + '/' + f);
  console.log(f, stat.size);
});
