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
import { NfcTagListener } from '@/features/nfc';
import { useThemePreferenceQuery } from '@/features/settings';
import { useAppFonts } from '@/lib/fonts';
import { queryClient } from '@/lib/query-client';
import { useThemeColors, useThemeVars } from '@/lib/theme';

export { ErrorBoundary } from 'expo-router';

// Deep links straight to a sheet (e.g. /location/x) still get the tabs underneath.
export const unstable_settings = { anchor: '(tabs)' };

SplashScreen.preventAutoHideAsync();

function AppShell() {
  const [fontsLoaded, fontError] = useAppFonts();
  // Restores the saved light/dark choice; a failed read just falls back to the system theme.
  const themePreference = useThemePreferenceQuery();
  const scheme = useColorScheme();
  const themeVars = useThemeVars();
  const colors = useThemeColors();
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
        <Stack
          screenOptions={{
            headerTintColor: colors.primary,
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { fontFamily: 'PlusJakartaSans_700Bold', color: colors.text },
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: { backgroundColor: colors.background },
          }}
        >
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
            <Stack.Screen name="focus-apps" options={{ title: 'Blocked apps' }} />
            <Stack.Screen name="people" options={{ title: 'People' }} />
            <Stack.Screen name="expert/apply" options={{ title: 'Become an expert' }} />
            <Stack.Screen name="expert/requests" options={{ title: 'Your requests' }} />
            <Stack.Screen
              name="course/[id]/index"
              options={{ title: '', animation: 'slide_from_left' }}
            />
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
            <Stack.Screen
              name="location/[id]"
              options={{
                title: '',
                presentation: 'formSheet',
                sheetAllowedDetents: [0.6, 1],
                sheetGrabberVisible: true,
                headerShown: false,
              }}
            />
          </Stack.Protected>
        </Stack>
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
