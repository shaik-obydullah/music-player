import React, { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import RNCSlider, { SliderProps } from '@react-native-community/slider';

const Slider = RNCSlider as unknown as React.ComponentType<SliderProps>;

import { usePlayer } from '../player/PlayerContext';
import { colors } from '../theme/colors';
import { formatTime } from '../utils/format';
import { useDeviceLibrary } from '../services/deviceLibrary';
import { RootStackParamList } from '../navigation/types';
import {
  ChevronDownIcon,
  MoreIcon,
  MusicNoteIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  RepeatIcon,
  ShuffleIcon,
} from '../components/icons';
import { RepeatMode } from 'react-native-track-player';
import SongListItem from '../components/SongListItem';
import BeatBar from '../components/BeatBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

export default function PlayerScreen({ navigation, route }: Props) {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    skipToNext,
    skipToPrevious,
    togglePlayback,
    seekTo,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
  } = usePlayer();

  const { songs } = useDeviceLibrary();

  const queue = route.params?.queue ?? songs;

  const [scrubbing, setScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const [showQueue, setShowQueue] = useState(false);

  // Seek when not scrubbing and position updates
  const displayPosition = scrubbing ? scrubValue : position;

  const safeDuration = duration || 0;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <ChevronDownIcon size={28} color={colors.white} />
        </Pressable>
        <Text style={styles.topBarTitle}>Now Playing</Text>
        <Pressable onPress={() => setShowQueue(v => !v)} hitSlop={12}>
          <MoreIcon size={22} color={colors.white} />
        </Pressable>
      </View>

      {showQueue ? (
        <View style={styles.queuePanel}>
          <Text style={styles.queueTitle}>Up Next</Text>
          <View style={styles.queueList}>
            {(currentTrack
              ? queue
              : songs
            ).map((song, idx) => (
              <SongListItem
                key={song.id}
                song={song}
                index={idx + 1}
                showIndex
                queue={queue}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.artworkWrap}>
            {currentTrack?.artwork ? (
              <Image
                source={{ uri: currentTrack.artwork }}
                style={styles.artwork}
              />
            ) : (
              <View style={[styles.artwork, styles.artworkPlaceholder]}>
                <MusicNoteIcon size={64} color={colors.textMuted} />
              </View>
            )}
          </View>

          <View style={styles.trackInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack?.title ?? 'No Track'}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack?.artist ?? 'Tap a song to start'}
            </Text>
          </View>

          {isPlaying && currentTrack ? (
            <View style={styles.beatBarWrap}>
              <BeatBar
                uri={currentTrack.url}
                bars={28}
                height={48}
                color={colors.primary}
              />
            </View>
          ) : null}

          <View style={styles.progressRow}>
            <Text style={styles.time}>{formatTime(displayPosition)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={safeDuration || 1}
              value={Math.min(displayPosition, safeDuration || 1)}
              onSlidingStart={() => setScrubbing(true)}
              onValueChange={(v: number) => setScrubValue(v)}
              onSlidingComplete={async (v: number) => {
                await seekTo(v);
                setScrubbing(false);
              }}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
              disabled={!currentTrack}
            />
            <Text style={styles.time}>{formatTime(safeDuration)}</Text>
          </View>

          <View style={styles.controls}>
            <Pressable
              onPress={toggleShuffle}
              hitSlop={12}
              style={styles.sideControl}
            >
              <ShuffleIcon color={shuffle ? colors.primary : colors.textSecondary} />
            </Pressable>

            <Pressable onPress={skipToPrevious} hitSlop={12} style={styles.controlBtn}>
              <PrevIcon size={42} color={colors.white} />
            </Pressable>

            <Pressable
              onPress={togglePlayback}
              hitSlop={12}
              style={styles.playBtn}
              android_ripple={{ color: colors.primaryDark }}
            >
              {isPlaying ? (
                <PauseIcon size={34} color={colors.white} />
              ) : (
                <PlayIcon size={34} color={colors.white} />
              )}
            </Pressable>

            <Pressable onPress={skipToNext} hitSlop={12} style={styles.controlBtn}>
              <NextIcon size={42} color={colors.white} />
            </Pressable>

            <Pressable onPress={cycleRepeat} hitSlop={12} style={styles.sideControl}>
              <RepeatIcon
                color={
                  repeat !== RepeatMode.Off ? colors.primary : colors.textSecondary
                }
              />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  topBarTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  artworkWrap: {
    alignSelf: 'center',
    marginBottom: 40,
  },
  artwork: {
    width: 320,
    height: 320,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  artworkPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 6,
    textAlign: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  beatBarWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
    height: 40,
  },
  time: {
    color: colors.textSecondary,
    fontSize: 12,
    width: 44,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  sideControl: {
    padding: 10,
  },
  controlBtn: {
    padding: 6,
  },
  playBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  queuePanel: {
    flex: 1,
    paddingTop: 8,
  },
  queueTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  queueList: {
    flex: 1,
  },
});
