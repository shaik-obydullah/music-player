import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode,
  useTrackPlayerEvents,
} from 'react-native-track-player';

export async function setupPlayer() {
  try {
    await TrackPlayer.getActiveTrackIndex();
  } catch {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });
  }

  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause],
    progressUpdateEventInterval: 1,
  });

  TrackPlayer.setRepeatMode(RepeatMode.Queue);
}

export function parseDuration(duration: string): number {
  const [m, s] = duration.split(':').map(Number);
  return (m || 0) * 60 + (s || 0);
}

export async function initializePlayer() {
  await setupPlayer();
  await TrackPlayer.reset();
}

export function usePlaybackEvents(listener: (event: any) => void) {
  const events = [
    Event.PlaybackActiveTrackChanged,
    Event.PlaybackState,
    Event.PlaybackProgressUpdated,
  ];
  useTrackPlayerEvents(events, listener);
}

export default TrackPlayer;
