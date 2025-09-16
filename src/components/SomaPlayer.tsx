import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square, Volume2, Radio, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreamMetadataReader, getMetadataViaProxy, type TrackMetadata } from '@/utils/streamMetadata';

interface StreamQuality {
  bitrate: string;
  url: string;
}

interface SomaStation {
  id: string;
  title: string;
  description: string;
  genre: string;
  streams: StreamQuality[];
}

interface NowPlaying {
  title: string;
  artist: string;
  album?: string;
  lastUpdated: number;
}

const somaStations: SomaStation[] = [
  {
    id: 'groovesalad',
    title: 'Groove Salad',
    description: 'A nicely chilled plate of ambient/downtempo beats and grooves.',
    genre: 'Ambient/Downtempo',
    streams: [
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/groovesalad-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/groovesalad-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/groovesalad-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/groovesalad-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/groovesalad-32-aac' }
    ]
  },
  {
    id: 'dronezone',
    title: 'Drone Zone',
    description: 'Served best chilled, safe with most medications. Atmospheric textures with minimal beats.',
    genre: 'Ambient',
    streams: [
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/dronezone-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/dronezone-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/dronezone-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/dronezone-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/dronezone-32-aac' }
    ]
  },
  {
    id: 'spacestation',
    title: 'Space Station Soma',
    description: 'Tune in, turn on, space out. Spaced-out ambient and mid-tempo electronica.',
    genre: 'Space Ambient',
    streams: [
      { bitrate: '320k MP3', url: 'https://ice5.somafm.com/spacestation-320-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/spacestation-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/spacestation-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/spacestation-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/spacestation-32-aac' }
    ]
  },
  {
    id: 'secretagent',
    title: 'Secret Agent',
    description: 'The soundtrack for your stylish, mysterious, dangerous life. For Spies and PIs too!',
    genre: 'Lounge',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/secretagent-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/secretagent-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/secretagent-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/secretagent-32-aac' }
    ]
  },
  {
    id: 'defcon',
    title: 'DEF CON Radio',
    description: 'Music for Hacking. The DEF CON Year-Round Channel.',
    genre: 'Electronic',
    streams: [
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/defcon-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/defcon-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/defcon-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/defcon-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/defcon-32-aac' }
    ]
  },
  {
    id: 'u80s',
    title: 'Underground 80s',
    description: 'Early 80s UK Synthpop and a bit of New Wave.',
    genre: '80s Synthpop',
    streams: [
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/u80s-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/u80s-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/u80s-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/u80s-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/u80s-32-aac' }
    ]
  },
  {
    id: 'lush',
    title: 'Lush',
    description: 'Sensuous and mellow female vocals, many with an electronic influence.',
    genre: 'Electronic/Vocal',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/lush-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/lush-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/lush-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/lush-32-aac' }
    ]
  },
  {
    id: 'seventies',
    title: 'Left Coast 70s',
    description: 'Mellow album rock from the Seventies. Yacht not required.',
    genre: '70s Rock',
    streams: [
      { bitrate: '320k MP3', url: 'https://ice5.somafm.com/seventies-320-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/seventies-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/seventies-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/seventies-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/seventies-32-aac' }
    ]
  },
  {
    id: 'folkfwd',
    title: 'Folk Forward',
    description: 'Indie Folk, Alt-folk and the occasional folk classics.',
    genre: 'Folk',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/folkfwd-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/folkfwd-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/folkfwd-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/folkfwd-32-aac' }
    ]
  },
  {
    id: 'beatblender',
    title: 'Beat Blender',
    description: 'A late night blend of deep-house and downtempo chill.',
    genre: 'Deep House',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/beatblender-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/beatblender-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/beatblender-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/beatblender-32-aac' }
    ]
  },
  {
    id: 'bootliquor',
    title: 'Boot Liquor',
    description: 'Americana Roots music for Cowhands, Cowpokes and Cowtippers',
    genre: 'Americana',
    streams: [
      { bitrate: '320k MP3', url: 'https://ice5.somafm.com/bootliquor-320-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/bootliquor-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/bootliquor-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/bootliquor-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/bootliquor-32-aac' }
    ]
  },
  {
    id: 'thetrip',
    title: 'The Trip',
    description: 'Progressive house / trance. Tip top tunes.',
    genre: 'Progressive House',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/thetrip-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/thetrip-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/thetrip-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/thetrip-32-aac' }
    ]
  },
  {
    id: 'suburbsofgoa',
    title: 'Suburbs of Goa',
    description: 'Desi-influenced Asian world beats and beyond.',
    genre: 'World Beats',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/suburbsofgoa-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/suburbsofgoa-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/suburbsofgoa-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/suburbsofgoa-32-aac' }
    ]
  },
  {
    id: 'darkzone',
    title: 'The Dark Zone',
    description: 'The darker side of deep ambient. Music for staring into the Abyss.',
    genre: 'Dark Ambient',
    streams: [
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/darkzone-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/darkzone-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/darkzone-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/darkzone-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/darkzone-32-aac' }
    ]
  },
  {
    id: 'thistle',
    title: 'ThistleRadio',
    description: 'Exploring music from Celtic roots and branches',
    genre: 'Celtic',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/thistle-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/thistle-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/thistle-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/thistle-32-aac' }
    ]
  },
  {
    id: 'bossa',
    title: 'Bossa Beyond',
    description: 'Silky-smooth, laid-back Brazilian-style rhythms of Bossa Nova, Samba and beyond',
    genre: 'Bossa Nova',
    streams: [
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/bossa-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/bossa-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/bossa-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/bossa-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/bossa-32-aac' }
    ]
  },
  {
    id: 'sonicuniverse',
    title: 'Sonic Universe',
    description: 'Transcending the world of jazz with eclectic, avant-garde takes on tradition.',
    genre: 'Jazz',
    streams: [
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/sonicuniverse-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/sonicuniverse-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/sonicuniverse-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/sonicuniverse-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/sonicuniverse-32-aac' }
    ]
  },
  {
    id: 'poptron',
    title: 'PopTron',
    description: 'Electropop and indie dance rock with sparkle and pop.',
    genre: 'Electropop',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/poptron-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/poptron-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/poptron-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/poptron-32-aac' }
    ]
  },
  {
    id: 'reggae',
    title: 'Heavyweight Reggae',
    description: 'Reggae, Ska, Rocksteady classic and deep tracks.',
    genre: 'Reggae',
    streams: [
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/reggae-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/reggae-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/reggae-128-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/reggae-32-aac' }
    ]
  },
  {
    id: 'fluid',
    title: 'Fluid',
    description: 'Drown in the electronic sound of instrumental hiphop, future soul and liquid trap.',
    genre: 'Electronic Hip-Hop',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/fluid-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/fluid-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/fluid-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/fluid-32-aac' }
    ]
  },
  {
    id: 'indiepop',
    title: 'Indie Pop Rocks!',
    description: 'New and classic favorite indie pop tracks.',
    genre: 'Indie Pop',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/indiepop-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/indiepop-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/indiepop-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/indiepop-32-aac' }
    ]
  },
  {
    id: 'cliqhop',
    title: 'cliqhop idm',
    description: "Blips'n'beeps backed mostly w/beats. Intelligent Dance Music.",
    genre: 'IDM',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/cliqhop-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/cliqhop-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/cliqhop-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/cliqhop-32-aac' }
    ]
  },
  {
    id: 'deepspaceone',
    title: 'Deep Space One',
    description: 'Deep ambient electronic, experimental and space music. For inner and outer space exploration.',
    genre: 'Space Music',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/deepspaceone-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/deepspaceone-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/deepspaceone-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/deepspaceone-32-aac' }
    ]
  },
  {
    id: 'metal',
    title: 'Metal Detector',
    description: 'From black to doom, prog to sludge, thrash to post, stoner to crossover, punk to industrial.',
    genre: 'Metal',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/metal-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/metal-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/metal-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/metal-32-aac' }
    ]
  },
  {
    id: 'missioncontrol',
    title: 'Mission Control',
    description: 'Celebrating NASA and Space Explorers everywhere.',
    genre: 'Space/Ambient',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/missioncontrol-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/missioncontrol-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/missioncontrol-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/missioncontrol-32-aac' }
    ]
  },
  {
    id: 'covers',
    title: 'Covers',
    description: 'Just covers. Songs you know by artists you don\'t. We\'ve got you covered.',
    genre: 'Cover Songs',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/covers-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/covers-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/covers-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/covers-32-aac' }
    ]
  },
  {
    id: '7soul',
    title: 'Seven Inch Soul',
    description: 'Vintage soul tracks from the original 45 RPM vinyl.',
    genre: 'Soul/Funk',
    streams: [
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/7soul-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/7soul-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/7soul-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/7soul-32-aac' }
    ]
  }
];

