'use strict';

const reader = require('m3u8-reader');

const TAG_STREAM = 'STREAM-INF';

/**
 * Parse m3u8 playlist with advanced options
 * @param {string} playlist - M3U8 playlist content
 * @param {Object} options - Configuration options
 * @param {boolean} [options.includeRelativeUrls=false] - Include relative URLs (not just absolute)
 * @param {boolean} [options.includeKeys=false] - Include encryption key information
 * @param {boolean} [options.includeDiscontinuity=false] - Include discontinuity markers
 * @param {boolean} [options.includeMap=false] - Include initialization segment (EXT-X-MAP)
 * @param {boolean} [options.includeDateRange=false] - Include EXT-X-DATERANGE info
 * @param {boolean} [options.includeByteRange=false] - Include byte range info (EXT-X-BYTERANGE)
 * @param {boolean} [options.includeProgramDateTime=false] - Include EXT-X-PROGRAM-DATE-TIME
 * @param {string} [options.baseUrl=''] - Base URL to resolve relative paths
 * @param {boolean} [options.filterByResolution=false] - Filter streams by resolution
 * @param {Object} [options.minResolution={width:0, height:0}] - Minimum resolution filter
 * @param {boolean} [options.preferHighestBitrate=false] - Prefer highest bitrate streams
 * @param {Function} [options.filterStream=null] - Custom filter function for streams
 * @param {string} [options.outputFormat='array'] - Output format: 'array', 'object', or 'single'
 * @param {boolean} [options.strictMode=false] - Throw error on invalid playlists
 * @param {boolean} [options.verbose=false] - Log parsing information
 * @returns {Array|Object|null} Parsed streams based on options
 */
function m3u8(playlist, options = {}) {
  const opts = {
    includeRelativeUrls: false,
    includeKeys: false,
    includeDiscontinuity: false,
    includeMap: false,
    includeDateRange: false,
    includeByteRange: false,
    includeProgramDateTime: false,
    baseUrl: '',
    filterByResolution: false,
    minResolution: { width: 0, height: 0 },
    preferHighestBitrate: false,
    filterStream: null,
    outputFormat: 'array',
    strictMode: false,
    verbose: false,
    ...options
  };

  // Input validation
  if (typeof playlist !== 'string') {
    if (opts.strictMode) {
      throw new TypeError(`Expected Playlist to be a string, got ${typeof playlist}`);
    }
    if (opts.verbose) console.warn(`Warning: Expected playlist to be a string, got ${typeof playlist}`);
    return opts.outputFormat === 'array' ? [] : null;
  }

  if (!playlist.trim()) {
    if (opts.verbose) console.log('Empty playlist provided');
    return opts.outputFormat === 'array' ? [] : null;
  }

  try {
    if (opts.verbose) console.log('Parsing playlist...');
    const parsed = reader(playlist);
    
    let streams = [];
    let currentStreamInfo = null;
    let currentTags = {};
    
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      
      // Track STREAM-INF tags
      if (isValidStreamInfo(item)) {
        currentStreamInfo = { ...item[TAG_STREAM] };
        currentTags = {};
        continue;
      }
      
      // Track additional tags if requested
      if (opts.includeKeys && isTag(item, 'EXT-X-KEY')) {
        currentTags.key = parseTagValue(item, 'EXT-X-KEY');
        continue;
      }
      
      if (opts.includeDiscontinuity && isTag(item, 'EXT-X-DISCONTINUITY')) {
        currentTags.discontinuity = true;
        continue;
      }
      
      if (opts.includeMap && isTag(item, 'EXT-X-MAP')) {
        currentTags.map = parseTagValue(item, 'EXT-X-MAP');
        continue;
      }
      
      if (opts.includeDateRange && isTag(item, 'EXT-X-DATERANGE')) {
        currentTags.dateRange = parseTagValue(item, 'EXT-X-DATERANGE');
        continue;
      }
      
      if (opts.includeProgramDateTime && isTag(item, 'EXT-X-PROGRAM-DATE-TIME')) {
        currentTags.programDateTime = parseTagValue(item, 'EXT-X-PROGRAM-DATE-TIME');
        continue;
      }
      
      // Process URLs
      if (isValidUrl(item, opts.includeRelativeUrls)) {
        let url = item;
        
        // Resolve relative URL if baseUrl provided
        if (opts.baseUrl && !isAbsoluteUrl(url)) {
          url = resolveUrl(opts.baseUrl, url);
          if (opts.verbose) console.log(`Resolved URL: ${item} -> ${url}`);
        }
        
        const streamData = { 
          url, 
          ...currentStreamInfo,
          ...currentTags
        };
        
        // Handle byte range separately if needed
        if (opts.includeByteRange && currentStreamInfo?.BYTERANGE) {
          streamData.byterange = parseByteRange(currentStreamInfo.BYTERANGE);
        }
        
        streams.push(streamData);
        currentStreamInfo = null;
        currentTags = {};
      }
    }
    
    if (opts.verbose) console.log(`Found ${streams.length} streams`);
    
    // Apply resolution filter
    if (opts.filterByResolution) {
      const beforeCount = streams.length;
      streams = streams.filter(stream => {
        const resolution = parseResolution(stream.RESOLUTION);
        return resolution && 
               resolution.width >= opts.minResolution.width && 
               resolution.height >= opts.minResolution.height;
      });
      if (opts.verbose && beforeCount !== streams.length) {
        console.log(`Filtered ${beforeCount - streams.length} streams by resolution`);
      }
    }
    
    // Apply custom filter
    if (opts.filterStream && typeof opts.filterStream === 'function') {
      const beforeCount = streams.length;
      streams = streams.filter(opts.filterStream);
      if (opts.verbose && beforeCount !== streams.length) {
        console.log(`Filtered ${beforeCount - streams.length} streams by custom filter`);
      }
    }
    
    // Handle output format
    if (opts.preferHighestBitrate && streams.length > 0) {
      const best = streams.reduce((best, current) => {
        const bestBitrate = best.BANDWIDTH || 0;
        const currentBitrate = current.BANDWIDTH || 0;
        return currentBitrate > bestBitrate ? current : best;
      }, streams[0]);
      
      if (opts.outputFormat === 'array') return [best];
      if (opts.outputFormat === 'object') return best;
      return best;
    }
    
    if (opts.outputFormat === 'object' && streams.length === 1) {
      return streams[0];
    }
    
    return streams;
    
  } catch (error) {
    if (opts.strictMode) {
      throw new Error(`Failed to parse m3u8 playlist: ${error.message}`);
    }
    if (opts.verbose) console.error(`Parse error: ${error.message}`);
    return opts.outputFormat === 'array' ? [] : null;
  }
}

