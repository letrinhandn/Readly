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
    const { sessions: filtered } = periodData;
    
    if (filtered.length === 0) {
      return [];
    }

    const sessionsByPeriod = new Map<string, number>();
    
    filtered.forEach(s => {
      const sessionDate = new Date(s.endTime!);
      let key: string;
      
      switch (timePeriod) {
        case 'daily':
          key = sessionDate.toDateString();
          break;
        case 'weekly':
          const weekStart = new Date(sessionDate);
          weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
          key = weekStart.toDateString();
          break;
        case 'monthly':
          key = `${sessionDate.getFullYear()}-${sessionDate.getMonth()}`;
          break;
        default:
          key = `${sessionDate.getFullYear()}`;
          break;
      }
      
      const value = metricType === 'pages' ? s.pagesRead : s.duration;
      sessionsByPeriod.set(key, (sessionsByPeriod.get(key) || 0) + value);
    });

    const oldestDate = new Date(Math.min(...filtered.map(s => new Date(s.endTime!).getTime())));
    const newestDate = new Date(Math.max(...filtered.map(s => new Date(s.endTime!).getTime())));
    const data: { label: string; value: number; index: number }[] = [];

    switch (timePeriod) {
      case 'daily': {
        const start = new Date(oldestDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(newestDate);
        end.setHours(0, 0, 0, 0);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        for (let i = 0; i < days; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          const key = date.toDateString();
          data.push({ 
            label: date.getDate().toString(), 
            value: sessionsByPeriod.get(key) || 0,
            index: i + 1
          });
        }
        break;
      }
      case 'weekly': {
        const start = new Date(oldestDate);
        start.setDate(oldestDate.getDate() - oldestDate.getDay());
        const end = new Date(newestDate);
        end.setDate(newestDate.getDate() - newestDate.getDay());
        const weeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
        
        for (let i = 0; i < weeks; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + (i * 7));
          const key = date.toDateString();
          data.push({ 
            label: `${i + 1}`, 
            value: sessionsByPeriod.get(key) || 0,
            index: i + 1
          });
        }
        break;
      }
      case 'monthly': {
        const startMonth = oldestDate.getMonth();
        const startYear = oldestDate.getFullYear();
        const endMonth = newestDate.getMonth();
        const endYear = newestDate.getFullYear();
        const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
        
        for (let i = 0; i < totalMonths; i++) {
          const month = (startMonth + i) % 12;
          const year = startYear + Math.floor((startMonth + i) / 12);
          const key = `${year}-${month}`;
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          data.push({ 
            label: monthNames[month], 
            value: sessionsByPeriod.get(key) || 0,
            index: i + 1
          });
        }
        break;
      }
      default: {
        const startYear = oldestDate.getFullYear();
        const endYear = newestDate.getFullYear();
        const years = endYear - startYear + 1;
        
        for (let i = 0; i < years; i++) {
          const year = startYear + i;
          const key = `${year}`;
          data.push({ 
            label: year.toString(), 
            value: sessionsByPeriod.get(key) || 0,
            index: i + 1
          });
        }
        break;
      }
    }

    return data;
  }, [periodData, metricType, timePeriod]);

  const heatmapData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let weeks: number;
    
    switch (timePeriod) {
      case 'daily':
        weeks = 1;
        break;
      case 'weekly':
        weeks = 12;
        break;
      case 'monthly':
        weeks = 26;
        break;
      default:
        weeks = 52;
    }

    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (weeks * 7) + 1);
    
    const firstDayOfWeek = startDate.getDay();
    if (firstDayOfWeek !== 0) {
      startDate.setDate(startDate.getDate() - firstDayOfWeek);
    }

    const sessionsByDay = new Map<string, number>();
    completedSessions.forEach(s => {
      const date = new Date(s.endTime!);
      date.setHours(0, 0, 0, 0);
      const key = date.toDateString();
      sessionsByDay.set(key, (sessionsByDay.get(key) || 0) + 1);
    });

    const data: { date: Date; count: number; dayOfWeek: number; weekIndex: number }[] = [];
    const totalDays = weeks * 7;
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = date.toDateString();
      const count = sessionsByDay.get(key) || 0;
      const dayOfWeek = date.getDay();
      const weekIndex = Math.floor(i / 7);
      
      data.push({ date, count, dayOfWeek, weekIndex });
    }

    return { data, weeks };
  }, [completedSessions, timePeriod]);

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

  const getStreakLabel = () => {
    switch (streakPeriod) {
      case 'week': return 'Weekly Streak';
      case 'month': return 'Monthly Streak';
      case 'year': return 'Yearly Streak';
    }
  };

  const getPeriodLabel = () => {
    switch (timePeriod) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'all': return 'All Time';
    }
  };

  const completedBooks = useMemo(() => {
    const allCompleted = books.filter(b => b.status === 'completed');
    const { startDate } = periodData;
    
    const filtered = allCompleted.filter(book => {
      if (!book.lastReadAt) return false;
      return new Date(book.lastReadAt) >= startDate;
    });

    return filtered.sort((a, b) => {
      const dateA = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
      const dateB = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [books, periodData]);

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
            <Text style={[styles.streakLabel, { color: colors.surface }]}>{getStreakLabel()}</Text>
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
          <Text style={[styles.summaryTitle, { color: colors.text }]}>{getPeriodLabel()} Reading Summary</Text>
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
            <Text style={[styles.chartTitle, { color: colors.text }]}>{getPeriodLabel()} Progress</Text>
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
          {chartData.length > 0 ? (
            <View style={styles.chart}>
              {chartData.map((item, index) => {
                const heightPercent = maxChartValue > 0 ? (item.value / maxChartValue) : 0;
                const barHeight = Math.max(heightPercent * 120, item.value > 0 ? 4 : 0);
                
                let showLabel = false;
                if (timePeriod === 'daily') {
                  showLabel = true;
                } else if (timePeriod === 'weekly') {
                  showLabel = index % Math.max(1, Math.floor(chartData.length / 6)) === 0;
                } else if (timePeriod === 'monthly') {
                  showLabel = index % Math.max(1, Math.floor(chartData.length / 6)) === 0;
                } else {
                  showLabel = true;
                }

                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: item.value > 0 ? colors.primary : colors.border,
                      }
                    ]} />
                    {showLabel && (
                      <Text style={[styles.barLabel, { color: colors.textTertiary }]}>
                        {item.label}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.chartEmpty}>
              <Text style={[styles.chartEmptyText, { color: colors.textSecondary }]}>No data available</Text>
            </View>
          )}
        </View>

        <View style={[styles.heatmapCard, { backgroundColor: colors.surface }]}>
          <View style={styles.heatmapHeader}>
            <Text style={[styles.heatmapTitle, { color: colors.text }]}>{getPeriodLabel()} Heatmap</Text>
            <Calendar size={18} color={colors.textSecondary} strokeWidth={2} />
          </View>
          <Text style={[styles.heatmapSubtitle, { color: colors.textSecondary }]}>
            {timePeriod === 'daily' ? 'Last 7 days' : 
             timePeriod === 'weekly' ? 'Last 12 weeks' : 
             timePeriod === 'monthly' ? 'Last 6 months' : 
             'Last 52 weeks'}
          </Text>
          <View style={styles.heatmapContainer}>
            <View style={styles.heatmapDayLabels}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <Text key={i} style={[styles.heatmapDayLabel, { color: colors.textTertiary }]}>
                  {day.charAt(0)}
                </Text>
              ))}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heatmapScrollView}>
              <View>
                <View style={styles.heatmapGrid}>
                  {Array.from({ length: heatmapData.weeks }).map((_, weekIndex) => (
                    <View key={weekIndex} style={styles.heatmapColumn}>
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                        const dataIndex = weekIndex * 7 + dayIndex;
                        const item = heatmapData.data[dataIndex];
                        if (!item) return <View key={dayIndex} style={styles.heatmapCellGithub} />;
                        return (
                          <View
                            key={dayIndex}
                            style={[
                              styles.heatmapCellGithub,
                              { backgroundColor: getHeatmapColor(item.count) }
                            ]}
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
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
            <Text style={[styles.booksCompletedTitle, { color: colors.text }]}>{getPeriodLabel()} Books Completed</Text>
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
  chartEmpty: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartEmptyText: {
    fontSize: 14,
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
  heatmapContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  heatmapDayLabels: {
    marginRight: 8,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  heatmapDayLabel: {
    fontSize: 9,
    fontWeight: '500' as const,
    height: 12,
    lineHeight: 12,
  },
  heatmapScrollView: {
    flex: 1,
  },
  heatmapGrid: {
    flexDirection: 'row',
    gap: 3,
  },
  heatmapColumn: {
    flexDirection: 'column',
    gap: 3,
  },
  heatmapCellGithub: {
    width: 12,
    height: 12,
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
