import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Flame, BookOpen, Clock, TrendingUp } from 'lucide-react-native';
import { useReading } from '@/contexts/reading-context';
import { useTheme } from '@/contexts/theme-context';

export default function StatsScreen() {
  const { stats, sessions } = useReading();
  const { colors } = useTheme();

  const recentSessions = sessions
    .filter(s => s.endTime)
    .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '', headerShown: false }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Stats</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>Track your reading journey</Text>
        </View>
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <View style={styles.streakContainer}>
            <View style={[styles.streakIcon, { backgroundColor: colors.surface }]}>
              <Flame size={40} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={[styles.streakValue, { color: colors.surface }]}>{stats.currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: colors.surface }]}>Day Streak</Text>
            {stats.longestStreak > stats.currentStreak ? (
              <Text style={styles.streakBest}>Best: {stats.longestStreak} days</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <BookOpen size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalPagesRead}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pages Read</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.success + '15' }]}>
              <Clock size={24} color={colors.success} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {Math.floor(stats.totalMinutesRead / 60)}h {stats.totalMinutesRead % 60}m
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Time Spent</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.accent + '15' }]}>
              <TrendingUp size={24} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalBooksRead}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Books Done</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.focus + '15' }]}>
              <Flame size={24} color={colors.focus} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.sessionsThisWeek}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Week</Text>
          </View>
        </View>

        {recentSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Sessions</Text>
            {recentSessions.map(session => (
              <View key={session.id} style={[styles.sessionCard, { backgroundColor: colors.surface }]}>
                <View style={styles.sessionDate}>
                  <View style={[styles.sessionDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.sessionDateText, { color: colors.text }]}>{formatDate(session.endTime!)}</Text>
                </View>
                <View style={styles.sessionStats}>
                  <View style={styles.sessionStat}>
                    <BookOpen size={16} color={colors.textSecondary} strokeWidth={2} />
                    <Text style={[styles.sessionStatText, { color: colors.textSecondary }]}>{session.pagesRead} pages</Text>
                  </View>
                  <View style={styles.sessionStat}>
                    <Clock size={16} color={colors.textSecondary} strokeWidth={2} />
                    <Text style={[styles.sessionStatText, { color: colors.textSecondary }]}>{session.duration} min</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {sessions.filter(s => s.endTime).length === 0 && (
          <View style={styles.emptyState}>
            <TrendingUp size={64} color={colors.textTertiary} strokeWidth={1} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No stats yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Complete your first reading session to see your stats</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: '800' as const,
    marginBottom: 4,
    letterSpacing: -1,
  },
  pageSubtitle: {
    fontSize: 17,
    fontWeight: '500' as const,
  },
  heroCard: {
    borderRadius: 28,
    padding: 40,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakIcon: {
    marginBottom: 12,
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakValue: {
    fontSize: 56,
    fontWeight: '800' as const,
    letterSpacing: -2,
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  streakBest: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  sessionCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  sessionDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sessionDateText: {
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  sessionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionStatText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
