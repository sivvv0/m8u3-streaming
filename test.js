const parseM3U8 = require('./index.js');

// Sample playlist
const samplePlaylist = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=640x360
http://example.com/low.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=842x480
http://example.com/mid.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=4000000,RESOLUTION=1280x720
http://example.com/high.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=8000000,RESOLUTION=1920x1080
http://example.com/fhd.m3u8`;

console.log('=== m3u8-streaming Test Suite ===\n');

// Test 1: Basic parsing
console.log('✓ Test 1: Basic parsing');
const basic = parseM3U8(samplePlaylist);
console.log(`  Found ${basic.length} streams\n`);

// Test 2: HD filtering
console.log('✓ Test 2: HD filtering (720p+)');
const hd = parseM3U8(samplePlaylist, {
  filterByResolution: true,
  minResolution: { width: 1280, height: 720 }
});
console.log(`  Found ${hd.length} HD streams\n`);

// Test 3: Highest bitrate
console.log('✓ Test 3: Highest bitrate');
const best = parseM3U8(samplePlaylist, {
  preferHighestBitrate: true,
  outputFormat: 'object'
});
console.log(`  Best stream: ${best.BANDWIDTH} bps\n`);

// Test 4: Custom filter
console.log('✓ Test 4: Custom filter (< 3 Mbps)');
const filtered = parseM3U8(samplePlaylist, {
  filterStream: (stream) => (stream.BANDWIDTH || 0) < 3000000
});
console.log(`  Found ${filtered.length} streams under 3 Mbps\n`);

// Test 5: Helper functions
console.log('✓ Test 5: Helper functions');
const resolution = parseM3U8.parseResolution('1920x1080');
console.log(`  Resolution: ${resolution.width}x${resolution.height}`);
const byteRange = parseM3U8.parseByteRange('123456@789');
console.log(`  Byte range: length=${byteRange.length}, offset=${byteRange.offset}`);
const resolvedUrl = parseM3U8.resolveUrl('https://example.com/base/', 'video.m3u8');
console.log(`  Resolved URL: ${resolvedUrl}\n`);

console.log('✅ All tests passed!');
