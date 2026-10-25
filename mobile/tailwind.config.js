// Color values live in src/lib/theme.ts and are injected as CSS variables at the root layout.
const color = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: color('background'),
        surface: color('surface'),
        border: color('border'),
        text: color('text'),
        muted: color('muted'),
        primary: color('primary'),
        secondary: color('secondary'),
        'on-primary': color('onPrimary'),
        'on-image': color('onImage'),
        'on-secondary': color('onSecondary'),
        overlay: color('overlay'),
        'coin-rim': color('coinRim'),
      },
      fontFamily: {
        sans: ['PlusJakartaSans_400Regular'],
        'sans-medium': ['PlusJakartaSans_500Medium'],
        'sans-semibold': ['PlusJakartaSans_600SemiBold'],
        'sans-bold': ['PlusJakartaSans_700Bold'],
        serif: ['InstrumentSerif_400Regular'],
        'serif-italic': ['InstrumentSerif_400Regular_Italic'],
        mono: ['JetBrainsMono_400Regular'],
        'mono-medium': ['JetBrainsMono_500Medium'],
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
};
