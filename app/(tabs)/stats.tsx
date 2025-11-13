import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Flame, BookOpen, Clock, TrendingUp, Calendar } from 'lucide-react-native';
import { useReading } from '@/contexts/reading-context';
import { useTheme } from '@/contexts/theme-context';

const { width } = Dimensions.get('window');
type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'all';
type MetricType = 'pages' | 'minutes';
type StreakPeriod = 'week' | 'month' | 'year';

export default function StatsScreen() {
  const { stats, sessions, books } = useReading();
  const { colors } = useTheme();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  const [metricType, setMetricType] = useState<MetricType>('minutes');
  const [streakPeriod, setStreakPeriod] = useState<StreakPeriod>('week');

  const completedSessions = useMemo(() => 
    sessions.filter(s => s.endTime).sort((a, b) => 
      new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime()
    ), [sessions]
  );

  const periodData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let dayCount: number;

    switch (timePeriod) {
      case 'daily':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        dayCount = 7;
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 27);
        dayCount = 28;
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 89);
        dayCount = 90;
        break;
      default:
        startDate = new Date(Math.min(
          ...completedSessions.map(s => new Date(s.endTime!).getTime()),
          now.getTime()
        ));
        const diffTime = Math.abs(now.getTime() - startDate.getTime());
        dayCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 30;
    }

    startDate.setHours(0, 0, 0, 0);
    const filtered = completedSessions.filter(s => 
      new Date(s.endTime!) >= startDate
    );

    return { startDate, dayCount, sessions: filtered };
  }, [timePeriod, completedSessions]);

  const chartData = useMemo(() => {
    const { startDate, dayCount, sessions: filtered } = periodData;
    const data: { date: Date; value: number }[] = [];

    for (let i = 0; i < dayCount; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = filtered.filter(s => {
        const sessionDate = new Date(s.endTime!);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });

      const value = metricType === 'pages'
        ? daySessions.reduce((sum, s) => sum + s.pagesRead, 0)
        : daySessions.reduce((sum, s) => sum + s.duration, 0);

      data.push({ date, value });
    }

    return data;
  }, [periodData, metricType]);

  const heatmapData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 83);
    startDate.setHours(0, 0, 0, 0);

    const data: { date: Date; count: number }[] = [];
    for (let i = 0; i < 84; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const count = completedSessions.filter(s => {
        const sessionDate = new Date(s.endTime!);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      }).length;

      data.push({ date, count });
    }

    return data;
  }, [completedSessions]);

  const periodStats = useMemo(() => {
    const { sessions: filtered } = periodData;
    const pagesRead = filtered.reduce((sum, s) => sum + s.pagesRead, 0);
    const minutesRead = filtered.reduce((sum, s) => sum + s.duration, 0);
    const avgPages = filtered.length > 0 ? Math.round(pagesRead / filtered.length) : 0;
    const avgMinutes = filtered.length > 0 ? Math.round(minutesRead / filtered.length) : 0;
    
    return {
      sessions: filtered.length,
      pagesRead,
      minutesRead,
      avgPages,
      avgMinutes,
    };
  }, [periodData]);

  const streakStats = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (streakPeriod) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    startDate.setHours(0, 0, 0, 0);
    
    const filtered = completedSessions.filter(s => 
      new Date(s.endTime!) >= startDate
    );

    const uniqueDays = new Set(
      filtered.map(s => new Date(s.endTime!).toDateString())
    ).size;

    return {
      daysActive: uniqueDays,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
    };
  }, [streakPeriod, completedSessions, stats]);

  const completedBooks = useMemo(() => 
    books.filter(b => b.status === 'completed').sort((a, b) => {
      const dateA = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
      const dateB = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
      return dateB - dateA;
    }), [books]
  );

  const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

  const getHeatmapColor = (count: number) => {
    if (count === 0) return colors.surface;
    if (count === 1) return colors.primary + '30';
    if (count === 2) return colors.primary + '60';
    if (count === 3) return colors.primary + '90';
    return colors.primary;
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

        <View style={[styles.streakCard, { backgroundColor: colors.primary }]}>
          <View style={styles.streakHeader}>
            <View style={[styles.streakIconSmall, { backgroundColor: colors.surface }]}>
              <Flame size={32} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={styles.streakPeriodSelector}>
              {(['week', 'month', 'year'] as StreakPeriod[]).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setStreakPeriod(period)}
                  style={[
                    styles.streakPeriodButton,
                    { 
                      backgroundColor: streakPeriod === period ? colors.surface : 'transparent',
                      borderColor: colors.surface + '40',
                    }
                  ]}
                >
                  <Text style={[
                    styles.streakPeriodText,
                    { color: streakPeriod === period ? colors.primary : colors.surface }
                  ]}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.streakContent}>
            <Text style={[styles.streakValue, { color: colors.surface }]}>{streakStats.daysActive}</Text>
            <Text style={[styles.streakLabel, { color: colors.surface }]}>Day Streak</Text>
            {streakStats.longestStreak > streakStats.currentStreak && (
              <Text style={styles.streakBest}>Best: {streakStats.longestStreak} days</Text>
            )}
          </View>
        </View>

        <View style={styles.timePeriodSelector}>
          {(['daily', 'weekly', 'monthly', 'all'] as TimePeriod[]).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setTimePeriod(period)}
              style={[
                styles.periodButton,
                { 
                  backgroundColor: timePeriod === period ? colors.primary : colors.surface,
                  borderColor: colors.border,
                }
              ]}
            >
              <Text style={[
                styles.periodButtonText,
                { color: timePeriod === period ? colors.surface : colors.textSecondary }
              ]}>
                {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Reading Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>{periodStats.sessions}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Sessions</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>{Math.floor(periodStats.minutesRead / 60)}h {periodStats.minutesRead % 60}m</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Time</Text>
            </View>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{periodStats.avgPages}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Avg Pages</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{periodStats.avgMinutes}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Avg Minutes</Text>
            </View>
          </View>
        </View>

        <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Daily Progress</Text>
            <View style={styles.metricToggle}>
              <TouchableOpacity
                onPress={() => setMetricType('pages')}
                style={[
                  styles.metricButton,
                  { 
                    backgroundColor: metricType === 'pages' ? colors.primary + '20' : 'transparent',
                  }
                ]}
              >
                <BookOpen size={16} color={metricType === 'pages' ? colors.primary : colors.textSecondary} strokeWidth={2} />
                <Text style={[styles.metricButtonText, { color: metricType === 'pages' ? colors.primary : colors.textSecondary }]}>Pages</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMetricType('minutes')}
                style={[
                  styles.metricButton,
                  { 
                    backgroundColor: metricType === 'minutes' ? colors.primary + '20' : 'transparent',
                  }
                ]}
              >
                <Clock size={16} color={metricType === 'minutes' ? colors.primary : colors.textSecondary} strokeWidth={2} />
                <Text style={[styles.metricButtonText, { color: metricType === 'minutes' ? colors.primary : colors.textSecondary }]}>Time</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.chart}>
            {chartData.map((item, index) => {
              const heightPercent = maxChartValue > 0 ? (item.value / maxChartValue) : 0;
              const barHeight = Math.max(heightPercent * 120, item.value > 0 ? 4 : 0);
              const showLabel = timePeriod === 'daily' || (index % (timePeriod === 'weekly' ? 4 : 15) === 0);

              return (
                <View key={index} style={styles.barContainer}>
                  <View style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: item.value > 0 ? colors.primary : colors.surface,
                    }
                  ]} />
                  {showLabel && (
                    <Text style={[styles.barLabel, { color: colors.textTertiary }]}>
                      {item.date.getDate()}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.heatmapCard, { backgroundColor: colors.surface }]}>
          <View style={styles.heatmapHeader}>
            <Text style={[styles.heatmapTitle, { color: colors.text }]}>Activity Heatmap</Text>
            <Calendar size={18} color={colors.textSecondary} strokeWidth={2} />
          </View>
          <Text style={[styles.heatmapSubtitle, { color: colors.textSecondary }]}>Last 12 weeks</Text>
          <View style={styles.heatmapGrid}>
            {heatmapData.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.heatmapCell,
                  { backgroundColor: getHeatmapColor(item.count) }
                ]}
              />
            ))}
          </View>
          <View style={styles.heatmapLegend}>
            <Text style={[styles.heatmapLegendText, { color: colors.textTertiary }]}>Less</Text>
            {[0, 1, 2, 3, 4].map((level) => (
              <View
                key={level}
                style={[
                  styles.heatmapLegendCell,
                  { backgroundColor: getHeatmapColor(level) }
                ]}
              />
            ))}
            <Text style={[styles.heatmapLegendText, { color: colors.textTertiary }]}>More</Text>
          </View>
        </View>

        <View style={[styles.booksCompletedCard, { backgroundColor: colors.surface }]}>
          <View style={styles.booksCompletedHeader}>
            <Text style={[styles.booksCompletedTitle, { color: colors.text }]}>Books Completed</Text>
            <View style={[styles.booksCompletedBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.booksCompletedCount, { color: colors.primary }]}>
                {completedBooks.length}
              </Text>
            </View>
          </View>
          
          {completedBooks.length > 0 ? (
            <View style={styles.booksCompletedList}>
              {completedBooks.slice(0, 5).map((book) => (
                <View key={book.id} style={[styles.bookCompletedItem, { borderBottomColor: colors.border }]}>
                  <View style={styles.bookCompletedInfo}>
                    <Text style={[styles.bookCompletedTitle, { color: colors.text }]} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={[styles.bookCompletedAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                      {book.author}
                    </Text>
                  </View>
                  <View style={[styles.bookCompletedCheck, { backgroundColor: colors.success + '15' }]}>
                    <BookOpen size={16} color={colors.success} strokeWidth={2} />
                  </View>
                </View>
              ))}
              {completedBooks.length > 5 && (
                <Text style={[styles.booksCompletedMore, { color: colors.textSecondary }]}>
                  +{completedBooks.length - 5} more
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.booksCompletedEmpty}>
              <BookOpen size={32} color={colors.textTertiary} strokeWidth={1.5} />
              <Text style={[styles.booksCompletedEmptyText, { color: colors.textSecondary }]}>
                No completed books yet
              </Text>
            </View>
          )}
        </View>

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
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 24,
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
  streakCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakIconSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakPeriodSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  streakPeriodButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  streakPeriodText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  streakContent: {
    alignItems: 'center',
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
  timePeriodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  summaryDivider: {
    height: 1,
    marginVertical: 16,
  },
  chartCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  metricToggle: {
    flexDirection: 'row',
    gap: 4,
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metricButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    gap: 2,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: '500' as const,
  },
  heatmapCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  heatmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  heatmapTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  heatmapSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginBottom: 12,
  },
  heatmapCell: {
    width: (width - 88) / 14,
    height: (width - 88) / 14,
    borderRadius: 2,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
  },
  heatmapLegendText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  heatmapLegendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  booksCompletedCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  booksCompletedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  booksCompletedTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  booksCompletedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  booksCompletedCount: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  booksCompletedList: {
    gap: 0,
  },
  bookCompletedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  bookCompletedInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookCompletedTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  bookCompletedAuthor: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  bookCompletedCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  booksCompletedMore: {
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center',
    marginTop: 12,
  },
  booksCompletedEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  booksCompletedEmptyText: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginTop: 12,
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
