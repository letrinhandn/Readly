import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Platform, ActivityIndicator, Image, Dimensions, Keyboard } from 'react-native';
import { Stack, router } from 'expo-router';
import { BookOpen, Plus, X, Search, Camera } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { useReading } from '@/contexts/reading-context';
import { useTheme } from '@/contexts/theme-context';
import BookForm from '@/components/BookForm';
import { GoogleBook, Book } from '@/types/book';

export default function LibraryScreen() {
  const { books, addBook } = useReading();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isbn, setIsbn] = useState('');
  const [isbn13, setIsbn13] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [publisher, setPublisher] = useState('');
  const [categories, setCategories] = useState('');
  const [language, setLanguage] = useState('');
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalShowResults, setModalShowResults] = useState(false);
  const [modalMode, setModalMode] = useState<'search' | 'manual'>('search');
  const modalMaxHeight = Math.round(Dimensions.get('window').height * 0.8);
  const scrollRef = useRef<any>(null);
  const inputPositions = useRef<Record<string, { y: number; height: number }>>({});
  const scrollY = useRef<number>(0);
  const scrollViewHeight = useRef<number>(modalMaxHeight);
  const pendingFocusId = useRef<string | null>(null);

  const registerLayout = (id: string, e: any) => {
    const { y, height } = e.nativeEvent.layout;
    inputPositions.current[id] = { y, height };
  };

  const keyboardHeight = useRef<number>(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      keyboardHeight.current = e.endCoordinates?.height || 0;
      const id = pendingFocusId.current;
      if (id) {
        setTimeout(() => {
          performScrollToInput(id);
          pendingFocusId.current = null;
        }, 50);
      }
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      keyboardHeight.current = 0;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const performScrollToInput = (id: string) => {
    const entry = inputPositions.current[id];
    if (!entry) return;

    const { y: inputTop, height: inputHeight } = entry;
    const visibleTop = scrollY.current;
    const visibleBottom = scrollY.current + (scrollViewHeight.current || modalMaxHeight) - (keyboardHeight.current || 0);
    const inputBottom = inputTop + (inputHeight || 48);
    const paddingTop = 12;
    const paddingBottom = Math.max(40, keyboardHeight.current + 40);

    if (inputTop >= (visibleTop + paddingTop) && inputBottom <= (visibleBottom - paddingBottom)) {
      return;
    }

    let target = Math.max(0, inputTop - paddingTop);
    if (inputBottom > (visibleBottom - paddingBottom)) {
      const visibleArea = (scrollViewHeight.current || modalMaxHeight) - (keyboardHeight.current || 0);
      target = Math.max(0, inputTop - Math.max(paddingTop, visibleArea / 3));
    }

    scrollRef.current?.scrollTo({ y: target, animated: true });
  };

  const requestScrollToInput = (id: string) => {
    pendingFocusId.current = id;
    if (Platform.OS === 'web') {
      setTimeout(() => {
        performScrollToInput(id);
        pendingFocusId.current = null;
      }, 120);
      return;
    }

    if (keyboardHeight.current > 0) {
      setTimeout(() => {
        performScrollToInput(id);
        pendingFocusId.current = null;
      }, 80);
    }
  };

  

  const filterBooks = (booksList: Book[]) => {
    if (!internalSearchQuery.trim()) return booksList;
    const query = internalSearchQuery.toLowerCase();
    return booksList.filter(book => 
      book.title.toLowerCase().includes(query) || 
      book.author.toLowerCase().includes(query)
    );
  };

  const currentBooks = filterBooks(books.filter(b => b.status === 'reading'));
  const completedBooks = filterBooks(books.filter(b => b.status === 'completed'));

  // Note: page-level Google Books search removed — modal-only search kept below

  const modalGoogleBooksQuery = useQuery({
    queryKey: ['modalGoogleBooks', modalSearchQuery],
    queryFn: async () => {
      if (!modalSearchQuery.trim()) return [];
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(modalSearchQuery)}&maxResults=10`
      );
      const data = await response.json();
      return (data.items || []) as GoogleBook[];
    },
    enabled: modalSearchQuery.trim().length > 0 && modalShowResults,
  });

  const handleSelectModalGoogleBook = (book: GoogleBook) => {
    setTitle(book.volumeInfo.title);
    setAuthor(book.volumeInfo.authors?.join(', ') || 'Unknown Author');
    setTotalPages(book.volumeInfo.pageCount?.toString() || '');
    const isbn13 = book.volumeInfo.industryIdentifiers?.find(
      id => id.type === 'ISBN_13'
    )?.identifier;
    const isbnVal = book.volumeInfo.industryIdentifiers?.find(
      id => id.type === 'ISBN_10'
    )?.identifier || isbn13;

    setDescription(book.volumeInfo.description || '');
    setThumbnail(book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '');
    setCoverUrl(book.volumeInfo.imageLinks?.medium?.replace('http:', 'https:') || book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '');
    setIsbn(isbnVal || '');
    setIsbn13(isbn13 || '');
    setPublishedDate(book.volumeInfo.publishedDate || '');
    setPublisher(book.volumeInfo.publisher || '');
    setCategories((book.volumeInfo.categories || []).join(', '));
    setLanguage(book.volumeInfo.language || '');

    setModalShowResults(false);
    setModalSearchQuery('');
    setModalMode('manual');
  };

  const handleAddBook = () => {
    if (!title.trim() || !author.trim() || !totalPages.trim()) {
      return;
    }

    addBook({
      title: title.trim(),
      author: author.trim(),
      totalPages: parseInt(totalPages, 10),
      currentPage: 0,
      startedAt: new Date().toISOString(),
      status: 'reading',
      description: description || undefined,
      thumbnail: thumbnail || undefined,
      coverUrl: coverUrl || undefined,
      isbn: isbn || undefined,
      isbn13: isbn13 || undefined,
      publishedDate: publishedDate || undefined,
      publisher: publisher || undefined,
      categories: categories ? categories.split(',').map(c => c.trim()).filter(Boolean) : undefined,
      language: language || undefined,
      pageCount: totalPages ? parseInt(totalPages, 10) : undefined,
    });

  setTitle('');
  setAuthor('');
  setTotalPages('');
  setDescription('');
  setCoverUrl('');
  setThumbnail('');
  setIsbn('');
  setIsbn13('');
  setPublishedDate('');
  setPublisher('');
  setCategories('');
  setLanguage('');
  setModalMode('search');
    setModalVisible(false);
    

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSelectGoogleBook = (book: GoogleBook) => {
    const isbn13 = book.volumeInfo.industryIdentifiers?.find(
      id => id.type === 'ISBN_13'
    )?.identifier;
    const isbn = book.volumeInfo.industryIdentifiers?.find(
      id => id.type === 'ISBN_10'
    )?.identifier || isbn13;

    addBook({
      title: book.volumeInfo.title,
      author: book.volumeInfo.authors?.join(', ') || 'Unknown Author',
      totalPages: book.volumeInfo.pageCount || 0,
      currentPage: 0,
      startedAt: new Date().toISOString(),
      status: 'reading',
      description: book.volumeInfo.description,
      thumbnail: book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
      coverUrl: book.volumeInfo.imageLinks?.medium?.replace('http:', 'https:') || book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
      isbn,
      isbn13,
      publishedDate: book.volumeInfo.publishedDate,
      publisher: book.volumeInfo.publisher,
      categories: book.volumeInfo.categories,
      language: book.volumeInfo.language,
      pageCount: book.volumeInfo.pageCount,
      googleBooksId: book.id,
    });


    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleOpenCamera = () => {
    setModalVisible(false);
    router.push('/scan-book');
  };

  const handleBookPress = (book: Book) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/book-detail?id=${book.id}`);
  };

  const renderBookShelf = (title: string, bookList: Book[]) => {
    if (bookList.length === 0) return null;

    const screenWidth = Dimensions.get('window').width;
    const padding = 24;
    const gap = 16;
    const bookWidth = (screenWidth - (padding * 2) - (gap * 2)) / 3;

    const rows: Book[][] = [];
    for (let i = 0; i < bookList.length; i += 3) {
      rows.push(bookList.slice(i, i + 3));
    }

    return (
      <View style={styles.shelfSection}>
        <View style={styles.shelfHeader}>
          <Text style={[styles.shelfTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.bookCount, { color: colors.textSecondary }]}>
            {bookList.length} {bookList.length === 1 ? 'book' : 'books'}
          </Text>
        </View>
        <View style={styles.gridContainer}>
          {rows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.gridRow}>
              {row.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={[styles.bookCard, { width: bookWidth }]}
                  onPress={() => handleBookPress(book)}
                  activeOpacity={0.8}
                >
                  {book.thumbnail || book.coverUrl ? (
                    <Image
                      source={{ uri: book.coverUrl || book.thumbnail }}
                      style={[styles.bookCover, { width: bookWidth, height: bookWidth * 1.5 }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.bookCoverPlaceholder, { backgroundColor: colors.primary + '30', width: bookWidth, height: bookWidth * 1.5 }]}>
                      <BookOpen size={32} color={colors.primary} strokeWidth={1.5} />
                    </View>
                  )}
                  <View style={styles.bookInfo}>
                    <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
                      {book.title}
                    </Text>
                    <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                      {book.author}
                    </Text>
                    {book.status === 'reading' && (
                      (() => {
                        const percent = book.totalPages ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
                        return (
                          <View style={styles.progressContainer}>
                            <Text style={[styles.progressPercentage, { color: colors.primary }]}>
                              {percent}%
                            </Text>
                            <View style={[styles.progressBarContainer, { backgroundColor: colors.surfaceSecondary }]}>
                              <View style={[styles.progressBar, { width: `${percent}%`, backgroundColor: colors.primary }]} />
                            </View>
                          </View>
                        );
                      })()
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
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
          <Text style={[styles.pageTitle, { color: colors.text }]}>Library</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>Your reading collection</Text>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={20} color={colors.textTertiary} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={internalSearchQuery}
            onChangeText={setInternalSearchQuery}
            placeholder="Search your library..."
            placeholderTextColor={colors.textTertiary}
          />
          {internalSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setInternalSearchQuery('')}>
              <X size={20} color={colors.textTertiary} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        

        {renderBookShelf('Currently Reading', currentBooks)}
        {renderBookShelf('Completed', completedBooks)}

        {books.length === 0 && (
          <View style={styles.emptyState}>
            <BookOpen size={64} color={colors.textTertiary} strokeWidth={1} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Your library is empty</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Search for books or add manually</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          setModalVisible(true);
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }}
        activeOpacity={0.8}
      >
        <Plus size={28} color={colors.surface} strokeWidth={2.5} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalInner, { height: modalMaxHeight }]}> 
              <View style={styles.modalFixedHeader}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Book</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                    <X size={24} color={colors.textSecondary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalToggle}>
                  <TouchableOpacity
                    style={[styles.modalToggleButton, modalMode === 'search' && styles.modalToggleActive]}
                    onPress={() => setModalMode('search')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modalToggleText, modalMode === 'search' && styles.modalToggleTextActive]}>Search</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalToggleButton, modalMode === 'manual' && styles.modalToggleActive]}
                    onPress={() => setModalMode('manual')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modalToggleText, modalMode === 'manual' && styles.modalToggleTextActive]}>Add manually</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                ref={scrollRef}
                contentContainerStyle={{ padding: 20, paddingBottom: Math.max(40, keyboardHeight.current + 40) }}
                style={{ flex: 1 }}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={true}
                onLayout={(e) => { scrollViewHeight.current = e.nativeEvent.layout.height; }}
                onScroll={(e) => { scrollY.current = e.nativeEvent.contentOffset.y; }}
                scrollEventThrottle={16}
              >
                {modalMode === 'search' ? (
                  <>
                    <View style={[styles.modalSearchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                      <Search size={20} color={colors.textTertiary} strokeWidth={2} />
                      <TextInput
                        style={[styles.modalSearchInput, { color: colors.text }]}
                        value={modalSearchQuery}
                        onChangeText={(text) => {
                          setModalSearchQuery(text);
                          setModalShowResults(text.trim().length > 0);
                        }}
                        placeholder="Search Google Books..."
                        placeholderTextColor={colors.textTertiary}
                      />
                      {modalSearchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setModalSearchQuery(''); setModalShowResults(false); }}>
                          <X size={20} color={colors.textTertiary} strokeWidth={2} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {modalShowResults && modalSearchQuery.trim().length > 0 && (
                      <View style={[styles.modalResultsContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                        <View style={styles.modalResultsHeader}>
                          <Text style={[styles.modalResultsTitle, { color: colors.text }]}>Google Books Results</Text>
                          <TouchableOpacity onPress={() => setModalShowResults(false)}>
                            <X size={20} color={colors.textSecondary} strokeWidth={2} />
                          </TouchableOpacity>
                        </View>
                        {modalGoogleBooksQuery.isLoading ? (
                          <View style={styles.modalLoadingContainer}>
                            <ActivityIndicator size="small" color={colors.primary} />
                          </View>
                        ) : (
                          <ScrollView style={styles.modalResults} showsVerticalScrollIndicator={false}>
                            {(modalGoogleBooksQuery.data || []).map((book) => (
                              <TouchableOpacity
                                key={book.id}
                                style={[styles.modalBookCard, { backgroundColor: colors.surface }]}
                                onPress={() => handleSelectModalGoogleBook(book)}
                                activeOpacity={0.7}
                              >
                                {book.volumeInfo.imageLinks?.thumbnail && (
                                  <Image source={{ uri: book.volumeInfo.imageLinks.thumbnail }} style={styles.modalBookCover} />
                                )}
                                <View style={styles.modalBookInfo}>
                                  <Text style={[styles.modalBookTitle, { color: colors.text }]} numberOfLines={2}>{book.volumeInfo.title}</Text>
                                  <Text style={[styles.modalBookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>{book.volumeInfo.authors?.join(', ') || 'Unknown Author'}</Text>
                                  {book.volumeInfo.pageCount && (<Text style={[styles.modalBookPages, { color: colors.textTertiary }]}>{book.volumeInfo.pageCount} pages</Text>)}
                                </View>
                              </TouchableOpacity>
                            ))}
                            {modalGoogleBooksQuery.data && modalGoogleBooksQuery.data.length === 0 && (
                              <Text style={[styles.modalNoResults, { color: colors.textSecondary }]}>No books found</Text>
                            )}
                          </ScrollView>
                        )}
                      </View>
                    )}
                  </>
                ) : (
                  <>
                      <BookForm
                        initialValues={{
                          title,
                          author,
                          totalPages,
                          coverUrl,
                          thumbnail,
                          isbn,
                          isbn13,
                          publishedDate,
                          publisher,
                          categories,
                          language,
                          description,
                        }}
                        onSubmit={(vals) => {
                          addBook({
                            title: vals.title || '',
                            author: vals.author || '',
                            totalPages: parseInt(vals.totalPages || '0', 10) || 0,
                            currentPage: 0,
                            startedAt: new Date().toISOString(),
                            status: 'reading',
                            description: vals.description || undefined,
                            thumbnail: vals.thumbnail || undefined,
                            coverUrl: vals.coverUrl || undefined,
                            isbn: vals.isbn || undefined,
                            isbn13: vals.isbn13 || undefined,
                            publishedDate: vals.publishedDate || undefined,
                            publisher: vals.publisher || undefined,
                            categories: vals.categories ? vals.categories.split(',').map(c => c.trim()).filter(Boolean) : undefined,
                            language: vals.language || undefined,
                            pageCount: vals.totalPages ? parseInt(vals.totalPages, 10) : undefined,
                          });


                            setTitle('');
                            setAuthor('');
                            setTotalPages('');
                            setDescription('');
                            setCoverUrl('');
                            setThumbnail('');
                            setIsbn('');
                            setIsbn13('');
                            setPublishedDate('');
                            setPublisher('');
                            setCategories('');
                            setLanguage('');
                            setModalMode('search');
                            setModalVisible(false);

                          if (Platform.OS !== 'web') {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }
                        }}
                        onCancel={() => setModalMode('search')}
                        submitLabel="Add Book"
                        showScanButton
                        onScan={handleOpenCamera}
                        registerLayout={registerLayout}
                        onFocusRequest={requestScrollToInput}
                      />
                  </>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: colors.primary }, (!title.trim() || !author.trim() || !totalPages.trim()) && styles.addButtonDisabled]}
                  onPress={handleAddBook}
                  disabled={!title.trim() || !author.trim() || !totalPages.trim()}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.addButtonText, { color: colors.surface }]}>Add Book</Text>
                </TouchableOpacity>
              </View>
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
    paddingTop: 60,
    paddingBottom: 168,
  },
  header: {
    marginBottom: 32,
    paddingHorizontal: 24,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    marginHorizontal: 24,
  },
  googleSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    marginHorizontal: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  googleResultsContainer: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    maxHeight: 400,
    borderWidth: 1,
    marginHorizontal: 24,
  },
  googleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  googleTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  googleResults: {
    maxHeight: 330,
  },
  googleBookCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  googleBookCover: {
    width: 50,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  googleBookInfo: {
    flex: 1,
  },
  googleBookTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  googleBookAuthor: {
    fontSize: 13,
    marginBottom: 4,
  },
  googleBookPages: {
    fontSize: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResults: {
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },
  shelfSection: {
    marginBottom: 40,
  },
  shelfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  shelfTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  bookCount: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  gridContainer: {
    paddingHorizontal: 24,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 20,
  },
  bookCard: {
    alignItems: 'stretch',
  },
  bookCover: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bookCoverPlaceholder: {
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
    marginTop: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 4,
    lineHeight: 18,
  },
  bookAuthor: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '700' as const,
    minWidth: 32,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
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
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 520,
    // we'll set explicit height when rendering using modalMaxHeight
    maxHeight: '80%',
    borderRadius: 20,
    padding: 0,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  modalInner: {
    width: '100%',
    flexDirection: 'column',
  },
  modalFixedHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  modalFooter: {
    padding: 16,
    paddingBottom: 50,
    borderTopWidth: 1,
    borderTopColor: '#00000006',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1.5,
  },
  scanButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  addButton: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 52,
    width: '92%',
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  modalToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  modalToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  modalToggleActive: {
    backgroundColor: '#eee',
  },
  modalToggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#444',
  },
  modalToggleTextActive: {
    color: '#000',
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  modalSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  modalResultsContainer: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    maxHeight: 260,
    borderWidth: 1,
  },
  modalResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalResultsTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  modalResults: {
    maxHeight: 220,
  },
  modalBookCard: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  modalBookCover: {
    width: 40,
    height: 60,
    borderRadius: 6,
    marginRight: 10,
  },
  modalBookInfo: {
    flex: 1,
  },
  modalBookTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  modalBookAuthor: {
    fontSize: 12,
    marginBottom: 2,
  },
  modalBookPages: {
    fontSize: 11,
  },
  modalLoadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalNoResults: {
    textAlign: 'center',
    padding: 12,
    fontSize: 13,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
});
