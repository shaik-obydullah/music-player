import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import PlayerScreen from '../screens/PlayerScreen';
import { HomeIcon, LibraryIcon, SearchIcon } from '../components/icons';
import { colors } from '../theme/colors';
import { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabIcons({ name, color }: { name: keyof MainTabParamList; color: string }) {
  switch (name) {
    case 'Home':
      return <HomeIcon size={24} color={color} />;
    case 'Search':
      return <SearchIcon size={24} color={color} />;
    case 'Library':
      return <LibraryIcon size={24} color={color} />;
    default:
      return null;
  }
}

function TabLabel({ name, color }: { name: string; color: string }) {
  return <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{name}</Text>;
}

function MainTabs() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarIcon: ({ color }) => (
            <TabIcons name={route.name as keyof MainTabParamList} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <TabLabel name={route.name} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Library" component={LibraryScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
      </Tab.Navigator>
    </View>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_bottom' }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
