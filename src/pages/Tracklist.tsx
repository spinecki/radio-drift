import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Music, Clock, User } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useSomaChannels } from '@/hooks/useSomaChannels';

export const Tracklist: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const { state } = usePlayer();
  const { channels } = useSomaChannels();

  const station = channels.find(s => s.id === stationId) || state.currentStation;

  if (!station) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Station not found</p>
          <Link to="/">
            <Button>Back to Stations</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: number) => {
    const now = new Date();
    const date = new Date(timestamp);
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return 'Today';
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Stations
          </Button>
        </Link>
      </div>

      {/* Station Info */}
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4">
          <img
            src={station.largeimage}
            alt={station.title}
            className="w-24 h-24 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{station.title}</h1>
            <p className="text-muted-foreground mb-3">{station.description}</p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="capitalize">
                {station.genre}
              </Badge>
              {station.dj && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  {station.dj}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Track History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Music className="w-5 h-5" />
          Recently Played
          {state.currentStation?.id === station.id && (
            <Badge variant="default" className="ml-2">Live</Badge>
          )}
        </h2>

        {state.trackHistory.length === 0 ? (
          <Card className="p-8 text-center">
            <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {state.currentStation?.id === station.id
                ? 'Track history will appear here as songs play...'
                : 'No track history available. Start playing this station to see recent tracks.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {state.trackHistory.map((track, index) => {
              const isCurrentlyPlaying = index === 0 && state.currentStation?.id === station.id && state.isPlaying;
              
              return (
                <Card 
                  key={`${track.playedAt}-${index}`} 
                  className={`p-4 ${isCurrentlyPlaying ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium line-clamp-1">{track.title}</h3>
                        {isCurrentlyPlaying && (
                          <Badge variant="default" className="text-xs">Now Playing</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {track.artist}
                      </p>
                      {track.album && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {track.album}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
                      <Clock className="w-3 h-3" />
                      <div className="text-right">
                        <div>{formatTime(track.playedAt)}</div>
                        <div>{formatDate(track.playedAt)}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};