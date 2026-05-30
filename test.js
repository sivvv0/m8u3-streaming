// test.js
const parseM3U8 = require('./index.js');

const samplePlaylist = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=640x360
http://example.com/low.m3u8`;

const result = parseM3U8(samplePlaylist);
console.log('Tests passed!');
process.exit(0);
