# AGENTS.md — Music Player (React Native)

Project state and instructions for resuming work on this music player app for the
user's Samsung Galaxy tablet (SM-T295, Android 11 / SDK 30).

## Where things are

- Project root: `.../Software Development/music-player/MusicPlayer` (RN 0.76.6, React 18.3.1, TypeScript)
- Build environment: Docker. Running container `music_android_env` from image `mobile-pos-android_env:latest`.
  JDK 17 at `/opt/java/openjdk`, Android SDK at `/opt/android-sdk` (platform 36 / build-tools 36 / NDK 27.1), Node 20, privileged, host networking.
- `docker-compose.yml` runs with `ANDROID_ADB_SERVER_PORT=5038` (avoids clashing with host root adb on 5037 and POS Metro on 8081).
- Not a git repo.

## Commands

```bash
# Build release APK (embeds Hermes JS bundle, runs standalone — no Metro needed)
docker exec music_android_env bash -lc 'cd /app/android && ./gradlew :app:assembleRelease --no-daemon'

# Install / launch on the tablet
docker exec -e ANDROID_ADB_SERVER_PORT=5038 music_android_env adb install -r /app/android/app/build/outputs/apk/release/app-release.apk
docker exec -e ANDROID_ADB_SERVER_PORT=5038 music_android_env adb shell pm grant com.musicplayer android.permission.READ_EXTERNAL_STORAGE
docker exec -e ANDROID_ADB_SERVER_PORT=5038 music_android_env adb shell am force-stop com.musicplayer
docker exec -e ANDROID_ADB_SERVER_PORT=5038 music_android_env adb shell am start -n com.musicplayer/.MainActivity

# JS typecheck / lint
cd MusicPlayer && npx tsc --noEmit && npx eslint src --ext .tsx,.ts
```

## Key settings / facts

- `android/gradle.properties`: `newArchEnabled=false`, `hermesEnabled=true`.
  New Architecture is disabled because `react-native-track-player@4.1.2` crashes on RN 0.76 New Architecture.
- `build.gradle`: compileSdk 36 / buildTools 36 / targetSdk 36 / NDK 27.1.
- Package name: `com.musicplayer`.
- Deps: `react-native-track-player@4.1.2`, `@react-navigation/*`, `react-native-gesture-handler@2.20.2`,
  `react-native-screens@4.4.0`, `react-native-safe-area-context@4.14.0`, `react-native-svg@15.8.0`,
  `@react-native-community/slider@5.2.1`. (Versions pinned to work with RN 0.76 codegen.)
- Tablet storage: MyFirstSong.mp3 / MySecondSong.mp3 on **internal** `/storage/emulated/0/Music`;
  the user's real 158 songs are on the **SD card** at `/storage/678B-1DEE/Music/Music/...`.

## Architecture (key files)

- `src/player/PlayerContext.tsx` — playback state, `playSong`, auto-open-to-full-player effect, init guard.
- `src/player/playerService.ts` — `setupPlayer`, `addTracks`, `initializePlayer`.
- `src/player/playback-service.ts` — TrackPlayer remote events (registered in `index.js`).
- `src/services/audioLibrary.ts` — JS wrapper for `NativeModules.AudioLibrary`; `deviceTrackToSong()`.
- `android/app/src/main/java/com/musicplayer/AudioLibraryModule.kt` — native MediaStore scan (now scans ALL audio, internal + SD card, via `content://media/external/audio/media/<id>`).
- `android/app/src/main/java/com/musicplayer/VisualizerModule.kt` — native `AudioVisualizer`; decodes audio to PCM + FFT, emits `AudioVisualizerFrames` events.
- `src/services/audioVisualizer.ts` — JS wrapper for `NativeModules.AudioVisualizer` (request/subscribe/cache).
- `src/components/BeatBar.tsx` — animated FFT beat bars, synced to playback position.
- `src/screens/HomeScreen.tsx` — "Songs on This Device" section (scans device audio), plus sample-song sections.
- `src/navigation/{RootNavigator,navigationRef,types}.ts*` — bottom tabs (Home/Library/Search) + full-screen Player stack modal; `navigateToPlayer()`.
- `App.tsx` — wires `navigationRef`, `PlayerProvider`, `NavigationContainer`.

## Completed work

