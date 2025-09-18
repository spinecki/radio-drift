import { useState, useEffect } from 'react';
import { SomaChannelsResponse, SomaChannel } from '@/types/soma';

export const useSomaChannels = () => {
  const [channels, setChannels] = useState<SomaChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('https://somafm.com/channels.json');
        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }
        const data: SomaChannelsResponse = await response.json();
        
        // Add FLAC HLS for Groove Salad
        const channelsWithFLAC = data.channels.map(channel => {
          if (channel.id === 'groovesalad') {
            return {
              ...channel,
              playlists: [
                { url: 'https://hls.somafm.com/hls/groovesalad/FLAC/program.m3u8', format: 'flac' as any, quality: 'lossless' as any },
                ...channel.playlists
              ]
            };
          }
          return channel;
        });
        
        setChannels(channelsWithFLAC);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  return { channels, loading, error };
};