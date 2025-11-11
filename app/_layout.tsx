import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReadingProvider } from '@/contexts/reading-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { UserProvider } from '@/contexts/user-context';
import { trpc, trpcClient } from '@/lib/trpc';
import supabase from '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth session error:', error);
          setIsAuthenticated(false);
          return;
        }
        
        console.log('Session status:', !!session);
        setIsAuthenticated(!!session);
      } catch (err) {
        console.error('Failed to check auth:', err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, !!session);
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return;

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-book" options={{ presentation: 'modal', title: 'Add Book' }} />
      <Stack.Screen name="edit-book" options={{ presentation: 'modal', title: 'Edit Book' }} />
      <Stack.Screen name="book-detail" options={{ title: 'Book Details' }} />
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
