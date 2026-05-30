const m3u8 = require('./index');

// Sample M3U8 playlist
const samplePlaylist = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=640x360
http://example.com/low.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=842x480
http://example.com/mid.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=4000000,RESOLUTION=1280x720
http://example.com/high.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=8000000,RESOLUTION=1920x1080
http://example.com/fhd.m3u8`;

// Test 1: Basic parsing
console.log('=== Basic Parsing ===');
const basic = m3u8(samplePlaylist);
console.log(basic.map(s => ({ url: s.url, bandwidth: s.BANDWIDTH })));

// Test 2: Filter by resolution (HD only)
console.log('\n=== HD Only (720p+) ===');
const hdStreams = m3u8(samplePlaylist, {
  filterByResolution: true,
  minResolution: { width: 1280, height: 720 }
});
console.log(hdStreams.map(s => ({ 
  url: s.url, 
  resolution: s.RESOLUTION,
  bandwidth: s.BANDWIDTH 
})));

// Test 3: Highest bitrate only
console.log('\n=== Best Quality ===');
const best = m3u8(samplePlaylist, {
  preferHighestBitrate: true,
  outputFormat: 'object'
});
console.log(best);

// Test 4: With base URL
console.log('\n=== With Base URL ===');
const relativePlaylist = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1500000
low.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=4000000
high.m3u8`;
const withBase = m3u8(relativePlaylist, {
  baseUrl: 'https://cdn.example.com/videos/',
  includeRelativeUrls: true
});
console.log(withBase.map(s => s.url));

// Test 5: Verbose mode
console.log('\n=== Verbose Mode ===');
const verbose = m3u8(samplePlaylist, {
  verbose: true,
  filterByResolution: true,
  minResolution: { width: 1920, height: 1080 }
});
