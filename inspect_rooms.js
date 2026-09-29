const fs = require('fs');
const html = fs.readFileSync('pasqua.html', 'utf8');

const roomsIdx = html.indexOf('class="rooms"');
if (roomsIdx !== -1) {
  console.log(html.slice(roomsIdx - 100, roomsIdx + 3000));
} else {
  console.log('Not found');
}
