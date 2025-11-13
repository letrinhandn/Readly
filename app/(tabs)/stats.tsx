import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Flame, BookOpen, Clock, TrendingUp, Calendar } from 'lucide-react-native';
import { useReading } from '@/contexts/reading-context';
import { useTheme } from '@/contexts/theme-context';

const { width } = Dimensions.get('window');
type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'all';
type MetricType = 'pages' | 'minutes';

export default function StatsScreen() {
  const { stats, sessions } = useReading();
  const { colors } = useTheme();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  const [metricType, setMetricType] = useState<MetricType>('minutes');

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
              <Text style={[styles.summaryValue, { color: colors.accent }]}>{periodStats.pagesRead}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Pages</Text>
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
