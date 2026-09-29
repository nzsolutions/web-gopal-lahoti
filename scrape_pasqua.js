const https = require('https');
const fs = require('fs');

https.get('https://pasqua.it/', (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    console.log('Redirect to:', res.headers.location);
  }
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('pasqua.html', data);
    console.log('Saved pasqua.html, length:', data.length);
  });
}).on('error', err => console.error(err));
