# 🎵 Music Player

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.76.6-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Native" />
  <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android" />
  <img src="https://img.shields.io/badge/TypeScript-5.0.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Offline%20First-✓-success?style=flat-square" alt="Offline First" />
  <img src="https://img.shields.io/badge/SD%20Card%20Support-✓-success?style=flat-square" alt="SD Card Support" />
  <img src="https://img.shields.io/badge/MediaStore%20Scanning-✓-success?style=flat-square" alt="MediaStore Scanning" />
  <img src="https://img.shields.io/badge/FFT%20Visualizer-✓-success?style=flat-square" alt="FFT Visualizer" />
</p>

A native Android music player built with React Native, designed for offline playback of local audio files. Built and tested for the Samsung Galaxy Tab SM-T295 (Android 11 / SDK 30), it scans and plays music from both internal storage and SD cards. 

## ✨ Features

- **📂 Local Library Scanning** - Automatically scans all audio files from internal and external storage via Android's MediaStore (including SD cards)
- **🎛️ Full Playback Controls** - Play, pause, skip, seek, shuffle, and repeat (off/track/queue) powered by [react-native-track-player](https://react-native-track-player.js.org/)
- **🖼️ Album Art** - Displays real album artwork pulled from MediaStore
- **📱 Tabbed Navigation** - Home, Library, and Search tabs with a shared device library
- **🎧 Mini & Full Player** - Persistent mini player at the bottom with a full-screen player view
- **📊 Beat Bar Visualizer** - Real-time, FFT-based beat visualization synced to playback. Decodes audio files directly for reliable visualization on devices where the Android Visualizer API is restricted
- **✈️ Offline First** - No internet connection required. All music is sourced from device storage


## 🛠️ Tech Stack

| Technology | Version | Purpose |
| --- | --- | --- |
| [![React Native](https://img.shields.io/badge/React%20Native-0.76.6-61DAFB?logo=react)](https://reactnative.dev/) | 0.76.6 | Core framework |
| [![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://react.dev/) | 18.3.1 | UI library |
| [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-3178C6?logo=typescript)](https://www.typescriptlang.org/) | 5.0.4 | Type safety |
| [react-native-track-player](https://react-native-track-player.js.org/) | 4.1.2 | Audio playback engine |
| [React Navigation](https://reactnavigation.org/) | 7.x | Navigation (Bottom Tabs + Native Stack) |
| [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) | 2.20.2 | Gesture handling |
| [react-native-svg](https://github.com/react-native-svg/react-native-svg) | 15.8.0 | SVG icons |
| [@react-native-community/slider](https://github.com/callstack/react-native-slider) | 5.2.1 | Seek bar |

### 🔌 Native Modules
- **🎵 AudioLibrary** (`AudioLibraryModule.kt`) - MediaStore scanning for all audio files and app metadata
- **📈 AudioVisualizer** (`VisualizerModule.kt`) - MediaCodec-based audio decoding with FFT analysis for beat visualization


## 📁 Project Structure

```
music-player/
├── android/                # Native Android code (Kotlin/Java)
├── src/
│   ├── components/         # Reusable UI components (BeatBar, MiniPlayer, etc.)
│   ├── data/              # Type definitions (Song interface)
│   ├── navigation/        # React Navigation setup
│   ├── player/            # TrackPlayer setup, context, and playback service
│   ├── screens/           # App screens (Home, Library, Search, Player)
│   ├── services/          # JS wrappers for native modules & device library
│   └── theme/             # Colors and styling
├── App.tsx                # App entry point
└── index.js               # React Native registration
```


## 📋 Prerequisites

- [![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/) >= 18
- [![Docker](https://img.shields.io/badge/Docker-Required-2496ED?logo=docker&logoColor=white)](https://www.docker.com/) (for building via the provided Android build environment)
- [![ADB](https://img.shields.io/badge/ADB-Android%20Debug%20Bridge-3DDC84?logo=android)](https://developer.android.com/tools/adb)
- An Android device with USB debugging enabled (tested on Samsung Galaxy Tab SM-T295)


## 🚀 Development Setup

### 💻 Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the Metro bundler:
```bash
npm start
```

3. Run on Android:
```bash
npm run android
```

4. Type check and lint:
```bash
npx tsc --noEmit && npx eslint src --ext .tsx,.ts
```


## 🔨 Building & Installing

This project uses a Docker-based Android build environment for consistent builds. 

### 🐳 Environment Details
- Container: `music_android_env` (from `mobile-pos-android_env:latest`)
- JDK 17 at `/opt/java/openjdk`
- Android SDK at `/opt/android-sdk` (platform 36, build-tools 36, NDK 27.1)
- Node 20
- ADB server port: `5038` (to avoid conflicts with host ADB)

### 📦 Build Release APK
```bash
docker exec music_android_env bash -lc 'cd /app/android && ./gradlew :app:assembleRelease --no-daemon'
```

The APK will be output to `android/app/build/outputs/apk/release/app-release.apk`.

### 📲 Install & Launch on Device
```bash
# Install APK
docker exec -e ANDROID_ADB_SERVER_PORT=5038 music_android_env adb install -r /app/android/app/build/outputs/apk/release/app-release.apk

# Grant storage permissions
docker exec -e ANDROID_ADB_SERVER_PORT=5038 music_android_env adb shell pm grant com.musicplayer android.permission.READ_EXTERNAL_STORAGE

# Launch app
docker exec -e ANDROID_ADB_SERVER_PORT=5038 music_android_env adb shell am force-stop com.musicplayer
docker exec -e ANDROID_ADB_SERVER_PORT=5038 music_android_env adb shell am start -n com.musicplayer/.MainActivity
```


## ⚙️ Configuration Notes

- **🧬 New Architecture**: Disabled (`newArchEnabled=false`) for compatibility with `react-native-track-player@4.1.2`
- **⚡ Hermes**: Enabled for improved performance
- **📛 Package Name**: `com.musicplayer`
- **🎯 Compile/Target SDK**: 36
- **🔐 Permissions**: Only `READ_EXTERNAL_STORAGE` is required. `RECORD_AUDIO` is not needed (visualizer uses file decoding)


## 🔍 Troubleshooting

| Issue | Solution |
| --- | --- |
| 📱 Device not detected after reconnecting USB | USB device nodes can go stale in Docker. Run `docker compose up -d --force-recreate` and re-accept the USB debugging prompt. |
| 🎶 Songs not showing after pushing files | MediaStore may not index new files. Trigger a scan: `adb shell content call --uri content://media/none/media_scanner --method scan_volume --arg external_primary` |
| 🚪 App opens to wrong screen on launch | The app initializes the player without auto-queuing songs and only opens the full player when playback starts. |
| 📊 Visualizer not working on some devices | The app uses file decoding (MediaCodec + FFT) rather than the Android Visualizer API, as OEMs often block live capture. |


## 👨‍💻 Credits

- **Developer**: Shaik Obydullah
- **Version**: 1.0.0
- **Package**: `com.musicplayer`
