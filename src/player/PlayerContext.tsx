import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import TrackPlayer, {
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useActiveTrack,
} from 'react-native-track-player';

import { Song } from '../data/songs';
import { navigateToPlayer } from '../navigation/navigationRef';
import { initializePlayer } from './playerService';

interface PlayerContextValue {
  currentTrack: Song | null;
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  playSong: (song: Song, queue: Song[]) => void;
  togglePlayback: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  seekTo: (position: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const activeTrack = useActiveTrack();

  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(RepeatMode.Queue);
  const shuffleRef = useRef(false);
  const queueRef = useRef<Song[]>([]);
  const initializedRef = useRef(false);

  const isPlaying = !!(
    playbackState.state === State.Playing ||
    playbackState.state === State.Loading ||
    playbackState.state === State.Buffering
  );
  const isBuffering =
    playbackState.state === State.Buffering ||
    playbackState.state === State.Loading;

  const currentTrack: Song | null = useMemo(() => {
    if (!activeTrack?.id) {
      return null;
    }
    const s = queueRef.current.find(
      song => song.id === String(activeTrack.id),
    );
    return s ?? null;
  }, [activeTrack]);

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  const autoOpenedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initializePlayer();
      if (!cancelled) {
        initializedRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!initializedRef.current) {
      return;
    }
    if (isPlaying && currentTrack && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      navigateToPlayer();
    }
  }, [isPlaying, currentTrack]);

  async function playSong(song: Song, queue: Song[]) {
    queueRef.current = queue;
    autoOpenedRef.current = false;
    try {
      await TrackPlayer.reset();
    } catch (e) {}
    try {
      await TrackPlayer.add(
        queue.map(t => ({
          id: t.id,
          url: t.url,
          title: t.title,
          artist: t.artist,
          album: t.album,
          ...(t.artwork ? { artwork: t.artwork } : {}),
        })),
      );
    } catch (e) {}
    const index = queue.findIndex(t => t.id === song.id);
    try {
      await TrackPlayer.skip(index >= 0 ? index : 0);
    } catch (e) {}
    try {
      await TrackPlayer.setRepeatMode(repeat);
      await TrackPlayer.play();
    } catch (e) {}
  }

  async function togglePlayback() {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }

  async function skipToNext() {
    if (shuffleRef.current) {
      const queue = await TrackPlayer.getQueue();
      if (queue.length) {
        const random = Math.floor(Math.random() * queue.length);
        await TrackPlayer.skip(random);
      }
    } else {
      await TrackPlayer.skipToNext();
    }
  }

  async function skipToPrevious() {
    await TrackPlayer.skipToPrevious();
  }

  async function seekTo(position: number) {
    await TrackPlayer.seekTo(position);
  }

  function toggleShuffle() {
    const next = !shuffleRef.current;
    shuffleRef.current = next;
    setShuffle(next);
  }

  async function cycleRepeat() {
    const next =
      repeat === RepeatMode.Off
        ? RepeatMode.Track
        : repeat === RepeatMode.Track
        ? RepeatMode.Queue
        : RepeatMode.Off;
    setRepeat(next);
    await TrackPlayer.setRepeatMode(next);
  }

  const value: PlayerContextValue = {
    currentTrack,
    isPlaying,
    isBuffering,
    position: progress.position,
    duration: progress.duration,
    shuffle,
    repeat,
    playSong,
    togglePlayback,
    skipToNext,
    skipToPrevious,
    seekTo,
    toggleShuffle,
    cycleRepeat,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return ctx;
}
