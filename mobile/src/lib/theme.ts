// Single source of truth for colors. Tailwind reads these as CSS variables (see tailwind.config.js);
// JS-only consumers (tab bar, calendar, gradients, spinners) use useThemeColors().
import { vars } from 'nativewind';
import { useColorScheme } from 'react-native';

export const PALETTE = {
  orange: '#ff9e45',
  gray: '#e0dfdd',
  lightBlue: '#96bbd6',
  darkGray: '#8191a1',
  slate: '#455666',
  white: '#ffffff',
  paleBlue: '#e8f0f6',
  mistBlue: '#d6e5f0',
  blueGray: '#c5d7e5',
  steelBlue: '#b3c8d8',
  paper: '#f6f2ea',
  deepBlue: '#6f9cc0',
  oceanLight: '#a7c7de',
  peach: '#ffe2c4',
  butter: '#ffd59e',
  nightOcean: '#141d26',
  nightOceanDeep: '#1b2834',
  nightLand: '#2e3b48',
  nightActive: '#3a5068',
  ember: '#5c4027',
  night: '#1c242c',
  nightSurface: '#2a3540',
  black: '#000000',
} as const;

export type ThemeColors = Record<keyof typeof LIGHT, string>;

const LIGHT = {
  background: PALETTE.paleBlue,
  surface: PALETTE.white,
  border: PALETTE.blueGray,
  text: PALETTE.slate,
  muted: PALETTE.darkGray,
  primary: PALETTE.orange,
  secondary: PALETTE.lightBlue,
  onPrimary: PALETTE.white,
  onImage: PALETTE.white,
  onSecondary: PALETTE.slate,
  overlay: PALETTE.black,
  coinRim: PALETTE.butter,
  tabBar: PALETTE.mistBlue,
  mapOceanTop: PALETTE.lightBlue,
  mapOceanBottom: PALETTE.oceanLight,
  mapGrid: PALETTE.white,
  mapLand: PALETTE.paper,
  mapLandShadow: PALETTE.slate,
  mapBorder: PALETTE.steelBlue,
  mapActive: PALETTE.white,
  mapActiveStroke: PALETTE.deepBlue,
  mapSelected: PALETTE.peach,
};

const DARK: ThemeColors = {
  background: PALETTE.night,
  surface: PALETTE.nightSurface,
  border: PALETTE.slate,
  text: PALETTE.gray,
  muted: PALETTE.darkGray,
  primary: PALETTE.orange,
  secondary: PALETTE.lightBlue,
  onPrimary: PALETTE.white,
  onImage: PALETTE.white,
  onSecondary: PALETTE.slate,
  overlay: PALETTE.black,
  coinRim: PALETTE.butter,
  tabBar: PALETTE.nightSurface,
  mapOceanTop: PALETTE.nightOcean,
  mapOceanBottom: PALETTE.nightOceanDeep,
  mapGrid: PALETTE.white,
  mapLand: PALETTE.nightLand,
  mapLandShadow: PALETTE.black,
  mapBorder: PALETTE.night,
  mapActive: PALETTE.nightActive,
  mapActiveStroke: PALETTE.lightBlue,
  mapSelected: PALETTE.ember,
};

// '#ff9e45' -> '255 158 69', so Tailwind opacity modifiers (bg-primary/30) work.
const toChannels = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');

const toVars = (colors: ThemeColors) =>
  vars(
    Object.fromEntries(
      Object.entries(colors).map(([name, hex]) => [`--color-${name}`, toChannels(hex)]),
    ),
  );

const THEME_VARS = { light: toVars(LIGHT), dark: toVars(DARK) };

export function useThemeColors(): ThemeColors {
  return useColorScheme() === 'dark' ? DARK : LIGHT;
}

export function useThemeVars() {
  return THEME_VARS[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
