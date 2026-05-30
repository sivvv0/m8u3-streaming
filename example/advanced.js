const parseM3U8 = require('../index.js');

const complexPlaylist = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=640x360,CODECS="avc1.42001e,mp4a.40.2"
http://example.com/low.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=842x480,CODECS="avc1.4d401f,mp4a.40.2"
http://example.com/mid.m3u8
#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key.bin"
#EXT-X-STREAM-INF:BANDWIDTH=4000000,RESOLUTION=1280x720,CODECS="avc1.4d401f,mp4a.40.2"
http://example.com/high.m3u8`;

console.log('=== Advanced Features ===\n');

// Example 1: Extract encryption keys
console.log('1. With encryption keys:');
const withKeys = parseM3U8(complexPlaylist, {
  includeKeys: true,
  verbose: true
});
if (withKeys[0]?.key) {
  console.log(`   Key method: ${withKeys[0].key.METHOD}`);
  console.log(`   Key URI: ${withKeys[0].key.URI}`);
}

// Example 2: Custom filtering by codec
console.log('\n2. Filter by codec (avc1.4d401f):');
const byCodec = parseM3U8(complexPlaylist, {
  filterStream: (stream) => stream.CODECS?.includes('avc1.4d401f')
});
byCodec.forEach(stream => {
  console.log(`   ${stream.RESOLUTION} - ${stream.CODECS}`);
});

// Example 3: Bandwidth-aware selection
console.log('\n3. Bandwidth-aware selection (2.5 Mbps):');
function selectForBandwidth(playlist, availableBandwidth) {
  const streams = parseM3U8(playlist);
  let selected = streams[0];
  for (const stream of streams) {
    if (stream.BANDWIDTH <= availableBandwidth) {
      selected = stream;
    } else {
      break;
    }
  }
  return selected;
}
const selected = selectForBandwidth(complexPlaylist, 2500000);
console.log(`   Selected: ${selected.RESOLUTION} at ${selected.BANDWIDTH} bps`);
