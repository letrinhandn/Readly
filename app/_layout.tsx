import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReadingProvider } from '@/contexts/reading-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { UserProvider } from '@/contexts/user-context';
import { SettingsProvider } from '@/contexts/settings-context';
import { BadgeProvider, useBadges } from '@/contexts/badge-context';
import { trpc, trpcClient } from '@/lib/trpc';
import supabase from '@/lib/supabase';
import BadgeEarnedPopup from '@/components/BadgeEarnedPopup';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function BadgePopupWrapper() {
  const { newlyEarnedBadges, dismissNewlyEarnedBadge } = useBadges();
  
  return (
    <BadgeEarnedPopup
      badge={newlyEarnedBadges[0] || null}
      visible={newlyEarnedBadges.length > 0}
      onClose={dismissNewlyEarnedBadge}
    />
  );
}

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
      
      if (_event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected');
        router.push('/reset-password');
      }
      
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (isAuthenticated === null) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'forgot-password';
    const inResetPassword = segments[0] === 'reset-password';

    if (!isAuthenticated && !inAuthGroup && !inResetPassword) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router]);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerBackTitle: 'Back' }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-book" options={{ presentation: 'modal', title: 'Add Book' }} />
        <Stack.Screen name="edit-book" options={{ presentation: 'modal', title: 'Edit Book' }} />
        <Stack.Screen name="book-detail" options={{ title: 'Book Details' }} />
        <Stack.Screen name="focus-session" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="scan-progress" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="scan-book" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="share-card" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="share-profile" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="notifications-settings" options={{ title: 'Notifications' }} />
        <Stack.Screen name="app-settings" options={{ title: 'App Settings' }} />
        <Stack.Screen name="help-support" options={{ title: 'Help & Support' }} />
        <Stack.Screen name="badges" options={{ title: 'Badges' }} />
      </Stack>
      <BadgePopupWrapper />
    </>
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
          <SettingsProvider>
            <UserProvider>
              <ReadingProvider>
                <BadgeProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <RootLayoutNav />
                  </GestureHandlerRootView>
                </BadgeProvider>
              </ReadingProvider>
            </UserProvider>
          </SettingsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
