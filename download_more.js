const https = require('https');
const fs = require('fs');

const chunks = ['4970a4e.js', '1b2d695.js', '0b35dab.js', '9e62187.js', '7c8695f.js', '2158b5b.js', 'b898392.js'];

chunks.forEach(c => {
  https.get('https://pasqua.it/_nuxt/' + c, res => {
    let d = '';
    res.on('data', chunk => d += chunk);
    res.on('end', () => {
      fs.writeFileSync(c, d);
      console.log('Downloaded', c, d.length);
      if (d.includes('camera') || d.includes('WebGLRenderer') || d.includes('GLTF') || d.includes('room') || d.includes('transition')) {
        console.log('Match in', c);
      }
    });
  });
});
