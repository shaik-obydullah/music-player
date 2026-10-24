import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { usePlayer } from '../player/PlayerContext';
import { colors } from '../theme/colors';
import { NextIcon, PauseIcon, PlayIcon, MusicNoteIcon } from './icons';
import BeatBar from './BeatBar';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlayback, skipToNext } = usePlayer();
  const navigation = useNavigation<Nav>();

  if (!currentTrack) {return null;}

  return (
    <Pressable
      style={styles.container}
      onPress={() => navigation.navigate('Player')}
      android_ripple={{ color: colors.border }}
    >
      <View style={styles.progressBar} />
      {currentTrack?.artwork ? (
        <Image
          source={{ uri: currentTrack.artwork }}
          style={styles.artwork}
        />
      ) : (
        <View style={[styles.artwork, styles.placeholder]}>
          <MusicNoteIcon size={20} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {currentTrack?.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentTrack?.artist}
        </Text>
      </View>
      <Pressable onPress={togglePlayback} hitSlop={12} style={styles.playBtn}>
        {isPlaying ? (
          <PauseIcon size={26} color={colors.white} />
        ) : (
          <PlayIcon size={26} color={colors.white} />
        )}
      </Pressable>
      {isPlaying ? (
        <BeatBar
          uri={currentTrack?.url ?? ''}
          bars={12}
          height={22}
          color={colors.primary}
        />
      ) : null}
      <Pressable onPress={skipToNext} hitSlop={12} style={styles.nextBtn}>
        <NextIcon size={24} color={colors.textMuted} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  playBtn: {
    padding: 8,
  },
  nextBtn: {
    padding: 8,
  },
});
