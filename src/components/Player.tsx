import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, Volume2, Music, List } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { Link } from 'react-router-dom';

export const Player: React.FC = () => {
  const { state, pause, stop, setVolume } = usePlayer();

  if (!state.currentStation) {
    return (
      <Card className="fixed bottom-0 left-0 right-0 p-4 rounded-none border-x-0 border-b-0 bg-background/95 backdrop-blur">
        <div className="container mx-auto">
          <div className="flex items-center justify-center text-muted-foreground">
            <Music className="w-5 h-5 mr-2" />
            Select a station to start listening
          </div>
        </div>
      </Card>
    );
  }

  const currentTrack = state.trackHistory[0];

  return (
    <Card className="fixed bottom-0 left-0 right-0 p-4 rounded-none border-x-0 border-b-0 bg-background/95 backdrop-blur">
      <div className="container mx-auto">
        <div className="flex items-center gap-4">
          {/* Station Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={state.currentStation.image}
              alt={state.currentStation.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm line-clamp-1">
                {state.currentStation.title}
              </h4>
              {currentTrack ? (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {currentTrack.artist} - {currentTrack.title}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {state.currentStation.lastPlaying || 'Loading...'}
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={state.isPlaying ? pause : stop}
            >
              {state.isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button size="sm" variant="ghost" onClick={stop}>
              <Square className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 min-w-32">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[state.volume]}
              onValueChange={([value]) => setVolume(value)}
              max={1}
              step={0.01}
              className="flex-1"
            />
          </div>

          {/* Tracklist Link */}
          <Link to={`/tracklist/${state.currentStation.id}`}>
            <Button size="sm" variant="outline">
              <List className="w-4 h-4 mr-1" />
              Tracklist
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};