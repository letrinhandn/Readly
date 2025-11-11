import React, { useState } from 'react';
import { Platform } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView } from 'react-native';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useReading } from '@/contexts/reading-context';

export default function AddBookScreen() {
  const { addBook } = useReading();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');

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

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    router.back();
  };

  const isValid = title.trim() && author.trim() && totalPages.trim() && parseInt(totalPages, 10) > 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Add Book' }} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Book Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter book title"
              placeholderTextColor={Colors.light.textTertiary}
              autoFocus
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Author</Text>
            <TextInput
              style={styles.input}
              value={author}
              onChangeText={setAuthor}
              placeholder="Enter author name"
              placeholderTextColor={Colors.light.textTertiary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Total Pages</Text>
            <TextInput
              style={styles.input}
              value={totalPages}
              onChangeText={setTotalPages}
              placeholder="Enter total pages"
              placeholderTextColor={Colors.light.textTertiary}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.addButton, !isValid && styles.addButtonDisabled]}
            onPress={handleAddBook}
            disabled={!isValid}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>Add Book</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.surface,
    letterSpacing: -0.2,
  },
});
