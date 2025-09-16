export interface TrackMetadata {
  title: string;
  artist: string;
  album?: string;
}

export class StreamMetadataReader {
  private controller: AbortController | null = null;

  async getMetadata(streamUrl: string): Promise<TrackMetadata | null> {
    try {
      // Abort previous request if exists
      if (this.controller) {
        this.controller.abort();
      }
      
      this.controller = new AbortController();
      
      const response = await fetch(streamUrl, {
        method: 'GET',
        headers: {
          'Icy-MetaData': '1',
          'User-Agent': 'SomaFM-Player/1.0'
        },
        signal: this.controller.signal
      });

      const icyMetaInt = response.headers.get('icy-metaint');
      if (!icyMetaInt) {
        console.log('No ICY metadata available for this stream');
        return null;
      }

      const reader = response.body?.getReader();
      if (!reader) return null;

      const metaInterval = parseInt(icyMetaInt, 10);
      let bytesRead = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        bytesRead += value.length;

        // Check if we've reached a metadata block
        if (bytesRead >= metaInterval) {
          const metaLength = value[metaInterval] * 16;
          if (metaLength > 0) {
            const metaStart = metaInterval + 1;
            const metaEnd = metaStart + metaLength;
            const metaBytes = value.slice(metaStart, metaEnd);
            const metaString = new TextDecoder().decode(metaBytes);
            
            const metadata = this.parseMetadata(metaString);
            if (metadata) {
              reader.cancel();
              return metadata;
            }
          }
          break;
        }
      }

      reader.cancel();
      return null;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Metadata fetch aborted');
      } else {
        console.error('Error fetching metadata:', error);
      }
      return null;
    }
  }

  private parseMetadata(metaString: string): TrackMetadata | null {
    try {
      // Parse ICY metadata format: StreamTitle='Artist - Title';
      const titleMatch = metaString.match(/StreamTitle='([^']+)'/);
      if (!titleMatch) return null;

      const streamTitle = titleMatch[1];
      
      // Try to parse "Artist - Title" format
      const parts = streamTitle.split(' - ');
      if (parts.length >= 2) {
        return {
          artist: parts[0].trim(),
          title: parts.slice(1).join(' - ').trim()
        };
      }
      
      // If no separator found, treat as title only
      return {
        artist: 'Unknown Artist',
        title: streamTitle.trim()
      };
    } catch (error) {
      console.error('Error parsing metadata:', error);
      return null;
    }
  }

  abort() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }
}

// Alternative method using proxy server for CORS
export async function getMetadataViaProxy(stationId: string): Promise<TrackMetadata | null> {
  try {
    // Try SomaFM's internal song history endpoints
    const response = await fetch(`https://somafm.com/songs/${stationId}.json`, {
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from SomaFM API');
    }
    
    const data = await response.json();
    const currentSong = data.songs?.[0];
    
    if (currentSong) {
      return {
        artist: currentSong.artist || 'Unknown Artist',
        title: currentSong.title || 'Unknown Title',
        album: currentSong.album
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching metadata via proxy:', error);
    return null;
  }
}