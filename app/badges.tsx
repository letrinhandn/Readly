import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useBadges } from '@/contexts/badge-context';
import { useTheme } from '@/contexts/theme-context';
import BadgesGrid from '@/components/BadgesGrid';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BadgesScreen() {
  const { colors } = useTheme();
  const { mergedBadges, totalEarned, availableBadges, isLoading } = useBadges();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Badges',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Your Badges</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {totalEarned} of {availableBadges.length} earned
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading badges...
            </Text>
          </View>
        ) : availableBadges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No badges available. Please set up badge definitions in Supabase.
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              See BADGE_SETUP_GUIDE.md for instructions.
            </Text>
          </View>
        ) : (
          <BadgesGrid badges={mergedBadges} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400' as const,
    textAlign: 'center',
    marginTop: 8,
  },
});
