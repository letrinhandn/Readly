import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { BookOpen, Clock, Flame, Calendar } from 'lucide-react-native';
import { Book } from '@/types/book';
import { useTheme } from '@/contexts/theme-context';

interface ShareDailyCardProps {
  book: Book;
  session: {
    duration: number;
    pagesRead: number;
    date: string;
  };
  streak?: number;
}

const ShareDailyCard = forwardRef<View, ShareDailyCardProps>(({ book, session, streak = 0 }, ref) => {
  const { colors, isDark } = useTheme();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <View 
      ref={ref} 
      style={[styles.card, { backgroundColor: isDark ? '#1A1613' : '#FFFFFF' }]}
      collapsable={false}
    >
      <View style={[styles.gradientHeader, { 
        backgroundColor: colors.primary,
      }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.appName}>Readly</Text>
            <Text style={styles.headerSubtitle}>Daily Reading</Text>
          </View>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Flame size={18} color="#FFF" strokeWidth={2.5} fill="#FFF" />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={[styles.dateSection, { backgroundColor: colors.surfaceSecondary }]}>
          <Calendar size={16} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDate(session.date)}
          </Text>
        </View>

        <View style={styles.bookSection}>
          <View style={styles.bookHeader}>
            {book.coverUrl || book.thumbnail ? (
              <Image 
                source={{ uri: book.coverUrl || book.thumbnail }} 
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.coverPlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
                <BookOpen size={28} color={colors.primary} strokeWidth={1.5} />
              </View>
            )}
            
            <View style={styles.bookInfo}>
              <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
                TODAY I READ
              </Text>
              <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
                {book.title}
              </Text>
              <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                by {book.author}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.sessionStats, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={styles.sessionStatItem}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Clock size={20} color={colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {session.duration}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                minutes
              </Text>
            </View>
          </View>

          <View style={[styles.sessionDivider, { backgroundColor: colors.border }]} />

          <View style={styles.sessionStatItem}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.success + '20' }]}>
              <BookOpen size={20} color={colors.success} strokeWidth={2.5} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {session.pagesRead}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                pages
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Keep the momentum going! 🌟
          </Text>
        </View>
      </View>
    </View>
  );
});

ShareDailyCard.displayName = 'ShareDailyCard';

const styles = StyleSheet.create({
  card: {
    width: 400,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  gradientHeader: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: '#FFF',
  },
  content: {
    padding: 24,
    gap: 20,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  bookSection: {
    gap: 12,
  },
  bookHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  coverImage: {
    width: 70,
    height: 105,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  coverPlaceholder: {
    width: 70,
    height: 105,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  bookAuthor: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  sessionStats: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 20,
    gap: 16,
  },
  sessionStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900' as const,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
  },
  sessionDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 4,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600' as const,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default ShareDailyCard;
