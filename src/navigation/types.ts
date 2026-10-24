import { Song } from '../data/songs';

export type RootStackParamList = {
  MainTabs: undefined;
  Player: { song?: Song; queue?: Song[] } | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
};
