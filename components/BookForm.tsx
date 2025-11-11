import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useTheme } from '@/contexts/theme-context';

export type BookFormValues = {
  title?: string;
  author?: string;
  totalPages?: string;
  coverUrl?: string;
  thumbnail?: string;
  isbn?: string;
  isbn13?: string;
  publishedDate?: string;
  publisher?: string;
  categories?: string;
  language?: string;
  description?: string;
};

type Props = {
  initialValues?: BookFormValues;
  onSubmit: (values: BookFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
  showScanButton?: boolean;
  onScan?: () => void;
  registerLayout?: (id: string, e: any) => void;
  onFocusRequest?: (id: string) => void;
};

export default function BookForm({
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  showScanButton = false,
  onScan,
  registerLayout,
  onFocusRequest,
}: Props) {
  const { colors } = useTheme();

  const [title, setTitle] = useState(initialValues.title || '');
  const [author, setAuthor] = useState(initialValues.author || '');
  const [totalPages, setTotalPages] = useState(initialValues.totalPages?.toString() || '');
  const [coverUrl, setCoverUrl] = useState(initialValues.coverUrl || '');
  const [thumbnail, setThumbnail] = useState(initialValues.thumbnail || '');
  const [isbn13, setIsbn13] = useState(initialValues.isbn13 || '');
  const [isbn, setIsbn] = useState(initialValues.isbn || '');
  const [publishedDate, setPublishedDate] = useState(initialValues.publishedDate || '');
  const [publisher, setPublisher] = useState(initialValues.publisher || '');
  const [categories, setCategories] = useState(initialValues.categories || '');
  const [language, setLanguage] = useState(initialValues.language || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const scrollRef = useRef<any>(null);
  const inputPositions = useRef<Record<string, { y: number; height: number }>>({});
  const scrollY = useRef<number>(0);
  const scrollViewHeight = useRef<number>(0);
  const contentHeight = useRef<number>(0);
  const pendingFocusId = useRef<string | null>(null);
  const focusedInputId = useRef<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  useEffect(() => {
    setTitle(initialValues.title || '');
    setAuthor(initialValues.author || '');
    setTotalPages(initialValues.totalPages?.toString() || '');
    setCoverUrl(initialValues.coverUrl || '');
    setThumbnail(initialValues.thumbnail || '');
    setIsbn13(initialValues.isbn13 || '');
    setIsbn(initialValues.isbn || '');
    setPublishedDate(initialValues.publishedDate || '');
    setPublisher(initialValues.publisher || '');
    setCategories(initialValues.categories || '');
    setLanguage(initialValues.language || '');
    setDescription(initialValues.description || '');
  }, [initialValues]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      const h = e.endCoordinates?.height || 0;
      setKeyboardHeight(h);
      const id = pendingFocusId.current;
      if (id) {
        setTimeout(() => {
          performScrollToInput(id);
          pendingFocusId.current = null;
        }, 50);
      }
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSubmit = () => {
    if (!title.trim() || !author.trim() || !totalPages.trim()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      author: author.trim(),
      totalPages: totalPages.trim(),
      coverUrl: coverUrl.trim() || undefined,
      thumbnail: thumbnail.trim() || undefined,
      isbn13: isbn13.trim() || undefined,
      isbn: isbn.trim() || undefined,
      publishedDate: publishedDate.trim() || undefined,
      publisher: publisher.trim() || undefined,
      categories: categories.trim() || undefined,
      language: language.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  const renderInput = (id: string, label: string, value: string, setValue: (v: string) => void, options?: any) => (
    <View
      style={styles.field}
      onLayout={(e) => {
        registerLayout?.(id, e);
        inputPositions.current[id] = { y: e.nativeEvent.layout.y, height: e.nativeEvent.layout.height };
      }}
    >
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
        value={value}
        onChangeText={setValue}
        placeholder={options?.placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={options?.keyboardType}
        multiline={options?.multiline}
        onFocus={() => {
          focusedInputId.current = id;
          const skipScroll = id === 'coverUrl' || id === 'thumbnail';
          if (!skipScroll) {
            pendingFocusId.current = id;
            if (keyboardHeight > 0) {
              setTimeout(() => {
                performScrollToInput(id);
                pendingFocusId.current = null;
              }, 80);
            }
          }
          onFocusRequest?.(id);
        }}
        onBlur={() => { focusedInputId.current = null; }}
        onContentSizeChange={options?.multiline ? () => {
          if (focusedInputId.current === id || keyboardHeight > 0 || pendingFocusId.current === id) {
            setTimeout(() => performScrollToInput(id), 120);
          }
        } : undefined}
      />
    </View>
  );

  const performScrollToInput = (id: string) => {
    const entry = inputPositions.current[id];
    if (!entry) return;

    const { y: inputTop, height: inputHeight } = entry;
    const visibleTop = scrollY.current;
    const svHeight = scrollViewHeight.current || 400;
    const kb = keyboardHeight || 0;
    const visibleArea = svHeight - kb;
    const inputBottom = inputTop + (inputHeight || 48);

    const margin = 12;
    if (inputTop >= visibleTop + margin && inputBottom <= visibleTop + visibleArea - margin) return;

    const centerOffset = Math.max(0, Math.floor((visibleArea - (inputHeight || 48)) / 2) - 8);
    let target = Math.max(0, inputTop - centerOffset);

    const minBottomPadding = 8;
    const maxScroll = Math.max(0, (contentHeight.current || 0) - svHeight - minBottomPadding);
    if (target < 0) target = 0;
    if (target > maxScroll) target = maxScroll;

    scrollRef.current?.scrollTo({ y: target, animated: true });
    setTimeout(() => scrollRef.current?.scrollTo({ y: target, animated: true }), 80);
    setTimeout(() => scrollRef.current?.scrollTo({ y: target, animated: true }), 220);
  };

  return (
    <View style={{ width: '100%', flex: 1 }}>
      {showScanButton && onScan && (
        <TouchableOpacity style={[styles.scanButton, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]} onPress={onScan} activeOpacity={0.8}>
          <Text style={[styles.scanButtonText, { color: colors.primary }]}>Add Book Cover</Text>
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 40}
        style={{ width: '100%', flex: 1 }}
      >
        <ScrollView
          ref={(r) => { scrollRef.current = r; }}
          contentContainerStyle={{ paddingBottom: Math.max(24, keyboardHeight + 16) }}
          scrollIndicatorInsets={{ bottom: Math.max(24, keyboardHeight + 16) }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          onScroll={(e) => { scrollY.current = e.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={16}
          onLayout={(e) => { scrollViewHeight.current = e.nativeEvent.layout.height; }}
          onContentSizeChange={(_, h) => { contentHeight.current = h; }}
        >
        {renderInput('title', 'Book Title *', title, setTitle, { placeholder: 'Enter book title' })}
        {renderInput('author', 'Author *', author, setAuthor, { placeholder: 'Enter author name' })}
        {renderInput('totalPages', 'Total Pages *', totalPages, setTotalPages, { placeholder: 'Enter total pages', keyboardType: 'number-pad' })}

        {((coverUrl && (coverUrl.startsWith('http') || coverUrl.startsWith('file') || coverUrl.startsWith('content'))) || (thumbnail && (thumbnail.startsWith('http') || thumbnail.startsWith('file') || thumbnail.startsWith('content')))) && (
          <Image source={{ uri: (coverUrl && (coverUrl.startsWith('http') || coverUrl.startsWith('file') || coverUrl.startsWith('content'))) ? coverUrl : thumbnail }} style={styles.preview} resizeMode="cover" />
        )}

        {renderInput('coverUrl', 'Cover URL (optional)', coverUrl, setCoverUrl, { placeholder: 'https://...' })}
        {renderInput('thumbnail', 'Thumbnail URL (optional)', thumbnail, setThumbnail, { placeholder: 'https://...' })}

        {renderInput('isbn13', 'ISBN-13 (optional)', isbn13, setIsbn13, { placeholder: 'ISBN-13' })}
        {renderInput('isbn', 'ISBN-10 (optional)', isbn, setIsbn, { placeholder: 'ISBN-10' })}
        {renderInput('publishedDate', 'Published Date (optional)', publishedDate, setPublishedDate, { placeholder: 'YYYY or YYYY-MM-DD' })}
        {renderInput('publisher', 'Publisher (optional)', publisher, setPublisher, { placeholder: 'Publisher' })}
        {renderInput('categories', 'Categories (comma separated) (optional)', categories, setCategories, { placeholder: 'Fiction, Mystery' })}
        {renderInput('language', 'Language (optional)', language, setLanguage, { placeholder: 'en' })}
        {renderInput('description', 'Description (optional)', description, setDescription, { placeholder: 'Book description', multiline: true })}

  <View style={[styles.actionsRow, { marginBottom: 24 }]}>
          {onCancel && (
            <TouchableOpacity style={[styles.cancelButton]} onPress={onCancel} activeOpacity={0.8}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={[styles.submitText]}>{submitLabel}</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderRadius: 12, padding: 12, borderWidth: 1, fontSize: 15 },
  preview: { width: 120, height: 180, borderRadius: 12, alignSelf: 'center', marginBottom: 12 },
  scanButton: { padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1 },
  scanButtonText: { fontSize: 15, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  cancelButton: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '700' },
  submitButton: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
