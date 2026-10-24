import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SongListItem from '../components/SongListItem';
import MiniPlayer from '../components/MiniPlayer';
import { SearchIcon } from '../components/icons';
import { Song } from '../data/songs';
import { colors } from '../theme/colors';
import { usePlayer } from '../player/PlayerContext';
import { useDeviceLibrary } from '../services/deviceLibrary';
import { getAppInfo, AppInfo } from '../services/audioLibrary';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const { playSong } = usePlayer();
  const { songs } = useDeviceLibrary();
  const [query, setQuery] = useState('');
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);

  useEffect(() => {
    let mounted = true;
    getAppInfo().then(info => {
      if (mounted) setAppInfo(info);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {return songs;}
    return songs.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q),
    );
  }, [query, songs]);

  const handleSongPress = (song: Song) => {
    playSong(song, songs);
    navigation.navigate('Player', { song });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <View style={styles.searchIcon}>
          <SearchIcon size={20} color={colors.textMuted} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Songs, artists, albums"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <SongListItem
            song={item}
            index={index + 1}
            showIndex
            queue={songs}
            onPress={handleSongPress}
          />
        )}
        ListHeaderComponent={
          <Text style={styles.header}>
            {query.trim() ? `${results.length} results` : 'Browse All'}
          </Text>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No songs found for "{query}"</Text>
        }
        ListFooterComponent={
          <View style={styles.aboutWrap}>
            <Text style={styles.aboutTitle}>About</Text>
            <View style={styles.aboutCard}>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>App</Text>
                <Text style={styles.aboutValue}>Music Player</Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Version</Text>
                <Text style={styles.aboutValue}>
                  {appInfo?.versionName ?? '…'}
                </Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Developer</Text>
                <Text style={styles.aboutValue}>Shaik Obydullah</Text>
              </View>
            </View>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  header: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
  aboutWrap: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  aboutTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  aboutLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  aboutValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
