import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Music, Settings } from 'lucide-react';
import { SomaChannel, SomaPlaylist } from '@/types/soma';
import { usePlayer } from '@/context/PlayerContext';
import { useSomaChannels } from '@/hooks/useSomaChannels';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const getStreamUrl = async (channel: SomaChannel, selectedPlaylist?: SomaPlaylist): Promise<string> => {
  // Use selected playlist or default logic
  const playlist = selectedPlaylist || (() => {
    // For Groove Salad, prefer FLAC HLS (direct stream URL)
    if (channel.id === 'groovesalad' && channel.playlists.find(p => p.format === 'flac')) {
      return channel.playlists.find(p => p.format === 'flac')!;
    }
    
    // For others, get highest quality MP3 or AAC
    return channel.playlists.find(p => p.quality === 'highest') || channel.playlists[0];
  })();
  
  const playlistUrl = playlist?.url || '';
  
  if (playlistUrl.endsWith('.pls')) {
    try {
      const response = await fetch(playlistUrl);
      const plsContent = await response.text();
      
      // Parse PLS file to extract stream URL
      const lines = plsContent.split('\n');
      for (const line of lines) {
        if (line.startsWith('File1=') || line.startsWith('File=')) {
          return line.substring(line.indexOf('=') + 1).trim();
        }
      }
    } catch (error) {
      console.error('Error parsing PLS file:', error);
    }
  }
  
  return playlistUrl;
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
  const [selectedPlaylists, setSelectedPlaylists] = useState<Record<string, SomaPlaylist>>({});

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

  const handlePlayStation = async (station: SomaChannel) => {
    const selectedPlaylist = selectedPlaylists[station.id];
    const streamUrl = await getStreamUrl(station, selectedPlaylist);
    await play(station, streamUrl);
  };

  const handlePlaylistSelect = (stationId: string, playlist: SomaPlaylist) => {
    setSelectedPlaylists(prev => ({
      ...prev,
      [stationId]: playlist
    }));
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-32">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">SomaFM Radio</h1>
        <p className="text-muted-foreground text-lg">
          Independent Internet radio broadcasting from San Francisco
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((station) => (
          <Card key={station.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-[4/3] relative">
              <img
                src={station.image}
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatQuality(selectedPlaylists[station.id] || station.playlists[0])}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {station.playlists.map((playlist, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={() => handlePlaylistSelect(station.id, playlist)}
                          className={selectedPlaylists[station.id] === playlist ? 'bg-accent' : ''}
                        >
                          {formatQuality(playlist)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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