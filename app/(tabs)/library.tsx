import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Platform, ActivityIndicator, Image, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { BookOpen, Plus, X, Search, Camera } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { useReading } from '@/contexts/reading-context';
import { useTheme } from '@/contexts/theme-context';
import { GoogleBook, Book } from '@/types/book';

export default function LibraryScreen() {
  const { books, addBook } = useReading();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [showGoogleResults, setShowGoogleResults] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');

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

  const googleBooksQuery = useQuery({
    queryKey: ['googleBooks', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10`
      );
      const data = await response.json();
      return (data.items || []) as GoogleBook[];
    },
    enabled: searchQuery.trim().length > 0 && showGoogleResults,
  });

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
    });

    setTitle('');
    setAuthor('');
    setTotalPages('');
    setModalVisible(false);
    setShowGoogleResults(false);
    setSearchQuery('');

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

    setShowGoogleResults(false);
    setSearchQuery('');

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
                      <View style={styles.progressContainer}>
                        <Text style={[styles.progressPercentage, { color: colors.primary }]}>
                          {Math.round((book.currentPage / book.totalPages) * 100)}%
                        </Text>
                        <View style={[styles.progressBarContainer, { backgroundColor: colors.surfaceSecondary }]}>
                          <View style={[styles.progressBar, { width: `${Math.round((book.currentPage / book.totalPages) * 100)}%`, backgroundColor: colors.primary }]} />
                        </View>
                      </View>
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

        {!showGoogleResults && books.length > 0 && (
          <View style={[styles.googleSearchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={20} color={colors.textTertiary} strokeWidth={2} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setShowGoogleResults(text.trim().length > 0);
              }}
              placeholder="Search Google Books..."
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        )}

        {showGoogleResults && searchQuery.trim().length > 0 && (
          <View style={[styles.googleResultsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.googleHeader}>
              <Text style={[styles.googleTitle, { color: colors.text }]}>Google Books Results</Text>
              <TouchableOpacity onPress={() => setShowGoogleResults(false)}>
                <X size={20} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            {googleBooksQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <ScrollView style={styles.googleResults} showsVerticalScrollIndicator={false}>
                {(googleBooksQuery.data || []).map((book) => (
                  <TouchableOpacity
                    key={book.id}
                    style={[styles.googleBookCard, { backgroundColor: colors.surfaceSecondary }]}
                    onPress={() => handleSelectGoogleBook(book)}
                    activeOpacity={0.7}
                  >
                    {book.volumeInfo.imageLinks?.thumbnail && (
                      <Image
                        source={{ uri: book.volumeInfo.imageLinks.thumbnail }}
                        style={styles.googleBookCover}
                      />
                    )}
                    <View style={styles.googleBookInfo}>
                      <Text style={[styles.googleBookTitle, { color: colors.text }]} numberOfLines={2}>
                        {book.volumeInfo.title}
                      </Text>
                      <Text style={[styles.googleBookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                        {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
                      </Text>
                      {book.volumeInfo.pageCount && (
                        <Text style={[styles.googleBookPages, { color: colors.textTertiary }]}>
                          {book.volumeInfo.pageCount} pages
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
                {googleBooksQuery.data && googleBooksQuery.data.length === 0 && (
                  <Text style={[styles.noResults, { color: colors.textSecondary }]}>No books found</Text>
                )}
              </ScrollView>
            )}
          </View>
        )}

        {renderBookShelf('Currently Reading', currentBooks)}
        {renderBookShelf('Completed', completedBooks)}

        {books.length === 0 && !showGoogleResults && (
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
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Book</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                <X size={24} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.scanButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              onPress={handleOpenCamera}
              activeOpacity={0.7}
            >
              <Camera size={20} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.scanButtonText, { color: colors.primary }]}>Scan Book Cover</Text>
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Book Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter book title"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Author</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                value={author}
                onChangeText={setAuthor}
                placeholder="Enter author name"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Total Pages</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                value={totalPages}
                onChangeText={setTotalPages}
                placeholder="Enter total pages"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
              />
            </View>

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
    paddingBottom: 120,
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
    bottom: 90,
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
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    padding: 28,
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
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
});
