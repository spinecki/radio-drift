import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import { PlayerState, SomaChannel, TrackHistory } from '@/types/soma';
import { StreamMetadataReader, getMetadataViaProxy } from '@/utils/streamMetadata';

interface PlayerContextType {
  state: PlayerState;
  play: (station: SomaChannel, streamUrl: string) => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  addToHistory: (track: TrackHistory) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

type PlayerAction =
  | { type: 'SET_STATION'; payload: { station: SomaChannel; streamUrl: string } }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'ADD_TO_HISTORY'; payload: TrackHistory }
  | { type: 'STOP' };

const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'SET_STATION':
      return {
        ...state,
        currentStation: action.payload.station,
        currentStream: action.payload.streamUrl,
        isPlaying: true
      };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        trackHistory: [action.payload, ...state.trackHistory.slice(0, 49)] // Keep last 50 tracks
      };
    case 'STOP':
      return {
        ...state,
        currentStation: null,
        currentStream: null,
        isPlaying: false
      };
    default:
      return state;
  }
};

const initialState: PlayerState = {
  currentStation: null,
  currentStream: null,
  isPlaying: false,
  volume: 0.7,
  trackHistory: []
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const metadataReader = useRef<StreamMetadataReader>(new StreamMetadataReader());
  const metadataInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = state.volume;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (metadataInterval.current) {
        clearInterval(metadataInterval.current);
      }
      metadataReader.current.abort();
    };
  }, []);

  const fetchMetadata = async () => {
    if (!state.currentStation || !state.currentStream) return;

    try {
      let metadata = await getMetadataViaProxy(state.currentStation.id);
      
      if (!metadata) {
        metadata = await metadataReader.current.getMetadata(state.currentStream);
      }
      
      if (metadata) {
        const track: TrackHistory = {
          ...metadata,
          playedAt: Date.now()
        };
        
        // Only add if it's a new track
        if (state.trackHistory.length === 0 || 
            state.trackHistory[0].title !== track.title || 
            state.trackHistory[0].artist !== track.artist) {
          dispatch({ type: 'ADD_TO_HISTORY', payload: track });
        }
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const play = (station: SomaChannel, streamUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = streamUrl;
      audioRef.current.play().catch(console.error);
    }
    
    dispatch({ type: 'SET_STATION', payload: { station, streamUrl } });
    
    // Start metadata fetching
    if (metadataInterval.current) {
      clearInterval(metadataInterval.current);
    }
    
    fetchMetadata();
    metadataInterval.current = setInterval(fetchMetadata, 3000);
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    dispatch({ type: 'SET_PLAYING', payload: false });
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    if (metadataInterval.current) {
      clearInterval(metadataInterval.current);
    }
    
    metadataReader.current.abort();
    dispatch({ type: 'STOP' });
  };

  const setVolume = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    dispatch({ type: 'SET_VOLUME', payload: volume });
  };

  const addToHistory = (track: TrackHistory) => {
    dispatch({ type: 'ADD_TO_HISTORY', payload: track });
  };

  // Update audio volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  return (
    <PlayerContext.Provider value={{ state, play, pause, stop, setVolume, addToHistory }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};