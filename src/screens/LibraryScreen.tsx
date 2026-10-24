import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SongListItem from '../components/SongListItem';
import MiniPlayer from '../components/MiniPlayer';
import { Song } from '../data/songs';
import { colors } from '../theme/colors';
import { usePlayer } from '../player/PlayerContext';
import { useDeviceLibrary } from '../services/deviceLibrary';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LibraryScreen() {
  const navigation = useNavigation<Nav>();
  const { playSong } = usePlayer();
  const { songs } = useDeviceLibrary();

  const artists = useMemo(() => {
    const map = new Map<string, Song[]>();
    songs.forEach(s => {
      const list = map.get(s.artist) ?? [];
      list.push(s);
      map.set(s.artist, list);
    });
    return Array.from(map.entries());
  }, [songs]);

  const handleSongPress = (song: Song, queue: Song[]) => {
    playSong(song, queue);
    navigation.navigate('Player', { song, queue });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Your Library</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{songs.length}</Text>
            <Text style={styles.statLabel}>Songs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{artists.length}</Text>
            <Text style={styles.statLabel}>Artists</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        {artists.map(([artist, artistSongs]) => (
          <View key={artist} style={styles.artistSection}>
            <Text style={styles.artistName}>{artist}</Text>
            {artistSongs.map(song => (
              <SongListItem
                key={song.id}
                song={song}
                queue={songs}
                onPress={s => handleSongPress(s, songs)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  artistSection: {
    marginTop: 8,
  },
  artistName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
});
