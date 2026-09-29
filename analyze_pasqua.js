const fs = require('fs');
const html = fs.readFileSync('pasqua.html', 'utf8');

// Find all script sources
const scriptRegex = /<script[^>]+src=["']([^"']+)["']/g;
let match;
const scripts = [];
while ((match = scriptRegex.exec(html)) !== null) {
  scripts.push(match[1]);
}
console.log('Scripts found:', scripts);

// Check for video or canvas
console.log('Videos:', (html.match(/<video[^>]*>/g) || []).slice(0, 5));
console.log('Canvas:', (html.match(/<canvas[^>]*>/g) || []).slice(0, 5));
console.log('Sections/Hero:', (html.match(/<section[^>]*class=["'][^"']*["']/g) || []).slice(0, 10));

// Find any data attributes or inline scripts with animation keywords
const inlineScripts = html.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g) || [];
console.log('Inline script count:', inlineScripts.length);
inlineScripts.forEach((s, idx) => {
  if (s.includes('three') || s.includes('gsap') || s.includes('scroll') || s.includes('animation') || s.includes('camera')) {
    console.log(`Script ${idx} keywords found:`, s.slice(0, 200));
  }
});
