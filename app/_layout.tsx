import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReadingProvider } from '@/contexts/reading-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { UserProvider } from '@/contexts/user-context';
import { trpc, trpcClient } from '@/lib/trpc';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-book" options={{ presentation: 'modal', title: 'Add Book' }} />
      <Stack.Screen name="focus-session" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Stack.Screen name="scan-progress" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Stack.Screen name="scan-book" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Stack.Screen name="share-card" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="share-profile" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <UserProvider>
            <ReadingProvider>
              <GestureHandlerRootView>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </ReadingProvider>
          </UserProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
