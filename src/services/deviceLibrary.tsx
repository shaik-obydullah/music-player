import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { Song } from '../data/songs';
import { scanDeviceTracks, deviceTrackToSong } from './audioLibrary';

interface DeviceLibraryValue {
  songs: Song[];
  loading: boolean;
  scanning: boolean;
  rescan: () => Promise<void>;
}

const DeviceLibraryContext = createContext<DeviceLibraryValue | null>(null);

export function DeviceLibraryProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const scanningRef = useRef(false);

  const scan = useCallback(async (manual = false) => {
    if (scanningRef.current) {
      return;
    }
    scanningRef.current = true;
    if (manual) {
      setScanning(true);
    }
    try {
      const tracks = await scanDeviceTracks();
      setSongs(tracks.map(deviceTrackToSong));
    } finally {
      scanningRef.current = false;
      setScanning(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    scan(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rescan = useCallback(async () => {
    await scan(true);
  }, [scan]);

  const value = useMemo(
    () => ({ songs, loading, scanning, rescan }),
    [songs, loading, scanning, rescan],
  );

  return (
    <DeviceLibraryContext.Provider value={value}>
      {children}
    </DeviceLibraryContext.Provider>
  );
}

export function useDeviceLibrary() {
  const ctx = useContext(DeviceLibraryContext);
  if (!ctx) {
    throw new Error('useDeviceLibrary must be used within a DeviceLibraryProvider');
  }
  return ctx;
}
