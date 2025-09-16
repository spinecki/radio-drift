import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SomaStation {
  id: string;
  title: string;
  description: string;
  streamUrl: string;
  genre: string;
}

const somaStations: SomaStation[] = [
  {
    id: 'groovesalad',
    title: 'Groove Salad',
    description: 'A nicely chilled plate of ambient/downtempo beats and grooves.',
    streamUrl: 'https://ice1.somafm.com/groovesalad-256-mp3',
    genre: 'Ambient/Downtempo'
  },
  {
    id: 'dronezone',
    title: 'Drone Zone',
    description: 'Served best chilled, safe with most medications.',
    streamUrl: 'https://ice1.somafm.com/dronezone-256-mp3',
    genre: 'Ambient'
  },
  {
    id: 'defcon',
    title: 'DEF CON Radio',
    description: 'Music for Hacking. The DEF CON Year-Round Channel.',
    streamUrl: 'https://ice1.somafm.com/defcon-256-mp3',
    genre: 'Electronic'
  },
  {
    id: 'beatblender',
    title: 'Beat Blender',
    description: 'A late night blend of deep-house and downtempo chill.',
    streamUrl: 'https://ice1.somafm.com/beatblender-256-mp3',
    genre: 'Deep House'
  },
  {
    id: 'secretagent',
    title: 'Secret Agent',
    description: 'The soundtrack for your stylish, mysterious, dangerous life.',
    streamUrl: 'https://ice1.somafm.com/secretagent-256-mp3',
    genre: 'Lounge'
  },
  {
    id: 'spacestation',
    title: 'Space Station Soma',
    description: 'Tune in, turn on, space out. Spaced-out ambient and mid-tempo electronica.',
    streamUrl: 'https://ice1.somafm.com/spacestation-256-mp3',
    genre: 'Space Ambient'
  }
];

export const SomaPlayer = () => {
  const [currentStation, setCurrentStation] = useState<SomaStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'none';
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playStation = async (station: SomaStation) => {
    if (!audioRef.current) return;

    setIsLoading(true);
    
    try {
      // Stop current stream
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      // Set new station
      setCurrentStation(station);
      audioRef.current.src = station.streamUrl;
      
      // Play new stream
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing station:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current || !currentStation) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const stopPlayback = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentStation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-darker to-background p-4">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Soma FM
          </h1>
          <p className="text-muted-foreground">Underground/Alternative Radio</p>
        </div>

        {/* Current Playing */}
        {currentStation && (
          <Card className="bg-gradient-surface border-border/50 shadow-glow">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{currentStation.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentStation.genre}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayPause}
                  disabled={isLoading}
                  className="bg-background/50 border-primary/30 hover:bg-primary/10"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopPlayback}
                  className="bg-background/50 border-destructive/30 hover:bg-destructive/10"
                >
                  <Square className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Station List */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Stations</h2>
          {somaStations.map((station) => (
            <Card
              key={station.id}
              className={cn(
                "bg-card/80 border-border/50 cursor-pointer transition-all hover:shadow-glow hover:scale-105",
                currentStation?.id === station.id && "ring-2 ring-primary shadow-neon"
              )}
              onClick={() => playStation(station)}
            >
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">{station.title}</h3>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {station.genre}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {station.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};