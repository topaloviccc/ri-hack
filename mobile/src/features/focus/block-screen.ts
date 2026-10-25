import type { AndroidConfig } from 'expo-app-blocker';

import { PALETTE } from '@/lib/theme';

// {appName} is filled in by the blocker with the blocked app's name.
const TITLES = [
  'Shh… {appName} is napping 😴',
  '{appName} went to get snacks 🍪',
  '{appName} is in timeout 🙈',
  '{appName} is doing homework too 📚',
] as const;

const TITLE_FONT_SIZE_SP = 28;
const TEXT_FONT_SIZE_SP = 18;

/** The block screen's look, with a random title each time blocking starts. */
export function randomBlockScreenConfig(): AndroidConfig {
  return {
    overlayTitle: TITLES[Math.floor(Math.random() * TITLES.length)],
    overlayText: "It'll wake up when you finish your lesson. Your brain says thanks 🧠✨",
    overlayBackgroundColor: PALETTE.peach,
    overlayTitleColor: PALETTE.slate,
    overlayTextColor: PALETTE.slate,
    overlayTitleFontSize: TITLE_FONT_SIZE_SP,
    overlayTextFontSize: TEXT_FONT_SIZE_SP,
    overlayShowSpinner: false,
    notificationTitle: 'Nice try! 🙈',
    notificationText: '{appName} is snoozing while you learn.',
  };
}
