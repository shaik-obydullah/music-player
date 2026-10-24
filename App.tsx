/**
 * Music Player
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { PlayerProvider } from './src/player/PlayerContext';
import { DeviceLibraryProvider } from './src/services/deviceLibrary';
import { colors } from './src/theme/colors';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
  },
};

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DeviceLibraryProvider>
          <PlayerProvider>
            <NavigationContainer ref={navigationRef} theme={navTheme}>
              <StatusBar
                barStyle="light-content"
                backgroundColor={colors.background}
              />
              <RootNavigator />
            </NavigationContainer>
          </PlayerProvider>
        </DeviceLibraryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
