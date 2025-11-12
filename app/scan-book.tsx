import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Camera as CameraIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '@/contexts/theme-context';
import { uploadImage, STORAGE_BUCKETS } from '@/lib/storage';

export default function ScanBookScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams() as { returnTo?: string; id?: string };
  const returnToRaw = params.returnTo;
  const returnId = params.id;
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setScannedImage(localUri);
        
        setUploading(true);
        try {
          const uploadResult = await uploadImage(
            localUri,
            STORAGE_BUCKETS.BOOK_COVERS,
            'covers'
          );
          
          if (returnToRaw) {
            const returnTo = returnToRaw.startsWith('/') ? returnToRaw : `/${returnToRaw}`;
            router.replace({ pathname: returnTo as any, params: { id: returnId || '', scanned: uploadResult.url } });
            return;
          }
          
          Alert.alert('Success', 'Book cover uploaded successfully!', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        } catch (error: any) {
          console.error('Upload error:', error);
          Alert.alert('Upload Failed', error.message || 'Failed to upload image. Using local copy.');
          if (returnToRaw) {
            const returnTo = returnToRaw.startsWith('/') ? returnToRaw : `/${returnToRaw}`;
            router.replace({ pathname: returnTo as any, params: { id: returnId || '', scanned: localUri } });
          }
        } finally {
          setUploading(false);
        }
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePicture = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setScannedImage(localUri);
        
        setUploading(true);
        try {
          const uploadResult = await uploadImage(
            localUri,
            STORAGE_BUCKETS.BOOK_COVERS,
            'covers'
          );
          
          if (returnToRaw) {
            const returnTo = returnToRaw.startsWith('/') ? returnToRaw : `/${returnToRaw}`;
            router.replace({ pathname: returnTo as any, params: { id: returnId || '', scanned: uploadResult.url } });
            return;
          }
          
          Alert.alert('Success', 'Book cover uploaded successfully!', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        } catch (error: any) {
          console.error('Upload error:', error);
          Alert.alert('Upload Failed', error.message || 'Failed to upload image. Using local copy.');
          if (returnToRaw) {
            const returnTo = returnToRaw.startsWith('/') ? returnToRaw : `/${returnToRaw}`;
            router.replace({ pathname: returnTo as any, params: { id: returnId || '', scanned: localUri } });
          }
        } finally {
          setUploading(false);
        }
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  if (!permission) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Add Book Cover</Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={24} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={styles.permissionContainer}>
          <CameraIcon size={64} color={colors.textTertiary} strokeWidth={1} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera Permission Required</Text>
          <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}> 
            We need camera access to add book covers
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
            activeOpacity={0.7}
          >
            <Text style={[styles.permissionButtonText, { color: colors.surface }]}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Book Cover</Text>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <X size={24} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {scannedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: scannedImage }} style={styles.previewImage} />
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <View style={[styles.scanFrame, { borderColor: colors.primary }]} />
          <Text style={[styles.instruction, { color: colors.surface }]}>
            Position book cover within the frame
          </Text>
        </View>
      )}

      <View style={styles.controls}>
        {uploading && (
          <View style={[styles.uploadingOverlay, { backgroundColor: colors.overlay }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.uploadingText, { color: colors.surface }]}>Uploading image...</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surface }]}
          onPress={pickImage}
          activeOpacity={0.7}
          disabled={uploading}
        >
          <Text style={[styles.controlButtonText, { color: colors.text }]}>Choose from Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, { backgroundColor: colors.primary }]}
          onPress={takePicture}
          activeOpacity={0.8}
          disabled={uploading}
        >
          <CameraIcon size={32} color={colors.surface} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  cameraContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 280,
    height: 380,
    borderWidth: 3,
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  instruction: {
    position: 'absolute',
    bottom: 40,
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  previewImage: {
    width: 280,
    height: 380,
    borderRadius: 20,
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  controlButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    zIndex: 10,
  },
  uploadingText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
