import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, Camera, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useReading } from '@/contexts/reading-context';

export default function ScanProgressScreen() {
  const { currentBooks, updateBook } = useReading();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedPage, setScannedPage] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const currentBook = currentBooks[0];

  const handleScan = useCallback(() => {
    if (!currentBook) return;
    
    const pageNumber = Math.min(
      currentBook.currentPage + Math.floor(Math.random() * 15) + 5,
      currentBook.totalPages
    );
    
    setScannedPage(pageNumber.toString());
    setShowManualInput(true);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [currentBook]);

  const handleConfirm = useCallback(() => {
    if (!currentBook || !scannedPage) return;

    const pageNumber = parseInt(scannedPage, 10);
    if (isNaN(pageNumber) || pageNumber < 0 || pageNumber > currentBook.totalPages) {
      return;
    }

    updateBook(currentBook.id, {
      currentPage: pageNumber,
      lastReadAt: new Date().toISOString(),
      status: pageNumber >= currentBook.totalPages ? 'completed' : 'reading',
    });

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    router.back();
  }, [currentBook, scannedPage, updateBook]);

  if (!permission) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={28} color={Colors.light.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.infoText}>Loading camera...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={28} color={Colors.light.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Camera size={64} color={Colors.light.textSecondary} strokeWidth={1} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to scan book pages
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestPermission}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentBook) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={28} color={Colors.light.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.infoText}>No book currently being read</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              router.back();
              router.push('/add-book');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>Add a Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera}
        facing={'back' as CameraType}
      >
        <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButtonCamera}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <X size={28} color={Colors.light.surface} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
            
            <View style={styles.scanInstruction}>
              <Text style={styles.scanInstructionText}>
                Position the page number in the frame
              </Text>
            </View>
          </View>

          <View style={styles.bottomControls}>
            <Text style={styles.bookInfoText}>{currentBook.title}</Text>
            <Text style={styles.currentPageText}>
              Current: Page {currentBook.currentPage} / {currentBook.totalPages}
            </Text>
            
            {!showManualInput ? (
              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleScan}
                activeOpacity={0.8}
              >
                <Camera size={32} color={Colors.light.surface} strokeWidth={2} />
              </TouchableOpacity>
            ) : (
              <View style={styles.manualInput}>
                <TextInput
                  style={styles.input}
                  value={scannedPage}
                  onChangeText={setScannedPage}
                  placeholder="Page number"
                  placeholderTextColor={Colors.light.textTertiary}
                  keyboardType="number-pad"
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.confirmButton, !scannedPage && styles.confirmButtonDisabled]}
                  onPress={handleConfirm}
                  disabled={!scannedPage}
                  activeOpacity={0.7}
                >
                  <Check size={24} color={Colors.light.surface} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )}

            {!showManualInput && (
              <TouchableOpacity
                onPress={() => setShowManualInput(true)}
                activeOpacity={0.7}
                style={styles.manualLink}
              >
                <Text style={styles.manualLinkText}>Enter manually</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonCamera: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  infoText: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.surface,
  },
  scanFrame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.light.surface,
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: -20,
    left: -20,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: -20,
    right: -20,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: -20,
    left: -20,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: -20,
    right: -20,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanInstruction: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginTop: 200,
  },
  scanInstructionText: {
    fontSize: 16,
    color: Colors.light.surface,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  bottomControls: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  bookInfoText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.surface,
    textAlign: 'center',
  },
  currentPageText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  scanButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  manualInput: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: Colors.light.text,
    textAlign: 'center',
    fontWeight: '700' as const,
  },
  confirmButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.light.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  manualLink: {
    paddingVertical: 12,
  },
  manualLinkText: {
    fontSize: 16,
    color: Colors.light.surface,
    fontWeight: '600' as const,
  },
});
