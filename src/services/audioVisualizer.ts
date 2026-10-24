import { NativeModules, NativeEventEmitter } from 'react-native';

const NativeVisualizer = NativeModules.AudioVisualizer as {
  analyze: (uri: string, bars: number) => void;
} | null;

const emitter = new NativeEventEmitter(
  NativeModules.AudioVisualizer as never,
);

const cache = new Map<string, number[][]>();

function cacheKey(uri: string, bars: number): string {
  return `${bars}:${uri}`;
}

export interface FramesPayload {
  uri: string;
  bars: number;
  frames: number[][];
}

function subscribe(listener: (payload: FramesPayload) => void) {
  return emitter.addListener(
    'AudioVisualizerFrames',
    (payload: FramesPayload) => {
      if (payload.frames && payload.frames.length > 0) {
        cache.set(cacheKey(payload.uri, payload.bars), payload.frames);
      }
      listener(payload);
    },
  );
}

function request(uri: string, bars = 24) {
  const cached = cache.get(cacheKey(uri, bars));
  if (cached) {
    emitter.emit('AudioVisualizerFrames', {
      uri,
      bars,
      frames: cached,
    });
    return;
  }
  NativeVisualizer?.analyze(uri, bars);
}

function evict(uri: string, bars = 24) {
  cache.delete(cacheKey(uri, bars));
}

export const audioVisualizer = { request, subscribe, evict };