### Refactor — removed online sample songs (all tabs now use real device songs; COMPLETE & verified)
- User: "some songs not playing like Midnight Drive" → those were the 10 online SoundHelix sample songs
  in `src/data/songs.ts`, which need internet. The tablet is usually offline (`Active default network: none`),
  so they failed. User chose to remove the online samples entirely and drive all tabs from real device songs.
- `src/data/songs.ts` now exports ONLY the `Song` interface (no sample data).
- New `src/services/deviceLibrary.tsx` — `DeviceLibraryProvider` + `useDeviceLibrary()`: scans device tracks
  once on mount, holds `{ songs, loading, scanning, rescan }`, mapped via `deviceTrackToSong`. Wrapped around
  `PlayerProvider` in `App.tsx`.
- All tabs now use the shared device library: Home (only "Songs on This Device section"), Library
  (stats + artists grouped from real songs), Search (searches real songs), PlayerScreen queue fallback.
- `PlayerContext.playSong(song, queue)` now REQUIRES an explicit `queue` (removed `= songs` default);
  `queueRef` starts `[]`. `playerService.ts`: removed legacy `addTracks`/`addAndPlay` + `songs` import.
- `SongListItem.playSong(song, queue ?? [song])` guards undefined queue.
- Verified on-device: Home shows the real device songs (Akash Jane Ki, Baila Conmigo, Bana Sharabi …).

