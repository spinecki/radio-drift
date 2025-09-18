import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Music } from 'lucide-react';
import { SomaChannel } from '@/types/soma';
import { usePlayer } from '@/context/PlayerContext';
import { useSomaChannels } from '@/hooks/useSomaChannels';

const getStreamUrl = (channel: SomaChannel): string => {
  // For Groove Salad, prefer FLAC HLS
  if (channel.id === 'groovesalad' && channel.playlists[0]?.format === 'flac') {
    return channel.playlists[0].url;
  }
  
  // For others, get highest quality MP3 or AAC
  const highestQuality = channel.playlists.find(p => p.quality === 'highest');
  return highestQuality?.url || channel.playlists[0]?.url || '';
};

const formatQuality = (playlist: any) => {
  if (playlist.format === 'flac') return 'FLAC HLS';
  if (playlist.format === 'mp3' && playlist.url.includes('320')) return '320k MP3';
  if (playlist.format === 'mp3') return '256k MP3';
  if (playlist.format === 'aac') return '128k AAC';
  return playlist.quality;
};

export const StationList: React.FC = () => {
  const { channels, loading, error } = useSomaChannels();
  const { play, state } = usePlayer();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SomaFM stations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading stations: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const handlePlayStation = (station: SomaChannel) => {
    const streamUrl = getStreamUrl(station);
    play(station, streamUrl);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">SomaFM Radio</h1>
        <p className="text-muted-foreground text-lg">
          Independent Internet radio broadcasting from San Francisco
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((station) => (
          <Card key={station.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square relative">
              <img
                src={station.largeimage}
                alt={station.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = station.image;
                }}
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  size="lg"
                  onClick={() => handlePlayStation(station)}
                  className="rounded-full"
                  disabled={state.currentStation?.id === station.id && state.isPlaying}
                >
                  <Play className="w-6 h-6" />
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg line-clamp-1">{station.title}</h3>
                <Badge variant="secondary" className="ml-2 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {station.listeners}
                </Badge>
              </div>
              
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {station.description}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="capitalize">
                  {station.genre}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatQuality(station.playlists[0])}
                </span>
              </div>
              
              {station.lastPlaying && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Music className="w-3 h-3" />
                  <span className="line-clamp-1">{station.lastPlaying}</span>
                </div>
              )}
              
              <Button
                className="w-full mt-4"
                onClick={() => handlePlayStation(station)}
                disabled={state.currentStation?.id === station.id && state.isPlaying}
              >
                {state.currentStation?.id === station.id && state.isPlaying ? (
                  'Now Playing'
                ) : (
                  'Play Station'
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};