import 'react-native-gesture-handler/jestSetup';

process.env.EXPO_PUBLIC_API_URL ??= 'http://backend.test/api';
process.env.EXPO_PUBLIC_USER_ID ??= '00000000-0000-0000-0000-000000000001';

// shortcut: Reanimated 4's own mock crashes under jest, and expo-router's testing-library
// silently falls back to `{}` when it does. Stub the mock path it loads with only the APIs the
// app uses; delete when reanimated ships a working mock.
jest.mock('react-native-reanimated/mock', () => {
  const { View } = jest.requireActual('react-native');
  const identity = <T>(value: T) => value;
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: identity },
    View,
    useSharedValue: <T>(value: T) => ({ value }),
    useAnimatedStyle: (factory: () => object) => factory(),
    useAnimatedProps: (factory: () => object) => factory(),
    useDerivedValue: <T>(factory: () => T) => ({ value: factory() }),
    interpolate: (_value: number, _input: number[], output: number[]) => output[output.length - 1],
    Extrapolation: { CLAMP: 'clamp' },
    withSpring: identity,
    withTiming: identity,
    withDecay: () => 0,
    withDelay: <T>(_delay: number, value: T) => value,
    withSequence: <T>(...values: T[]) => values[values.length - 1],
    useReducedMotion: () => false,
    cancelAnimation: () => {},
    Easing: { out: identity, cubic: identity, quad: identity, bezier: () => identity },
    isSharedValue: () => false,
    // Gesture Handler composes gesture callbacks through Reanimated; the map's gestures never fire
    // in jest, so a no-op handler is enough.
    useComposedEventHandler: () => () => {},
  };
});
// Skia draws on the GPU and needs native code; jest only checks the map's React tree.
jest.mock('@shopify/react-native-skia', () => {
  const { View } = jest.requireActual('react-native');
  const Draw = () => null;
  const builder = {
    addPath: () => builder,
    moveTo: () => builder,
    lineTo: () => builder,
    detach: () => ({}),
  };
  return {
    Canvas: View,
    Group: Draw,
    Path: Draw,
    Rect: Draw,
    LinearGradient: Draw,
    vec: (x: number, y: number) => ({ x, y }),
    Skia: {
      Path: { MakeFromSVGString: () => ({}) },
      PathBuilder: { Make: () => builder },
    },
  };
});
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
// Settings and friend-state helpers persist through AsyncStorage; use its in-memory jest mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
// Fonts are binary assets jest can't load; pretend they're ready.
jest.mock('expo-font', () => ({
  ...jest.requireActual('expo-font'),
  isLoaded: () => true,
  loadAsync: () => Promise.resolve(),
  useFonts: () => [true, null],
}));

// Mock APIs wait 400 ms and some screens chain two queries; the 1 s default is too tight on cold runs.
require('@testing-library/react-native').configure({ asyncUtilTimeout: 3000 });

// The app's QueryClient is a module singleton; clear it so tests don't share cached data.
afterEach(() => {
  require('@/lib/query-client').queryClient.clear();
});