// ============ Helper Functions ============

/**
 * Check if value is a valid URL
 */
function isValidUrl(url, includeRelative = false) {
  if (typeof url !== 'string') return false;
  
  if (includeRelative) {
    return url.trim().length > 0 && !url.startsWith('#');
  }
  
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Check if string is absolute URL
 */
function isAbsoluteUrl(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Resolve relative URL against base URL
 */
function resolveUrl(base, relative) {
  try {
    const baseUrl = new URL(base);
    return new URL(relative, baseUrl).href;
  } catch (error) {
    return relative; // Return original if resolution fails
  }
}

/**
 * Parse resolution string (e.g., "1920x1080")
 */
function parseResolution(resolution) {
  if (!resolution || typeof resolution !== 'string') return null;
  
  const match = resolution.match(/(\d+)x(\d+)/);
  if (!match) return null;
  
  return {
    width: parseInt(match[1], 10),
    height: parseInt(match[2], 10)
  };
}

/**
 * Parse byte range (e.g., "123456@456")
 */
function parseByteRange(byteRange) {
  if (!byteRange || typeof byteRange !== 'string') return null;
  
  const match = byteRange.match(/(\d+)(?:@(\d+))?/);
  if (!match) return null;
  
  return {
    length: parseInt(match[1], 10),
    offset: match[2] ? parseInt(match[2], 10) : 0
  };
}

/**
 * Check if item is a specific tag
 */
function isTag(item, tagName) {
  if (typeof item !== 'string') return false;
  return item.includes(`#EXT-${tagName}`);
}

/**
 * Parse tag value from line
 */
function parseTagValue(line, tagName) {
  const regex = new RegExp(`#EXT-${tagName}:?(.*)`);
  const match = line.match(regex);
  if (!match) return true;
  
  // Try to parse as attributes if it looks like key-value pairs
  const value = match[1];
  if (value.includes('=')) {
    const attrs = {};
    const pairs = value.split(',').filter(p => p.includes('='));
    for (const pair of pairs) {
      const [key, val] = pair.split('=');
      attrs[key.trim()] = val.replace(/["']/g, '');
    }
    return attrs;
  }
  
  return value;
}

/**
 * Check if item contains valid STREAM-INF tag
 */
function isValidStreamInfo(item) {
  return item && 
         typeof item === 'object' && 
         item[TAG_STREAM] && 
         typeof item[TAG_STREAM] === 'object';
}

// Export main function with static helpers
module.exports = m3u8;
module.exports.parseResolution = parseResolution;
module.exports.parseByteRange = parseByteRange;
module.exports.resolveUrl = resolveUrl;
