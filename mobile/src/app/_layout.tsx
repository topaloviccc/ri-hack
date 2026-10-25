import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ApiConfigurationNotice } from '@/components/shared/ApiConfigurationNotice';
import { WelcomeScreen } from '@/components/layout/WelcomeScreen';
import { AuthProvider, useAuth } from '@/features/auth';
import { CourseFocusListener } from '@/features/focus';
import { NfcTagListener } from '@/features/nfc';
import { InterestOnboardingGate } from '@/features/interests/InterestOnboardingGate';
import { useThemePreferenceQuery } from '@/features/settings';
import { useStackScreenOptions } from '@/hooks/useStackScreenOptions';
import { useAppFonts } from '@/lib/fonts';
import { queryClient } from '@/lib/query-client';
import { useThemeVars } from '@/lib/theme';

export { ErrorBoundary } from 'expo-router';

// Deep links straight to a detail page (e.g. /location/x) still get the tabs underneath.
export const unstable_settings = { anchor: '(tabs)' };

SplashScreen.preventAutoHideAsync();

function AppShell() {
  const [fontsLoaded, fontError] = useAppFonts();
  // Restores the saved light/dark choice; a failed read just falls back to the system theme.
  const themePreference = useThemePreferenceQuery();
  const scheme = useColorScheme();
  const themeVars = useThemeVars();
  const stackScreenOptions = useStackScreenOptions();
  // Keeps the splash up until a saved session has been read, so signed-in users never see sign-in.
  const auth = useAuth();
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  // Fall back to system fonts rather than hang on the splash if loading fails.
  const isReady =
    (fontsLoaded || !!fontError) && !themePreference.isPending && auth.status !== 'restoring';

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={themeVars} className="flex-1">
        <StatusBar style="auto" />
        <ApiConfigurationNotice />
        <NfcTagListener />
        <CourseFocusListener />
        <InterestOnboardingGate>
          <Stack screenOptions={stackScreenOptions}>
            {/* Signed-out users can only reach sign-in; signing in or out swaps the available screens. */}
            <Stack.Protected guard={auth.status !== 'signedIn'}>
              <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={auth.status === 'signedIn'}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="benefits" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ title: 'Profile' }} />
              <Stack.Screen name="user/[id]" options={{ title: 'Profile' }} />
              <Stack.Screen name="settings" options={{ title: 'Settings' }} />
              <Stack.Screen name="interests" options={{ title: 'Learning interests' }} />
              <Stack.Screen name="focus-apps" options={{ title: 'Blocked apps' }} />
              <Stack.Screen name="people" options={{ title: 'People' }} />
              <Stack.Screen name="expert/apply" options={{ title: 'Become an expert' }} />
              <Stack.Screen name="expert/requests" options={{ title: 'Your requests' }} />
              {/* Default slide from the right matches the Scroll feed's swipe-left-to-open. */}
              <Stack.Screen name="course/[id]/index" options={{ title: '' }} />
              <Stack.Screen name="course/[id]/learn" options={{ title: 'Learn' }} />
              <Stack.Screen
                name="course/[id]/unlock"
                options={{
                  title: '',
                  presentation: 'formSheet',
                  sheetAllowedDetents: 'fitToContents',
                  sheetGrabberVisible: true,
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="coins"
                options={{
                  title: '',
                  presentation: 'formSheet',
                  sheetAllowedDetents: 'fitToContents',
                  sheetGrabberVisible: true,
                  headerShown: false,
                }}
              />
              <Stack.Screen name="event/[id]" options={{ title: '' }} />
              <Stack.Screen name="country/[code]" options={{ title: '' }} />
              {/* A full page like the Country page; the former form sheet blanked when resized on iOS. */}
              <Stack.Screen name="location/[id]" options={{ title: '' }} />
            </Stack.Protected>
          </Stack>
        </InterestOnboardingGate>
        {!hasEnteredApp ? <WelcomeScreen onContinue={() => setHasEnteredApp(true)} /> : null}
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
