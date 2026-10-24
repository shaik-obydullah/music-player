import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SongListItem from '../components/SongListItem';
import MiniPlayer from '../components/MiniPlayer';
import { Song } from '../data/songs';
import { colors } from '../theme/colors';
import { usePlayer } from '../player/PlayerContext';
import { RootStackParamList } from '../navigation/types';
import { useDeviceLibrary } from '../services/deviceLibrary';
import { MusicNoteIcon } from '../components/icons';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { playSong } = usePlayer();
  const { songs, loading, scanning, rescan } = useDeviceLibrary();

  const playFromList = (song: Song, queue: Song[]) => {
    playSong(song, queue);
    navigation.navigate('Player', { song, queue });
  };

  const handleDevicePress = (song: Song) => {
    if (songs.length) {
      playFromList(song, songs);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>Music Player</Text>
        <Text style={styles.greeting}>Good Evening</Text>
        <Text style={styles.title}>Listen Something New</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Songs on This Device</Text>
            <Pressable onPress={rescan} hitSlop={8}>
              <Text style={styles.scanText}>
                {scanning ? 'Scanning…' : 'Rescan'}
              </Text>
            </Pressable>
          </View>

          {loading || (scanning && songs.length === 0) ? (
            <View style={styles.emptyBox}>
              <MusicNoteIcon size={20} color={colors.textMuted} />
              <Text style={styles.emptyText}>Scanning your Music folder…</Text>
            </View>
          ) : songs.length === 0 ? (
            <View style={styles.emptyBox}>
              <MusicNoteIcon size={20} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                No audio files found on this device. Add MP3s, then tap
                Rescan.
              </Text>
            </View>
          ) : (
            songs.map(song => (
              <SongListItem
                key={song.id}
                song={song}
                queue={songs}
                onPress={handleDevicePress}
              />
            ))
          )}
        </View>
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
  brand: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  scanText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    padding: 14,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
});
