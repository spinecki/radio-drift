export interface SomaChannel {
  id: string;
  title: string;
  description: string;
  dj: string;
  djmail: string;
  genre: string;
  image: string;
  largeimage: string;
  xlimage: string;
  twitter: string;
  updated: string;
  playlists: SomaPlaylist[];
  preroll: any[];
  listeners: string;
  lastPlaying: string;
}

export interface SomaPlaylist {
  url: string;
  format: 'mp3' | 'aac' | 'aacp' | 'flac';
  quality: 'highest' | 'high' | 'low' | 'lossless';
}

export interface SomaChannelsResponse {
  channels: SomaChannel[];
}

export interface TrackHistory {
  title: string;
  artist: string;
  album?: string;
  playedAt: number;
}

export interface PlayerState {
  currentStation: SomaChannel | null;
  currentStream: string | null;
  isPlaying: boolean;
  volume: number;
  trackHistory: TrackHistory[];
}