const https = require('https');
const fs = require('fs');

const chunks = ['4c0483f.js', '3744fee.js', 'd8f4f45.js', 'd88ca37.js'];

chunks.forEach(c => {
  https.get('https://pasqua.it/_nuxt/' + c, res => {
    let d = '';
    res.on('data', chunk => d += chunk);
    res.on('end', () => {
      fs.writeFileSync(c, d);
      console.log('Downloaded', c, d.length);
      // search for keywords
      if (d.includes('camera') || d.includes('Scene') || d.includes('rooms') || d.includes('wheel') || d.includes('scroll')) {
        console.log('Keywords in', c);
      }
    });
  });
});
