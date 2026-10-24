import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useProgress } from 'react-native-track-player';

import { audioVisualizer } from '../services/audioVisualizer';

interface Props {
  uri: string;
  bars?: number;
  color?: string;
  height?: number;
  barWidth?: number;
  gap?: number;
}

const IDLE_HEIGHT = 0.15;
const MIN_HEIGHT = 0.18;
const FPS = 4;

export default function BeatBar({
  uri,
  bars = 24,
  color = '#FF4D6D',
  height = 28,
  barWidth = 3,
  gap = 3,
}: Props) {
  const valuesRef = useRef<Animated.Value[] | null>(null);
  if (!valuesRef.current) {
    valuesRef.current = Array.from(
      { length: bars },
      () => new Animated.Value(IDLE_HEIGHT),
    );
  }
  const values = valuesRef.current;
  const currentRef = useRef<number[]>(Array.from({ length: bars }, () => IDLE_HEIGHT));
  const current = currentRef.current;
  const [frames, setFrames] = useState<number[][] | null>(null);
  const framesRef = useRef<number[][] | null>(null);
  const position = useProgress().position;

  framesRef.current = frames;

  useEffect(() => {
    setFrames(null);
    framesRef.current = null;
    if (!uri) {
      return;
    }
    audioVisualizer.request(uri, bars);
    const sub = audioVisualizer.subscribe(payload => {
      if (payload.uri !== uri || payload.bars !== bars) {
        return;
      }
      setFrames(payload.frames);
    });
    return () => {
      sub.remove();
    };
  }, [uri, bars]);

  const frameIndex = frames
    ? Math.min(Math.floor(position * FPS), frames.length - 1)
    : -1;

  useEffect(() => {
    if (frameIndex < 0 || !framesRef.current) {
      return;
    }
    const sizes = framesRef.current[frameIndex];
    for (let i = 0; i < bars; i++) {
      const raw = sizes?.[i] ?? 0;
      let target = Math.min(raw / 255, 1);
      target = MIN_HEIGHT + target * (1 - MIN_HEIGHT);
      const isRising = target > current[i];
      const duration = isRising ? 50 : 200;
      current[i] = target;
      values[i].stopAnimation();
      Animated.timing(values[i], {
        toValue: target,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [frameIndex, bars, current, values]);

  return (
    <View style={[styles.container, { height }]} pointerEvents="none">
      {Array.from({ length: bars }, (_, i) => (
        <View key={i} style={[styles.bar, { width: barWidth, marginRight: gap }]}>
          <Animated.View
            style={[
              styles.fill,
              {
                backgroundColor: color,
                transform: [{ scaleY: values[i] }],
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: '100%',
    justifyContent: 'center',
  },
  fill: {
    height: '100%',
    width: '100%',
    borderRadius: 4,
    transformOrigin: 'center',
  },
});
