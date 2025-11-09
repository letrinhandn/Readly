import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Modal, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Play, Pause, Check, Share2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useReading } from '@/contexts/reading-context';
import ShareDailyCard from '@/components/ShareDailyCard';

export default function FocusSessionScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { books, stats, startReadingSession, endReadingSession } = useReading();
  const insets = useSafeAreaInsets();

  const book = books.find(b => b.id === bookId);
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [pagesRead, setPagesRead] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [showShareModal, setShowShareModal] = useState(false);
  const [completedSession, setCompletedSession] = useState<{
    duration: number;
    pagesRead: number;
    date: string;
  } | null>(null);
  const shareCardRef = React.useRef<View>(null);

  useEffect(() => {
    if (!book) {
      router.back();
    }
  }, [book]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isRunning, pulseAnim]);

  const handleStart = useCallback(() => {
    if (!book) return;
    const newSessionId = startReadingSession(book.id);
    setSessionId(newSessionId);
    setIsRunning(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [book, startReadingSession]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleResume = useCallback(() => {
    setIsRunning(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleComplete = useCallback(() => {
    if (sessionId) {
      const duration = Math.floor(seconds / 60);
      endReadingSession(sessionId, pagesRead);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setCompletedSession({
        duration,
        pagesRead,
        date: new Date().toISOString(),
      });
      setShowShareModal(true);
    }
  }, [sessionId, pagesRead, seconds, endReadingSession]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        a.download = `readly-session-${new Date().getTime()}.png`;
        a.click();
        setShowShareModal(false);
        router.back();
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert('Sharing not available', 'Unable to share on this device');
        }
        setShowShareModal(false);
        router.back();
      }

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share card');
    }
  };

  const handleSkipShare = () => {
    setShowShareModal(false);
    router.back();
  };

  if (!book) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <X size={28} color={Colors.light.surface} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.bookAuthor}>{book.author}</Text>
        </View>

        <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          {isRunning && <Text style={styles.timerLabel}>Reading...</Text>}
          {!isRunning && sessionId && <Text style={styles.timerLabel}>Paused</Text>}
          {!sessionId && <Text style={styles.timerLabel}>Ready to start</Text>}
        </Animated.View>

        {sessionId && (
          <View style={styles.pagesControl}>
            <Text style={styles.pagesLabel}>Pages read this session</Text>
            <View style={styles.pagesButtons}>
              <TouchableOpacity
                style={styles.pageButton}
                onPress={() => {
                  if (pagesRead > 0) setPagesRead(p => p - 1);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.pageButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.pagesValue}>{pagesRead}</Text>
              <TouchableOpacity
                style={styles.pageButton}
                onPress={() => {
                  setPagesRead(p => p + 1);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.pageButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.controls}>
          {!sessionId && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStart}
              activeOpacity={0.7}
            >
              <Play size={28} color={Colors.light.surface} strokeWidth={2} />
              <Text style={styles.primaryButtonText}>Start Reading</Text>
            </TouchableOpacity>
          )}

          {sessionId && !isRunning && (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleResume}
                activeOpacity={0.7}
              >
                <Play size={28} color={Colors.light.surface} strokeWidth={2} />
                <Text style={styles.primaryButtonText}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleComplete}
                activeOpacity={0.7}
              >
                <Check size={24} color={Colors.light.success} strokeWidth={2.5} />
                <Text style={styles.completeButtonText}>Complete Session</Text>
              </TouchableOpacity>
            </>
          )}

          {sessionId && isRunning && (
            <TouchableOpacity
              style={[styles.primaryButton, styles.pauseButton]}
              onPress={handlePause}
              activeOpacity={0.7}
            >
              <Pause size={28} color={Colors.light.surface} strokeWidth={2} />
              <Text style={styles.primaryButtonText}>Pause</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
        visible={showShareModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipShare}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Great Session! 🎉</Text>
            <Text style={styles.modalSubtitle}>
              Share your reading progress with friends
            </Text>

            <View style={styles.shareCardContainer}>
              {book && completedSession && (
                <ShareDailyCard
                  ref={shareCardRef}
                  book={book}
                  session={completedSession}
                  streak={stats.currentStreak}
                />
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Share2 size={20} color={Colors.light.surface} strokeWidth={2} />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkipShare}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
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
    backgroundColor: Colors.light.primary,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookInfo: {
    alignItems: 'center',
    maxWidth: 300,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.surface,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  bookAuthor: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  timerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '800' as const,
    color: Colors.light.surface,
    letterSpacing: -2,
  },
  timerLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    fontWeight: '600' as const,
  },
  pagesControl: {
    alignItems: 'center',
    gap: 16,
  },
  pagesLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600' as const,
  },
  pagesButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  pageButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonText: {
    fontSize: 32,
    fontWeight: '600' as const,
    color: Colors.light.surface,
  },
  pagesValue: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: Colors.light.surface,
    minWidth: 80,
    textAlign: 'center',
  },
  controls: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  pauseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.primary,
    letterSpacing: -0.3,
  },
  completeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.surface,
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.light.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500' as const,
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
    backgroundColor: Colors.light.primary,
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
    color: Colors.light.surface,
    letterSpacing: -0.2,
  },
  skipButton: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.textSecondary,
    letterSpacing: -0.2,
  },
});
