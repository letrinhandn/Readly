import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal, Image, TextInput, PanResponder, Animated, Dimensions } from 'react-native';
import { router, Stack } from 'expo-router';
import { BookOpen, Play, X, ChevronRight, Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useReading } from '@/contexts/reading-context';
import { useTheme } from '@/contexts/theme-context';
import { Book } from '@/types/book';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const isSmallScreen = SCREEN_WIDTH < 375;
const isMediumScreen = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const scale = SCREEN_WIDTH / 375;
const verticalScale = SCREEN_HEIGHT / 667;

export default function FocusScreen() {
  const { currentBooks } = useReading();
  const { colors } = useTheme();
  const [currentBookIndex, setCurrentBookIndex] = useState<number>(0);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  
  const pan = useRef(new Animated.ValueXY()).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  
  const selectedBook = currentBooks[currentBookIndex] || null;

  const swipeToNext = () => {
    if (currentBookIndex < currentBooks.length - 1) {
      setCurrentBookIndex(currentBookIndex + 1);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const swipeToPrev = () => {
    if (currentBookIndex > 0) {
      setCurrentBookIndex(currentBookIndex - 1);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: 0 });
        const opacity = 1 - Math.abs(gestureState.dx) / (SCREEN_WIDTH * 0.7);
        cardOpacity.setValue(Math.max(0.5, opacity));
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          Animated.timing(pan, {
            toValue: { x: SCREEN_WIDTH, y: 0 },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            swipeToPrev();
            pan.setValue({ x: 0, y: 0 });
            cardOpacity.setValue(1);
          });
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          Animated.timing(pan, {
            toValue: { x: -SCREEN_WIDTH, y: 0 },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            swipeToNext();
            pan.setValue({ x: 0, y: 0 });
            cardOpacity.setValue(1);
          });
        } else {
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }),
            Animated.timing(cardOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const handleStartReading = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (selectedBook) {
      router.push({ pathname: '/focus-session', params: { bookId: selectedBook.id } });
    } else if (currentBooks.length > 0) {
      setShowBookPicker(true);
    } else {
      router.push('/add-book');
    }
  };

  const handleSelectBook = (book: Book) => {
    const bookIndex = currentBooks.findIndex(b => b.id === book.id);
    if (bookIndex !== -1) {
      setCurrentBookIndex(bookIndex);
    }
    setShowBookPicker(false);
    setBookSearchQuery('');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const filteredBooks = useMemo(() => {
    if (!bookSearchQuery.trim()) return currentBooks;
    const query = bookSearchQuery.toLowerCase();
    return currentBooks.filter(book => 
      book.title.toLowerCase().includes(query) || 
      book.author.toLowerCase().includes(query)
    );
  }, [currentBooks, bookSearchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '', headerShown: false }} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>Focus</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Begin your reading routine</Text>
        </View>

        <View style={styles.mainContent}>
          {selectedBook ? (
            <Animated.View 
              {...panResponder.panHandlers}
              style={[
                styles.selectedBookCard,
                { backgroundColor: colors.surface },
                {
                  transform: [{ translateX: pan.x }],
                  opacity: cardOpacity,
                },
              ]}
            >
              {selectedBook.thumbnail && selectedBook.thumbnail.length > 0 ? (
                <Image 
                  source={{ uri: selectedBook.thumbnail }} 
                  style={styles.bookCoverLarge}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.bookCoverLargePlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
                  <BookOpen size={56} color={colors.primary} strokeWidth={1.5} />
                </View>
              )}
              <Text style={[styles.bookTitleLarge, { color: colors.text }]} numberOfLines={2}>
                {selectedBook.title}
              </Text>
              <Text style={[styles.bookAuthorLarge, { color: colors.textSecondary }]} numberOfLines={1}>
                {selectedBook.author}
              </Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.surfaceSecondary }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${(selectedBook.currentPage / selectedBook.totalPages) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                  {selectedBook.currentPage} / {selectedBook.totalPages} pages
                </Text>
              </View>
              {currentBooks.length > 1 && (
                <View style={styles.swipeIndicatorContainer}>
                  <View style={styles.dotsContainer}>
                    {currentBooks.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          { backgroundColor: index === currentBookIndex ? colors.primary : colors.surfaceSecondary },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.swipeHint, { color: colors.textTertiary }]}>
                    Swipe to browse • {currentBookIndex + 1} of {currentBooks.length}
                  </Text>
                </View>
              )}
            </Animated.View>
          ) : (
            <View style={styles.noBookState}>
              <View style={[styles.noBookIcon, { backgroundColor: colors.surface }]}>
                <BookOpen size={48} color={colors.textTertiary} strokeWidth={1.5} />
              </View>
              <Text style={[styles.noBookText, { color: colors.text }]}>No book selected</Text>
              <Text style={[styles.noBookSubtext, { color: colors.textSecondary }]}>Add a book from your library</Text>
            </View>
          )}

        </View>

        {currentBooks.length > 0 && (
          <TouchableOpacity
            style={styles.changeBookButton}
            onPress={() => setShowBookPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.changeBookText, { color: colors.primary }]}>Change Book</Text>
            <ChevronRight size={18} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.startButton,
            { backgroundColor: colors.primary },
            (!selectedBook && currentBooks.length === 0) && styles.startButtonDisabled
          ]}
          onPress={handleStartReading}
          activeOpacity={0.85}
          disabled={!selectedBook && currentBooks.length === 0}
        >
          <View style={styles.playIcon}>
            <Play size={Math.round(28 * scale)} color={colors.surface} strokeWidth={2.5} fill={colors.surface} />
          </View>
          <Text style={[styles.startButtonText, { color: colors.surface }]}>Start Focus Timer</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showBookPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookPicker(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select a Book</Text>
              <TouchableOpacity onPress={() => {
                setShowBookPicker(false);
                setBookSearchQuery('');
              }} activeOpacity={0.7}>
                <X size={24} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={[styles.bookSearchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Search size={20} color={colors.textTertiary} strokeWidth={2} />
              <TextInput
                style={[styles.bookSearchInput, { color: colors.text }]}
                value={bookSearchQuery}
                onChangeText={setBookSearchQuery}
                placeholder="Search books..."
                placeholderTextColor={colors.textTertiary}
              />
              {bookSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setBookSearchQuery('')}>
                  <X size={20} color={colors.textTertiary} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.bookList} showsVerticalScrollIndicator={false}>
              {filteredBooks.length === 0 ? (
                <View style={styles.noResultsContainer}>
                  <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>No books found</Text>
                </View>
              ) : (
                filteredBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={[
                    styles.bookPickerItem,
                    { backgroundColor: colors.surfaceSecondary },
                    selectedBook?.id === book.id && [styles.bookPickerItemSelected, { backgroundColor: colors.primary + '15', borderColor: colors.primary }],
                  ]}
                  onPress={() => handleSelectBook(book)}
                  activeOpacity={0.7}
                >
                  {book.thumbnail && book.thumbnail.length > 0 ? (
                    <Image source={{ uri: book.thumbnail }} style={styles.bookPickerCover} resizeMode="cover" />
                  ) : (
                    <View style={[styles.bookPickerCoverPlaceholder, { backgroundColor: colors.surface }]}>
                      <BookOpen size={24} color={colors.primary} strokeWidth={1.5} />
                    </View>
                  )}
                  <View style={styles.bookPickerInfo}>
                    <Text style={[styles.bookPickerTitle, { color: colors.text }]} numberOfLines={2}>
                      {book.title}
                    </Text>
                    <Text style={[styles.bookPickerAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                      {book.author}
                    </Text>
                  </View>
                  {selectedBook?.id === book.id && (
                    <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.checkmarkText, { color: colors.surface }]}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )))
              }
            </ScrollView>
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
    flexGrow: 1,
    paddingTop: Math.max(50, 60 * verticalScale),
    paddingHorizontal: Math.max(16, 24 * scale),
    paddingBottom: Math.max(30, 40 * verticalScale),
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: Math.max(24, 32 * verticalScale),
  },
  greeting: {
    fontSize: Math.min(36, Math.max(28, 36 * scale)),
    fontWeight: '800' as const,
    marginBottom: 4,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: Math.min(17, Math.max(15, 17 * scale)),
    fontWeight: '500' as const,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SCREEN_HEIGHT * 0.4,
  },
  selectedBookCard: {
    borderRadius: Math.max(20, 28 * scale),
    padding: Math.max(16, 24 * scale),
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  bookCoverLarge: {
    width: Math.max(110, 140 * scale),
    height: Math.max(165, 210 * scale),
    borderRadius: Math.max(10, 14 * scale),
    marginBottom: Math.max(12, 18 * scale),
  },
  bookCoverLargePlaceholder: {
    width: Math.max(110, 140 * scale),
    height: Math.max(165, 210 * scale),
    borderRadius: Math.max(10, 14 * scale),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Math.max(12, 18 * scale),
  },
  bookTitleLarge: {
    fontSize: Math.min(22, Math.max(18, 22 * scale)),
    fontWeight: '800' as const,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  bookAuthorLarge: {
    fontSize: Math.min(16, Math.max(14, 16 * scale)),
    textAlign: 'center',
    marginBottom: Math.max(16, 24 * scale),
    fontWeight: '500' as const,
  },
  progressContainer: {
    width: '100%',
    gap: Math.max(6, 8 * scale),
  },
  progressBar: {
    height: Math.max(6, 8 * scale),
    borderRadius: Math.max(3, 4 * scale),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Math.max(3, 4 * scale),
  },
  progressText: {
    fontSize: Math.min(13, Math.max(11, 13 * scale)),
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  noBookState: {
    alignItems: 'center',
    padding: 40,
  },
  noBookIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  noBookText: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  noBookSubtext: {
    fontSize: 15,
    textAlign: 'center',
  },
  changeBookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Math.max(8, 12 * scale),
    marginTop: Math.max(12, 16 * scale),
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  changeBookText: {
    fontSize: Math.min(16, Math.max(14, 16 * scale)),
    fontWeight: '600' as const,
  },
  startButton: {
    borderRadius: Math.max(18, 24 * scale),
    paddingVertical: Math.max(16, 20 * scale),
    paddingHorizontal: Math.max(24, 32 * scale),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Math.max(8, 12 * scale),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  playIcon: {
    width: Math.max(36, 44 * scale),
    height: Math.max(36, 44 * scale),
    borderRadius: Math.max(18, 22 * scale),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: Math.min(20, Math.max(17, 20 * scale)),
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  bookSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  bookSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 15,
  },
  bookList: {
    maxHeight: 400,
  },
  bookPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  bookPickerItemSelected: {
    borderWidth: 2,
  },
  bookPickerCover: {
    width: 50,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  bookPickerCoverPlaceholder: {
    width: 50,
    height: 70,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookPickerInfo: {
    flex: 1,
  },
  bookPickerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  bookPickerAuthor: {
    fontSize: 14,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  swipeIndicatorContainer: {
    marginTop: Math.max(16, 24 * scale),
    alignItems: 'center',
    gap: Math.max(8, 12 * scale),
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: Math.max(6, 8 * scale),
    alignItems: 'center',
  },
  dot: {
    width: Math.max(6, 8 * scale),
    height: Math.max(6, 8 * scale),
    borderRadius: Math.max(3, 4 * scale),
  },
  swipeHint: {
    fontSize: Math.min(13, Math.max(11, 13 * scale)),
    fontWeight: '500' as const,
  },
});