### About section (COMPLETE & verified)
- An "About" card (App = Music Player, Version, Developer) shows at the bottom of the **Search** tab
  (moved there from Home at the user's request: "move the about after search tab"). It is rendered as the
  about `ListFooterComponent` of the Search screen's FlatList, after all song results.
- `AudioLibraryModule.kt` gained `getAppInfo(promise)` (returns `versionName`, `versionCode`, `version` from PackageInfo).
- `audioLibrary.ts` gained JS wrapper `getAppInfo(): Promise<AppInfo | null>`.
- SearchScreen loads it on mount and shows developer name **Shaik Obydullah** (user's name).
- Verified on-device: About / Version 1.0 / Developer Shaik Obydullah visible after scrolling Search to the bottom.

### Music Player header + spacing (COMPLETE & verified)
- Added a branded "Music Player" title at the top of HomeScreen (above "Good Evening"),
  plus extra vertical spacing between the header block and the songs section.

### Bug 1 — SD card songs not shown (FIXED & verified)
- Root cause: the native scan filtered to the internal `/storage/emulated/0/Music` folder only, so the 158 SD-card songs were never returned.
- Fix: `AudioLibraryModule.kt` now queries the whole MediaStore with no folder filter
  (returns all audio from internal + SD card; content URIs are playable by ExoPlayer).
- VERIFIED on-device: the app shows "Songs on This Device" listing the SD card songs.

### Bug 2 — device songs don't play / player showed "No Track" (COMPLETE — crash AND album art both fixed and verified)
- Root cause (from `[playSong]` diagnostics in logcat):
  `deviceTrackToSong()` set `artwork: ''`; `TrackPlayer.add()` rejected an empty-string artwork,
  so the whole queue failed to add and nothing played ("No Track").
- Crash fix (VERIFIED working on-device):
  - `PlayerContext.tsx` `playSong` add-mapping uses `...(t.artwork ? { artwork: t.artwork } : {})`.
  - `playerService.ts` `addTracks` does the same with `song.artwork`.
  - All 13 temporary `[playSong]` diagnostic `console.log` lines removed (Passed tsc + eslint).
  - Tap "Baila Conmigo": playback starts, position advances (0:03->0:12), mini player bar appears,
    full player shows correct track.
- Album-art fix (VERIFIED working on-device — this was the user's follow-up "artwork is not fixed"):
  - `AudioLibraryModule.kt` now includes `MediaStore.Audio.Media.ALBUM_ID` in the projection and builds
    a `content://media/external/audio/albumart/<album_id>` content URI per track, returned as `artwork`.
  - `audioLibrary.ts` `DeviceTrack` gains an `artwork` field; `deviceTrackToSong()` passes it through
    (`track.artwork || ''`) instead of hardcoding `''`.
  - On-device logcat shows Baila Conmigo loading `artwork=Icon(typ=BITMAP size=500x500)` (was 64x64
    placeholder), and the full-player UI now renders a real ImageView in the artwork area instead of
    the SVG placeholder. (Note: React Native `Image` with a `content://media` albumart URI decodes fine.)
- Also fixed the startup issue where the app opened on the stale Player screen (VERIFIED):
  - `App.tsx` no longer calls `initializePlayer()` directly.
  - `PlayerContext.tsx` runs `initializePlayer()` in a mount effect, guarded by an `initializedRef`.
  - `initializePlayer()` now calls `TrackPlayer.reset()` instead of auto-adding/playing the sample queue.
  - Cold start opens on Home (Home tab selected), no jump to stale Player.

### Feature — beat-bar visualizer in mini player (COMPLETE & verified working on-device)

Real FFT bar visualization in the mini player, driven by decoding each song's actual audio.

Background: an Android `Visualizer` (real-time live capture) does NOT work on this Samsung Tab —
Samsung routes audio through a "processed/secure" stage (`AudioEffectStageModule`/`secFlag`) that
blocks `Visualizer` capture, AND ExoPlayer's audio session is rebuilt/unstable. So live capture on
session 0 or the ExoPlayer session both yielded zero data. Instead we **decode the file and compute
a real FFT**, which is reliable on this device.

- `android/.../com/musicplayer/VisualizerModule.kt` (native module `AudioVisualizer`):
  - `analyze(uri, bars)` — `MediaExtractor` + `MediaCodec` decode the file to PCM on a background
    thread, downmix to mono, resample to 8 kHz, then run an in-Kotlin radix-2 FFT over 2048-sample
    windows (hop 2000; ~4 frames/sec) collapsing to `bars` log-scaled amplitude buckets (0..255).
  - **Memory-safe**: resamples/downmixes to 8 kHz mono STREAMING (per decoded buffer) into a bounded
    `ShortArray` (cap ~3M samples). Decoding at full source rate into one big buffer OOMs on long
    songs (fixed bug: 6.5-min track triggered `OutOfMemoryError` ~67MB). First decode of a ~6.5-min
    song takes ~2 min on-device (one-time per song; cached in JS).
  - Emits a single `AudioVisualizerFrames` event `{ uri, bars, frames }` via `RCTDeviceEventEmitter`
    on the UI thread (`runOnUiQueueThread`). NOTE: resolving a `Promise` from a raw background
    `Thread` was unreliable (never reached JS); the event-emitter path works, so use events, not
    promises, for background work here.
  - Kept the old `start/stop` (live Visualizer) approach removed; `RECORD_AUDIO`/`MODIFY_AUDIO_SETTINGS`
    are NOT required and were NOT added to the manifest.
- `src/services/audioVisualizer.ts` — `request(uri, bars)` (fires native decode), `subscribe()`
  (event listener), per-song in-memory cache keyed by `bars:uri` so replays don't re-decode.
- `src/components/BeatBar.tsx` — requests/analyzes the provided `uri`, subscribes for frames,
  animates `bars` (`Animated.Value` scaleY, fast rise / slow fall) to `frames[floor(position*4)]`
  using `useProgress().position` for playback-synced, song-accurate bars.
- `src/components/MiniPlayer.tsx` — renders `BeatBar` (12 bars) when `isPlaying`, passing `currentTrack.url`.
- `src/screens/PlayerScreen.tsx` — "Now Playing" screen; renders a `BeatBar` (28 bars) below the
  track info when playing.

### Next steps (all Bug-1/Bug-2 work done; visualizer feature complete)
1. (Optional) Remove/decide on the sample internet songs in `src/data/songs.ts` and the samples
   listed in HomeScreen sections, since the user wants to play their own local files (158 SD-card songs
   are now listed and playable with cover art).

## Gotchas / environment notes
- When the tablet re-enumerates on USB (device number changes), the container's `/dev/bus/usb`
  goes stale. Fix: `docker compose up -d --force-recreate` to repopulate device nodes, then re-accept
  the on-screen "allow" prompt / poll until `adb devices` shows `device`.
- MediaStore may not index files pushed via `adb push`; trigger a scan
  (`adb shell content call --uri content://media/none/media_scanner --method scan_volume --arg external_primary`).
- Read permission is pre-granted via `pm grant ... READ_EXTERNAL_STORAGE` for testing.
- Remote UI testing: dump via `adb shell uiautomator dump /sdcard/f.xml` then read the file;
  tap via `adb shell input tap X Y` using bounds from a `content-desc`/clickable node.
  Some text nodes are marked invisible when scrolled off-screen (negative boundsInScreen Y) — scroll first.
