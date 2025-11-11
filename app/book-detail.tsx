import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, Modal, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { BookOpen, Calendar, Clock, TrendingUp, Trash2, Share2, Edit2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useReading } from '@/contexts/reading-context';
import { useTheme } from '@/contexts/theme-context';
import ShareBookCard from '@/components/ShareBookCard';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { books, sessions, deleteBook, updateBook } = useReading();
  const { colors } = useTheme();
  const [showShareModal, setShowShareModal] = useState(false);
  const shareCardRef = useRef<View>(null);

  const book = books.find(b => b.id === id);
  const bookSessions = useMemo(() => {
    if (!book) return [];
    return sessions
      .filter(s => s.bookId === book.id && s.endTime)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [book, sessions]);

  const groupedSessions = useMemo(() => {
    const groups: { [key: string]: typeof bookSessions } = {};
    bookSessions.forEach(session => {
      const date = new Date(session.startTime);
      const dateKey = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });
    return groups;
  }, [bookSessions]);

  const stats = useMemo(() => {
    const totalMinutes = bookSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalPages = bookSessions.reduce((sum, s) => sum + s.pagesRead, 0);
    const avgPagesPerSession = bookSessions.length > 0 ? Math.round(totalPages / bookSessions.length) : 0;
    const avgMinutesPerSession = bookSessions.length > 0 ? Math.round(totalMinutes / bookSessions.length) : 0;
    return { totalMinutes, totalPages, avgPagesPerSession, avgMinutesPerSession };
  }, [bookSessions]);

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Book Not Found', headerShown: true }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Book not found</Text>
        </View>
      </View>
    );
  }

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    deleteBook(book.id);
    router.back();
  };

  const handleSharePress = () => {
    setShowShareModal(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleShare = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (!shareCardRef.current) return;

      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
      });

      if (Platform.OS === 'web') {
        const a = document.createElement('a');
        a.href = uri;
        a.download = `readly-${book?.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().getTime()}.png`;
        a.click();
        setShowShareModal(false);
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert('Sharing not available', 'Unable to share on this device');
        }
        setShowShareModal(false);
      }

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share card');
    }
  };

  const progress = book.totalPages ? (book.currentPage / book.totalPages) * 100 : 0;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: '', 
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => {
                if (book) {
                  router.push(`/edit-book?id=${book.id}`);
                }
              }} style={styles.headerButton}>
                <Edit2 size={20} color={colors.primary} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSharePress} style={styles.headerButton}>
                <Share2 size={20} color={colors.primary} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                <Trash2 size={20} color={colors.error} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bookHeader}>
          {book.coverUrl || book.thumbnail ? (
            <Image 
              source={{ uri: book.coverUrl || book.thumbnail }} 
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary + '30' }]}>
              <BookOpen size={48} color={colors.primary} strokeWidth={1.5} />
            </View>
          )}
          
          <View style={styles.bookInfo}>
            <Text style={[styles.bookTitle, { color: colors.text }]}>{book.title}</Text>
            <Text style={[styles.bookAuthor, { color: colors.textSecondary }]}>{book.author}</Text>
            
            {book.publishedDate && (
              <View style={styles.metaRow}>
                <Calendar size={14} color={colors.textTertiary} strokeWidth={2} />
                <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                  Published {book.publishedDate}
                </Text>
              </View>
            )}
            
            {book.publisher && (
              <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                {book.publisher}
              </Text>
            )}

            {book.isbn13 && (
              <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                ISBN: {book.isbn13}
              </Text>
            )}

            {book.categories && book.categories.length > 0 && (
              <View style={styles.categoriesContainer}>
                {book.categories.slice(0, 3).map((category, index) => (
                  <View key={index} style={[styles.categoryTag, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.categoryText, { color: colors.textSecondary }]}>{category}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Reading Progress</Text>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.surfaceSecondary }]}>
            <View 
              style={[
                styles.progressFill, 
                { backgroundColor: colors.primary, width: `${progress}%` }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {book.currentPage} of {book.totalPages} pages
          </Text>
        </View>

        {book.description && (
          <View style={[styles.descriptionCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {book.description}
            </Text>
          </View>
        )}

        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Clock size={20} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalMinutes}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Minutes Read</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.success + '20' }]}>
                <BookOpen size={20} color={colors.success} strokeWidth={2} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{bookSessions.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sessions</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.warning + '20' }]}>
                <TrendingUp size={20} color={colors.warning} strokeWidth={2} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.avgPagesPerSession}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Pages/Session</Text>
            </View>
          </View>
        </View>

        {Object.keys(groupedSessions).length > 0 && (
          <View style={styles.journalSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reading Journal</Text>
            {Object.entries(groupedSessions).map(([date, daySessions]) => (
              <View key={date} style={[styles.dayGroup, { backgroundColor: colors.surface }]}>
                <Text style={[styles.dayDate, { color: colors.text }]}>{date}</Text>
                {daySessions.map((session, index) => (
                  <View key={session.id} style={styles.threadItem}>
                    <View style={styles.threadLeft}>
                      <View style={[styles.threadDot, { backgroundColor: colors.primary }]} />
                      {index < daySessions.length - 1 ? (
                        <View style={[styles.threadLine, { backgroundColor: colors.border }]} />
                      ) : null}
                    </View>

                    <View style={styles.threadContent}>
                      <View style={[styles.sessionHeader, { marginBottom: 8 }]}>
                        <View style={styles.sessionTime}>
                          <Clock size={14} color={colors.textTertiary} strokeWidth={2} />
                          <Text style={[styles.sessionTimeText, { color: colors.textSecondary }]}>{formatTime(session.startTime)}</Text>
                        </View>
                        <View style={[styles.sessionBadge, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.sessionBadgeText, { color: colors.primary }]}>{session.duration} min</Text>
                        </View>
                      </View>

                      <Text style={[styles.sessionPages, { color: colors.text }]}>
                        Read {session.pagesRead} {session.pagesRead === 1 ? 'page' : 'pages'}
                      </Text>

                      {session.reflection ? (
                        <View style={[styles.reflectionBubble, { backgroundColor: colors.surface }]}>
                          <Text style={[styles.sessionReflection, { color: colors.text }]}>{session.reflection}</Text>
                          <Text style={[styles.reflectionMeta, { color: colors.textSecondary }]}>{formatTime(session.startTime)}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {bookSessions.length === 0 && (
          <View style={[styles.emptyJournal, { backgroundColor: colors.surface }]}>
            <BookOpen size={48} color={colors.textTertiary} strokeWidth={1} />
            <Text style={[styles.emptyJournalTitle, { color: colors.text }]}>
              No reading sessions yet
            </Text>
            <Text style={[styles.emptyJournalDesc, { color: colors.textSecondary }]}>
              Start a focus session to track your reading
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showShareModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Share Book</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Share your reading progress
            </Text>

            <View style={styles.shareCardContainer}>
              {book && (
                <ShareBookCard
                  ref={shareCardRef}
                  book={book}
                  stats={{
                    totalMinutes: stats.totalMinutes,
                    totalPages: stats.totalPages,
                    sessionCount: bookSessions.length,
                  }}
                />
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: colors.primary }]}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Share2 size={20} color="#FFF" strokeWidth={2} />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setShowShareModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      
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
    padding: 24,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  bookHeader: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 20,
  },
  coverImage: {
    width: 120,
    height: 180,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  coverPlaceholder: {
    width: 120,
    height: 180,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  bookInfo: {
    flex: 1,
    gap: 6,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  progressCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '800' as const,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  descriptionCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  journalSection: {
    gap: 16,
  },
  dayGroup: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  sessionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sessionCardLast: {
    marginBottom: 0,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionTimeText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  sessionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sessionBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  sessionPages: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  sessionReflection: {
    fontSize: 14,
    lineHeight: 20,
  },
  reflectionBubble: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
  },
  reflectionMeta: {
    marginTop: 8,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  /* thread styles */
  threadItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  threadLeft: {
    width: 36,
    alignItems: 'center',
  },
  threadDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  threadLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
  },
  threadContent: {
    flex: 1,
    paddingLeft: 12,
  },
  emptyJournal: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyJournalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyJournalDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500' as const,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  shareCardContainer: {
    marginBottom: 24,
    transform: [{ scale: 0.85 }],
  },
  modalActions: {
    width: '100%',
    gap: 12,
  },
  shareButton: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  shareButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  cancelButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
});
