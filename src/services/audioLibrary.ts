import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

import { Song } from '../data/songs';

export interface DeviceTrack {
  id: string;
  uri: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  duration: number;
  path: string;
}

export const MUSIC_FOLDER = '/storage/emulated/0/Music';

async function requestStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Music access',
        message: 'Allow music access to scan your audio files.',
        buttonPositive: 'Allow',
        buttonNegative: 'Cancel',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    return false;
  }
}

export async function scanDeviceTracks(): Promise<DeviceTrack[]> {
  const hasPermission = await requestStoragePermission();
  if (!hasPermission) return [];

  try {
    const audioLibrary = NativeModules.AudioLibrary;
    if (!audioLibrary) return [];

    const tracks: DeviceTrack[] = await audioLibrary.getDeviceTracks(
      MUSIC_FOLDER,
    );
    return tracks ?? [];
  } catch (e) {
    console.warn('Failed to scan device tracks', e);
    return [];
  }
}

export function deviceTrackToSong(track: DeviceTrack): Song {
  return {
    id: `device-${track.id}`,
    title: track.title,
    artist: track.artist,
    album: track.album,
    artwork: track.artwork || '',
    url: track.uri,
    duration: formatDuration(track.duration),
  };
}

function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export interface AppInfo {
  versionName: string;
  versionCode: number;
  version: string;
}

export async function getAppInfo(): Promise<AppInfo | null> {
  try {
    const audioLibrary = NativeModules.AudioLibrary;
    if (!audioLibrary?.getAppInfo) return null;
    const info = await audioLibrary.getAppInfo();
    return info ?? null;
  } catch (e) {
    console.warn('Failed to get app info', e);
    return null;
  }
}
