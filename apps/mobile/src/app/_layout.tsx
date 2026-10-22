import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { LocationProvider } from '@/lib/location';
import { SessionProvider, useSession } from '@/lib/session';

SplashScreen.preventAutoHideAsync();

function Routes() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'loading') SplashScreen.hideAsync();
  }, [status]);

  if (status === 'loading') return null;
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Protected guard={status === 'signedIn'}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="log/[placeId]" options={{ title: 'Log a visit', presentation: 'modal' }} />
        <Stack.Screen name="rank/[placeId]" options={{ title: 'Rank', presentation: 'modal' }} />
        <Stack.Screen name="add-place" options={{ title: 'Add a place', presentation: 'modal' }} />
        <Stack.Screen name="location" options={{ title: 'Choose location', presentation: 'modal' }} />
        <Stack.Screen name="place/[id]" options={{ title: '' }} />
        <Stack.Screen name="visit/[id]" options={{ title: 'Visit' }} />
      </Stack.Protected>
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={status === 'needsSignUp'}>
        <Stack.Screen name="sign-up" options={{ title: 'Create your profile' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SessionProvider>
        <LocationProvider>
          <Routes />
        </LocationProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
