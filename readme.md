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
