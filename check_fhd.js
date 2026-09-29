const fs = require('fs');
const path = require('path');

const dir = 'lahoti content/FHD';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp4'));

console.log('FHD files:', files);
