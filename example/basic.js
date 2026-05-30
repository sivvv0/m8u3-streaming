const parseM3U8 = require('../index.js');

const playlist = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=640x360
http://example.com/low.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=842x480
http://example.com/mid.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=4000000,RESOLUTION=1280x720
http://example.com/high.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=8000000,RESOLUTION=1920x1080
http://example.com/fhd.m3u8`;

console.log('=== Basic Usage Examples ===\n');

// Example 1: Basic parsing
console.log('1. Basic parsing:');
const streams = parseM3U8(playlist);
streams.forEach((stream, i) => {
  console.log(`   ${i + 1}. ${stream.RESOLUTION} - ${stream.BANDWIDTH} bps`);
});

// Example 2: Get highest quality
console.log('\n2. Highest quality stream:');
const best = parseM3U8(playlist, {
  preferHighestBitrate: true,
  outputFormat: 'object'
});
console.log(`   ${best.RESOLUTION} - ${best.BANDWIDTH} bps`);

// Example 3: Filter HD streams
console.log('\n3. HD streams only (720p+):');
const hd = parseM3U8(playlist, {
  filterByResolution: true,
  minResolution: { width: 1280, height: 720 }
});
hd.forEach((stream, i) => {
  console.log(`   ${i + 1}. ${stream.RESOLUTION}`);
});
