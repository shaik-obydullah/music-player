import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';

import { Song } from '../data/songs';
import { colors } from '../theme/colors';
import { MoreIcon, MusicNoteIcon, PauseIcon, PlayIcon } from './icons';
import { usePlayer } from '../player/PlayerContext';

interface SongListItemProps {
  song: Song;
  index?: number;
  queue?: Song[];
  showIndex?: boolean;
  isCurrent?: boolean;
  onPress?: (song: Song) => void;
  onMore?: (song: Song) => void;
}

export default function SongListItem({
  song,
  index,
  queue,
  showIndex = false,
  isCurrent = false,
  onPress,
  onMore,
}: SongListItemProps) {
  const { isPlaying, currentTrack, playSong, togglePlayback } = usePlayer();

  const isThisCurrent = isCurrent || currentTrack?.id === song.id;

  const handlePress = (_e: GestureResponderEvent) => {
    if (onPress) {
      onPress(song);
    } else if (isThisCurrent && currentTrack?.id === song.id) {
      togglePlayback();
    } else {
      playSong(song, queue ?? [song]);
    }
  };

  return (
    <Pressable
      style={styles.item}
      onPress={handlePress}
      android_ripple={{ color: colors.border }}
    >
      {showIndex && !isThisCurrent ? (
        <View style={styles.indexWrap}>
          <Text style={styles.indexText}>{index ?? ''}</Text>
        </View>
      ) : (
        <View style={styles.artworkWrap}>
          {song.artwork ? (
            <Image source={{ uri: song.artwork }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.artworkPlaceholder]}>
              <MusicNoteIcon size={22} color={colors.textMuted} />
            </View>
          )}
          {isThisCurrent && (
            <View style={styles.artworkOverlay}>
              {isPlaying ? (
                <PauseIcon size={26} color={colors.white} />
              ) : (
                <PlayIcon size={26} color={colors.white} />
              )}
            </View>
          )}
        </View>
      )}

      <View style={styles.info}>
        <Text
          style={[styles.title, isThisCurrent && styles.titleActive]}
          numberOfLines={1}
        >
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>

      <Text style={styles.duration}>{song.duration}</Text>

      {onMore && (
        <Pressable
          onPress={() => onMore(song)}
          hitSlop={12}
          style={styles.moreBtn}
        >
          <MoreIcon size={20} color={colors.textMuted} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  indexWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  artworkWrap: {
    width: 52,
    height: 52,
    marginRight: 12,
  },
  artwork: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
  },
  artworkPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  titleActive: {
    color: colors.primary,
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  duration: {
    color: colors.textMuted,
    fontSize: 13,
    marginHorizontal: 8,
  },
  moreBtn: {
    padding: 4,
  },
});
