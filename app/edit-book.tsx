
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useReading } from '@/contexts/reading-context';
import { useTheme } from '@/contexts/theme-context';
import BookForm from '@/components/BookForm';

export default function EditBookScreen() {
	const params = useLocalSearchParams() as { id?: string; scanned?: string };
	const id = params.id;
	const scanned = params.scanned;
	const { books, updateBook } = useReading();
	const { colors } = useTheme();

	const book = books.find(b => b.id === id);

	useEffect(() => {
	}, [scanned]);

	if (!book) {
		return (
			<View style={[styles.container, { backgroundColor: colors.background }]}> 
				<Stack.Screen options={{ title: 'Edit Book', headerShown: true }} />
			</View>
		);
	}

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}> 
			<Stack.Screen options={{ title: 'Edit Book', headerShown: true }} />
			<View style={{ padding: 20, flex: 1 }}>
				<BookForm
					initialValues={{
						title: book.title,
						author: book.author,
						totalPages: book.totalPages ? String(book.totalPages) : '',
						coverUrl: scanned ? decodeURIComponent(scanned) : book.coverUrl,
						thumbnail: scanned ? decodeURIComponent(scanned) : book.thumbnail,
						description: book.description,
					}}
					onSubmit={(vals) => {
						updateBook(book.id, {
							title: vals.title,
							author: vals.author,
							totalPages: vals.totalPages ? parseInt(vals.totalPages, 10) : book.totalPages,
							coverUrl: vals.coverUrl || undefined,
							thumbnail: vals.thumbnail || undefined,
							description: vals.description || undefined,
						});
						router.back();
					}}
					onCancel={() => router.back()}
					submitLabel="Save"
					showScanButton
					onScan={() => {
						const returnTo = '/edit-book';
						router.push(`/scan-book?returnTo=${encodeURIComponent(returnTo)}&id=${encodeURIComponent(book.id)}`);
					}}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
});
