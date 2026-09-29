const fs = require('fs');
const html = fs.readFileSync('pasqua.html', 'utf8');

const webglIdx = html.indexOf('webgl');
if (webglIdx !== -1) {
  console.log(html.slice(webglIdx - 100, webglIdx + 1500));
}
