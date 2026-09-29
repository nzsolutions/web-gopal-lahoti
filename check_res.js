const fs = require('fs');

function getMp4Resolution(filePath) {
  const buf = fs.readFileSync(filePath);
  // search for "tkhd"
  const tkhdIdx = buf.indexOf(Buffer.from('tkhd'));
  if (tkhdIdx !== -1) {
    // width and height are at tkhdIdx + 76 and + 80 in 16.16 fixed point
    const w = buf.readUInt32BE(tkhdIdx + 76) >> 16;
    const h = buf.readUInt32BE(tkhdIdx + 80) >> 16;
    return { w, h };
  }
  return { w: 0, h: 0 };
}

const dir = 'public/assets/videos/';
fs.readdirSync(dir).forEach(f => {
  if (f.endsWith('.mp4')) {
    const res = getMp4Resolution(dir + f);
    console.log(f, `${res.w}x${res.h}`);
  }
});
