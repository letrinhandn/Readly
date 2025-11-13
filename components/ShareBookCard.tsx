import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { BookOpen, Calendar } from 'lucide-react-native';
import { Book } from '@/types/book';
import { shareThemes, ShareThemeType } from '@/constants/share-themes';

interface ShareBookCardProps {
  book: Book;
  stats: {
    totalMinutes: number;
    totalPages: number;
    sessionCount: number;
  };
  theme?: ShareThemeType;
}

const ShareBookCard = forwardRef<View, ShareBookCardProps>(({ book, stats, theme = 'minimal-light' }, ref) => {
  const shareTheme = shareThemes[theme];
  const colors = shareTheme.colors;
  
  const progress = Math.round((book.currentPage / book.totalPages) * 100);
  const isCompleted = book.status === 'completed';

  const renderBackground = () => {
    if (shareTheme.gradients?.header) {
      return {
        backgroundColor: shareTheme.gradients.header[0],
      };
    }
    return { backgroundColor: colors.primary };
  };

  return (
    <View 
      ref={ref} 
      style={[styles.card, { backgroundColor: colors.cardBackground }]}
      collapsable={false}
    >
      <View style={[styles.gradientHeader, renderBackground()]}>
        <Text style={styles.appName}>Readly</Text>
        <Text style={styles.headerSubtitle}>Reading Journey</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.bookSection}>
          <View style={styles.bookHeader}>
            {(book.coverUrl && book.coverUrl.length > 0) || (book.thumbnail && book.thumbnail.length > 0) ? (
              <Image 
                source={{ uri: book.coverUrl || book.thumbnail }} 
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.coverPlaceholder, { backgroundColor: colors.secondary + '20' }]}>
                <BookOpen size={32} color={colors.primary} strokeWidth={1.5} />
              </View>
            )}
            
            <View style={styles.bookInfo}>
              <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={3}>
                {book.title}
              </Text>
              <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                {book.author}
              </Text>
            </View>
          </View>

          <View style={[styles.progressSection, { backgroundColor: colors.secondary + '20' }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                {isCompleted ? 'Completed!' : 'Progress'}
              </Text>
              <Text style={[styles.progressPercent, { color: colors.primary }]}>
                {progress}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { backgroundColor: colors.primary, width: `${progress}%` }
                ]} 
              />
            </View>
            <Text style={[styles.pagesText, { color: colors.textSecondary }]}>
              {book.currentPage} / {book.totalPages} pages
            </Text>
          </View>
        </View>

        <View style={[styles.statsSection, { borderTopColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats.sessionCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Sessions
            </Text>
          </View>
          
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats.totalMinutes}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Minutes
            </Text>
          </View>
          
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats.totalPages}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Pages Read
            </Text>
          </View>
        </View>

        {book.startedAt && (
          <View style={styles.dateSection}>
            <View style={[styles.dateRow, { backgroundColor: colors.secondary + '20' }]}>
              <Calendar size={14} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                Started {new Date(book.startedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Every page is a step forward 📖
          </Text>
        </View>
      </View>
    </View>
  );
});

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
  content: {
    padding: 24,
  },
  bookSection: {
    gap: 16,
    marginBottom: 20,
  },
  bookHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  coverImage: {
    width: 80,
    height: 120,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  coverPlaceholder: {
    width: 80,
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  bookAuthor: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  progressSection: {
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '900' as const,
    letterSpacing: -0.5,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  pagesText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900' as const,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  dateSection: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600' as const,
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

ShareBookCard.displayName = 'ShareBookCard';

export default ShareBookCard;
