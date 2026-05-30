# m3u8-streaming

[![npm version](https://badge.fury.io/js/m3u8-streaming.svg)](https://www.npmjs.com/package/m3u8-streaming)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/m3u8-streaming.svg)](https://nodejs.org)

Advanced M3U8 playlist parser for HLS streaming with filtering, resolution options, and metadata extraction.

## Features

- 🚀 **Simple API** - Easy to use with sensible defaults
- 🎯 **Resolution Filtering** - Filter streams by minimum resolution
- 📊 **Bitrate Selection** - Automatically select highest/lowest bitrate streams
- 🔗 **URL Resolution** - Resolve relative URLs with base URL support
- 📝 **Metadata Extraction** - Extract encryption keys, date ranges, and more
- 🛡️ **Error Handling** - Graceful fallbacks with optional strict mode
- 🔍 **Verbose Logging** - Debug parsing issues easily
- ⚡ **Lightweight** - Minimal dependencies

## Installation

```bash
npm install m3u8-streaming
```
## Quick start
```js
const parseM3U8 = require('m3u8-streaming');

const playlist = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=640x360
http://example.com/low.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=4000000,RESOLUTION=1280x720
http://example.com/high.m3u8`;

const streams = parseM3U8(playlist);
console.log(streams);
// Output: Array of stream objects with URL and metadata
```
## HD only stream 
```js
const hdStreams = parseM3U8(playlist, {
  filterByResolution: true,
  minResolution: { width: 1280, height: 720 }
});
```
## Best Quality stream
```js
const best = parseM3U8(playlist, {
  preferHighestBitrate: true,
  outputFormat: 'object'
});
```
## Custom Filter
```js
const lowBandwidth = parseM3U8(playlist, {
  filterStream: (stream) => (stream.BANDWIDTH || 0) < 2000000
});
```
## Relative URLs
```js
const streams = parseM3U8(playlist, {
  baseUrl: 'https://cdn.example.com/',
  includeRelativeUrls: true
});
```
## Complate Metadata
```js
const detailed = parseM3U8(playlist, {
  includeKeys: true,
  includeMap: true,
  verbose: true
});
```
## Helper Function
```js
const parseM3U8 = require('m3u8-streaming');

// Parse resolution string
const res = parseM3U8.parseResolution('1920x1080');
// => { width: 1920, height: 1080 }

// Parse byte range
const range = parseM3U8.parseByteRange('123456@456');
// => { length: 123456, offset: 456 }

// Resolve URL
const url = parseM3U8.resolveUrl('https://example.com/', 'video.m3u8');
// => 'https://example.com/video.m3u8'
```
## Real-Worled Example
```js
const parseM3U8 = require('m3u8-streaming');

// Adaptive bitrate selection
function selectStream(playlist, availableBandwidth) {
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

// Usage
const stream = selectStream(playlist, 2500000); // 2.5 Mbps
console.log(`Playing: ${stream.url}`);
```
## Api Docs

