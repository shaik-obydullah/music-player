import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../theme/colors';

interface IconProps {
  size?: number;
  color?: string;
}

export function PlayIcon({ size = 24, color = colors.white }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" fill={color} />
    </Svg>
  );
}

export function PauseIcon({ size = 24, color = colors.white }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 5a1 1 0 0 1 2 0v14a1 1 0 1 1-2 0V5zm8 0a1 1 0 0 1 2 0v14a1 1 0 1 1-2 0V5z" fill={color} />
    </Svg>
  );
}

export function NextIcon({ size = 24, color = colors.white }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 5.4v13.2a1 1 0 0 0 1.54.84l10-6.6a1 1 0 0 0 0-1.68l-10-6.6A1 1 0 0 0 6 5.4z" fill={color} />
      <Path d="M18 5h-1.5A1 1 0 0 0 18 5zm0 14a1.5 1.5 0 1 1-3 0V5a1.5 1.5 0 0 1 3 0v14z" fill={color} />
    </Svg>
  );
}

export function PrevIcon({ size = 24, color = colors.white }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ transform: [{ scaleX: -1 }] }}>
      <Path d="M6 5.4v13.2a1 1 0 0 0 1.54.84l10-6.6a1 1 0 0 0 0-1.68l-10-6.6A1 1 0 0 0 6 5.4z" fill={color} />
      <Path d="M18 5h-1.5A1 1 0 0 0 18 5zm0 14a1.5 1.5 0 1 1-3 0V5a1.5 1.5 0 0 1 3 0v14z" fill={color} />
    </Svg>
  );
}

export function ShuffleIcon({ size = 22, color = colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 4h3v3M4 20l16-16M4 4h3l6 6M20 17v3h-3M14 14l6 6M20 8V5h-3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function RepeatIcon({ size = 22, color = colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 2l4 4-4 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 13v2a4 4 0 0 1-4 4H3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 24, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SearchIcon({ size = 22, color = colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={2} />
      <Path d="M20 20l-3.5-3.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function HomeIcon({ size = 24, color = colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6a1 1 0 0 0-1-1H10a1 1 0 0 0-1 1v6H4a1 1 0 0 1-1-1v-10.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function LibraryIcon({ size = 24, color = colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

export function MusicNoteIcon({ size = 22, color = colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth={2} />
      <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function HeartIcon({ size = 22, color = colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5c0 6.1-8 11-8 11z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

export function MoreIcon({ size = 22, color = colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Circle cx="5" cy="12" r="2" fill={color} />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Circle cx="19" cy="12" r="2" fill={color} />
    </Svg>
  );
}
