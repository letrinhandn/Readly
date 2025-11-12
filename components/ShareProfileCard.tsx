import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { BookOpen, Clock, Award, Flame, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/theme-context';
import { UserProfile } from '@/types/user';
import { ReadingStats } from '@/types/book';

interface ShareProfileCardProps {
  profile: UserProfile;
  stats: ReadingStats;
  completedBooks?: { id: string; title: string; coverUrl?: string; thumbnail?: string }[];
}

const ShareProfileCard = forwardRef<View, ShareProfileCardProps>(
  ({ profile, stats, completedBooks = [] }, ref) => {
    const { colors, isDark } = useTheme();

    return (
      <View
        ref={ref}
        style={[styles.card, { backgroundColor: isDark ? '#1A1613' : '#FFFFFF' }]}
        collapsable={false}
      >
        <View style={[styles.gradientHeader, { backgroundColor: colors.primary }]}>
          <View style={styles.headerTop}>
            <View style={styles.profileSection}>
              <View style={[styles.avatarContainer, { backgroundColor: colors.surface }]}>
                {profile.profileImage && profile.profileImage.length > 0 ? (
                  <Image
                    source={{ uri: profile.profileImage }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <User size={32} color={colors.primary} strokeWidth={2} />
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.appName}>Readly</Text>
                <Text style={styles.userName}>{profile.name}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {profile.bio && (
            <View style={[styles.bioSection, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.bioText, { color: colors.text }]}>{profile.bio}</Text>
            </View>
          )}

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
                <BookOpen size={24} color={colors.primary} strokeWidth={2.5} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.totalBooksRead}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Books Read
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.accent + '15' }]}>
                <Clock size={24} color={colors.accent} strokeWidth={2.5} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {Math.floor(stats.totalMinutesRead / 60)}h
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Reading Time
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
                <Flame size={24} color={colors.success} strokeWidth={2.5} fill={colors.success} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.currentStreak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Day Streak
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.warning + '15' }]}>
                <Award size={24} color={colors.warning} strokeWidth={2.5} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.totalPagesRead}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Pages Read
              </Text>
            </View>
          </View>

          {completedBooks.length > 0 && (
            <View style={styles.booksSection}>
              <Text style={[styles.booksTitle, { color: colors.text }]}>
                Recently Completed
              </Text>
              <View style={styles.booksGrid}>
                {completedBooks.slice(0, 6).map((book) => (
                  <View key={book.id} style={[styles.bookCover, { backgroundColor: colors.surfaceSecondary }]}>
                    {(book.coverUrl && book.coverUrl.length > 0) || (book.thumbnail && book.thumbnail.length > 0) ? (
                      <Image
                        source={{ uri: book.coverUrl || book.thumbnail }}
                        style={styles.bookCoverImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.bookCoverPlaceholder}>
                        <BookOpen size={20} color={colors.textTertiary} strokeWidth={1.5} />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>
              Join me on my reading journey 📚
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

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
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    gap: 4,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  content: {
    padding: 24,
    gap: 20,
  },
  bioSection: {
    padding: 16,
    borderRadius: 16,
  },
  bioText: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900' as const,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  booksSection: {
    gap: 12,
  },
  booksTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bookCover: {
    width: 60,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bookCoverImage: {
    width: '100%',
    height: '100%',
  },
  bookCoverPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600' as const,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

ShareProfileCard.displayName = 'ShareProfileCard';

export default ShareProfileCard;