export const SomaPlayer = () => {
  const [currentStation, setCurrentStation] = useState<SomaStation | null>(null);
  const [currentStream, setCurrentStream] = useState<StreamQuality | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nowPlayingInterval = useRef<NodeJS.Timeout | null>(null);
  const metadataReader = useRef<StreamMetadataReader>(new StreamMetadataReader());

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'none';
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (nowPlayingInterval.current) {
        clearInterval(nowPlayingInterval.current);
      }
      metadataReader.current.abort();
    };
  }, []);

  // Fetch real now playing info from stream metadata
  const fetchNowPlaying = async (station: SomaStation, streamUrl: string) => {
    try {
      console.log(`Fetching metadata for ${station.title}...`);
      
      // Try multiple methods to get metadata
      let metadata: TrackMetadata | null = null;
      
      // Method 1: Try SomaFM's JSON endpoint
      try {
        metadata = await getMetadataViaProxy(station.id);
        console.log('Got metadata via SomaFM API:', metadata);
      } catch (error) {
        console.log('SomaFM API failed, trying stream metadata...');
      }
      
      // Method 2: Try reading from stream directly (may fail due to CORS)
      if (!metadata) {
        try {
          metadata = await metadataReader.current.getMetadata(streamUrl);
          console.log('Got metadata from stream:', metadata);
        } catch (error) {
          console.log('Stream metadata failed:', error);
        }
      }
      
      if (metadata) {
        setNowPlaying({
          ...metadata,
          lastUpdated: Date.now()
        });
      } else {
        console.log('No metadata available, keeping current info');
      }
    } catch (error) {
      console.error('Error fetching now playing:', error);
    }
  };

  const playStation = async (station: SomaStation, stream?: StreamQuality) => {
    if (!audioRef.current) return;

    const selectedStream = stream || station.streams[0]; // Default to first (highest quality)
    setIsLoading(true);
    
    try {
      // Stop current stream
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      // Clear existing interval
      if (nowPlayingInterval.current) {
        clearInterval(nowPlayingInterval.current);
      }
      
      // Set new station
      setCurrentStation(station);
      setCurrentStream(selectedStream);
      audioRef.current.src = selectedStream.url;
      
      console.log(`Playing ${station.title} at ${selectedStream.bitrate}: ${selectedStream.url}`);
      
      // Play new stream
      await audioRef.current.play();
      setIsPlaying(true);
      
      // Fetch now playing info immediately and then every 30 seconds
      fetchNowPlaying(station, selectedStream.url);
      nowPlayingInterval.current = setInterval(() => {
        fetchNowPlaying(station, selectedStream.url);
      }, 3000); // Updated to 3 seconds
      
    } catch (error) {
      console.error('Error playing station:', error);
      setIsPlaying(false);
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
    setCurrentStream(null);
    setNowPlaying(null);
    
    if (nowPlayingInterval.current) {
      clearInterval(nowPlayingInterval.current);
      nowPlayingInterval.current = null;
    }
    
    metadataReader.current.abort();
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
                  <Radio className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{currentStation.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentStation.genre}</p>
                  {currentStream && (
                    <p className="text-xs text-primary">{currentStream.bitrate}</p>
                  )}
                </div>
              </div>

              {/* Now Playing Track Info */}
              {nowPlaying && (
                <div className="bg-background/50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Now Playing</span>
                  </div>
                  <p className="font-medium text-sm">{nowPlaying.title}</p>
                  <p className="text-sm text-muted-foreground">{nowPlaying.artist}</p>
                  {nowPlaying.album && (
                    <p className="text-xs text-muted-foreground opacity-75">{nowPlaying.album}</p>
                  )}
                </div>
              )}
              
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
          <h2 className="text-xl font-semibold text-foreground">Stations ({somaStations.length})</h2>
          {somaStations.map((station) => (
            <Card
              key={station.id}
              className={cn(
                "bg-card/80 border-border/50 cursor-pointer transition-all hover:shadow-glow hover:scale-105",
                currentStation?.id === station.id && "ring-2 ring-primary shadow-neon"
              )}
            >
              <div className="p-4 space-y-3">
                <div 
                  className="space-y-2"
                  onClick={() => playStation(station)}
                >
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
                
                {/* Stream Quality Options */}
                <div className="flex flex-wrap gap-1 pt-2 border-t border-border/30">
                  {station.streams.map((stream) => (
                    <Button
                      key={stream.bitrate}
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playStation(station, stream);
                      }}
                      className={cn(
                        "text-xs bg-background/50 border-border/50 hover:bg-primary/10",
                        currentStation?.id === station.id && 
                        currentStream?.bitrate === stream.bitrate && 
                        "bg-primary/20 border-primary/50"
                      )}
                    >
                      {stream.bitrate}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};