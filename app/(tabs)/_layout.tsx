import { Tabs } from 'expo-router';
import { Play, Library, TrendingUp, User } from 'lucide-react-native';
import React from 'react';

import { useTheme } from '@/contexts/theme-context';

export default function TabLayout() {
  const { colors } = useTheme();
  
  if (!colors) {
    return null;
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 88,
          paddingTop: 8,
          paddingBottom: 28,
          shadowColor: colors.shadowLight,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Focus',
          tabBarIcon: ({ color, focused }) => (
            <Play 
              size={focused ? 26 : 24} 
              color={color} 
              strokeWidth={2.5} 
              fill={focused ? color : 'transparent'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <Library 
              size={focused ? 26 : 24} 
              color={color} 
              strokeWidth={2.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <TrendingUp 
              size={focused ? 26 : 24} 
              color={color} 
              strokeWidth={2.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User 
              size={focused ? 26 : 24} 
              color={color} 
              strokeWidth={2.5}
            />
          ),
        }}
      />
    </Tabs>
  );
}
