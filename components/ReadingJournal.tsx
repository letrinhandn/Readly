import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BookOpen, Clock, Calendar, Smile, Meh, Frown, Zap, Heart } from 'lucide-react-native';
import { ReadingSession } from '@/types/book';
import Colors from '@/constants/colors';

interface ReadingJournalProps {
  sessions: ReadingSession[];
  bookTitle: string;
}

const MoodIcon = ({ mood }: { mood?: ReadingSession['mood'] }) => {
  const size = 16;
  const color = Colors.light.textSecondary;
  
  switch (mood) {
    case 'excited':
      return <Zap size={size} color={color} />;
    case 'calm':
      return <Heart size={size} color={color} />;
    case 'thoughtful':
      return <BookOpen size={size} color={color} />;
    case 'inspired':
      return <Smile size={size} color={color} />;
    case 'tired':
      return <Meh size={size} color={color} />;
    default:
      return null;
  }
};

export default function ReadingJournal({ sessions, bookTitle }: ReadingJournalProps) {
  const completedSessions = sessions
    .filter(s => s.endTime)
    .sort((a, b) => {
      const dateA = new Date(b.endTime!).getTime();
      const dateB = new Date(a.endTime!).getTime();
      return dateA - dateB;
    });

  if (completedSessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BookOpen size={40} color={Colors.light.textSecondary} strokeWidth={1.5} />
        <Text style={styles.emptyText}>No reading sessions yet</Text>
        <Text style={styles.emptySubtext}>Start a focus session to begin your journal</Text>
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Reading Journal</Text>
        <Text style={styles.subtitle}>{completedSessions.length} session{completedSessions.length !== 1 ? 's' : ''}</Text>
      </View>

      <View style={styles.sessionsList}>
        {completedSessions.map((session, index) => (
          <View key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View style={styles.dateRow}>
                <Calendar size={14} color={Colors.light.textSecondary} strokeWidth={2} />
                <Text style={styles.dateText}>{formatDate(session.endTime!)}</Text>
              </View>
              {session.mood && (
                <View style={styles.moodBadge}>
                  <MoodIcon mood={session.mood} />
                  <Text style={styles.moodText}>{session.mood}</Text>
                </View>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <BookOpen size={16} color={Colors.light.primary} strokeWidth={2} />
                <Text style={styles.statValue}>{session.pagesRead}</Text>
                <Text style={styles.statLabel}>pages</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.stat}>
                <Clock size={16} color={Colors.light.primary} strokeWidth={2} />
                <Text style={styles.statValue}>{session.duration}</Text>
                <Text style={styles.statLabel}>min</Text>
              </View>
            </View>

            {session.reflection && (
              <View style={styles.reflectionContainer}>
                <Text style={styles.reflectionText} numberOfLines={4}>
                  {session.reflection}
                </Text>
              </View>
            )}

            {session.location && (
              <View style={styles.locationContainer}>
                <Text style={styles.locationText}>📍 {session.location}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
  },
  sessionsList: {
    gap: 16,
  },
  sessionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '600' as const,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
  },
  moodText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '600' as const,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
  },
  reflectionContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.text,
  },
  locationContainer: {
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
  },
});
