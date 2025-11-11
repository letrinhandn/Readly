import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Modal, Alert, TextInput, ScrollView, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Play, Pause, Check, Share2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useReading } from '@/contexts/reading-context';
import ShareDailyCard from '@/components/ShareDailyCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const verticalScale = SCREEN_HEIGHT / 667;

export default function FocusSessionScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { books, stats, startReadingSession, endReadingSession } = useReading();
  const insets = useSafeAreaInsets();

  const book = books.find(b => b.id === bookId);
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [pagesRead, setPagesRead] = useState(0);
  const [pagesInput, setPagesInput] = useState('');
  const [lastPageInput, setLastPageInput] = useState('');
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [countdownMode, setCountdownMode] = useState(false);
  const [countdownDuration, setCountdownDuration] = useState<number>(25);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [inputHours, setInputHours] = useState('0');
  const [inputMinutes, setInputMinutes] = useState('25');
  const [pulseAnim] = useState(new Animated.Value(1));
  const [showShareModal, setShowShareModal] = useState(false);
  const [completedSession, setCompletedSession] = useState<{
    duration: number;
    pagesRead: number;
    date: string;
    reflection?: string;
  } | null>(null);
  const shareCardRef = React.useRef<View>(null);

  useEffect(() => {
    if (!book) {
      router.back();
    }
  }, [book]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      if (countdownMode) {
        interval = setInterval(() => {
          setRemainingSeconds((r) => {
            if (r === null) return 0;
            if (r <= 1) {
              setIsRunning(false);
              setShowCompleteForm(true);
              return 0;
            }
            return r - 1;
          });
        }, 1000);
      } else {
        interval = setInterval(() => {
          setSeconds((s) => s + 1);
        }, 1000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, countdownMode]);

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

  useEffect(() => {
    if (!book) return;
    const lpTrim = lastPageInput.trim();
    if (lpTrim !== '') {
      const lp = parseInt(lpTrim, 10);
      if (!isNaN(lp)) {
        const remaining = Math.max(0, book.totalPages - book.currentPage);
        const computed = Math.max(0, Math.min(lp - book.currentPage, remaining));
        setPagesRead(computed);
        return;
      }
    }
    const pTrim = pagesInput.trim();
    const p = parseInt(pTrim || '0', 10);
    setPagesRead(isNaN(p) ? 0 : Math.max(0, p));
  }, [pagesInput, lastPageInput, book]);

  const handleStart = useCallback(() => {
    if (!book) return;
    const newSessionId = startReadingSession(book.id);
    setSessionId(newSessionId);
    setIsRunning(true);
    setPagesInput('');
    setLastPageInput('');
    setPagesRead(0);
    if (countdownMode) {
      setRemainingSeconds(countdownDuration * 60);
    } else {
      setSeconds(0);
    }
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
    if (!sessionId) return;
    // open the complete session form/modal
    setShowCompleteForm(true);
  }, [sessionId]);

  const confirmComplete = useCallback(async () => {
    if (!sessionId) return;
    const duration = Math.floor(seconds / 60);
    // trim reflection to reasonable length (300 words)
    const words = reflectionText.trim().split(/\s+/).filter(Boolean);
    const limited = words.length > 300 ? words.slice(0, 300).join(' ') : reflectionText.trim();
  // persist the session (await to ensure AsyncStorage write completes)
  await endReadingSession(sessionId, Number(pagesRead || 0), limited, book?.id);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setCompletedSession({
      duration,
      pagesRead: Number(pagesRead || 0),
      date: new Date().toISOString(),
      reflection: limited,
    });
    setShowShareModal(true);
    setShowCompleteForm(false);
  }, [sessionId, pagesRead, seconds, reflectionText, endReadingSession]);

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
          <X size={Math.round(28 * scale)} color={Colors.light.surface} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.bookAuthor}>{book.author}</Text>
        </View>

        <View style={styles.modesWrapper}>
          <View style={styles.modeRow}>
            <TouchableOpacity onPress={() => setCountdownMode(false)} style={[styles.modeButton, !countdownMode && styles.modeActive]}>
              <Text style={[styles.modeText, !countdownMode && styles.modeTextActive]}>Count up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCountdownMode(true)} style={[styles.modeButton, countdownMode && styles.modeActive]}>
              <Text style={[styles.modeText, countdownMode && styles.modeTextActive]}>Countdown</Text>
            </TouchableOpacity>
          </View>

          {countdownMode && (
            <View style={styles.presetsRow} pointerEvents="box-none">
              <View style={styles.timeInputsRow}>
                <View style={styles.timeInputColumn}>
                  <Text style={styles.inputLabel}>Hours</Text>
                  <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    value={inputHours}
                    onChangeText={(t) => {
                      const digits = t.replace(/[^0-9]/g, '');
                      setInputHours(digits);
                    }}
                    placeholder="0"
                    placeholderTextColor={'rgba(255,255,255,0.5)'}
                  />
                </View>

                <View style={styles.timeInputColumn}>
                  <Text style={styles.inputLabel}>Minutes</Text>
                  <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    value={inputMinutes}
                    onChangeText={(t) => {
                      const digits = t.replace(/[^0-9]/g, '');
                      let num = parseInt(digits || '0', 10);
                      if (isNaN(num)) num = 0;
                      if (num > 59) num = 59;
                      setInputMinutes(String(num));
                    }}
                    placeholder="15"
                    placeholderTextColor={'rgba(255,255,255,0.5)'}
                  />
                </View>

                <TouchableOpacity
                  style={styles.setButton}
                  onPress={() => {
                    const h = parseInt(inputHours || '0', 10) || 0;
                    const m = parseInt(inputMinutes || '0', 10) || 0;
                    const total = Math.max(0, h * 60 + m);
                    setCountdownDuration(total);
                    if (!isRunning) setRemainingSeconds(total * 60);
                  }}
                >
                  <Text style={styles.setButtonText}>Set</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.timerText}>{countdownMode ? formatTime(remainingSeconds ?? countdownDuration * 60) : formatTime(seconds)}</Text>
          {isRunning && <Text style={styles.timerLabel}>{countdownMode ? 'Counting down...' : 'Reading...'}</Text>}
          {!isRunning && sessionId && <Text style={styles.timerLabel}>Paused</Text>}
          {!sessionId && <Text style={styles.timerLabel}>Ready to start</Text>}
        </Animated.View>

        

        <View style={styles.controls}>
          {!sessionId && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStart}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Start Reading</Text>
              <Play size={20} color={Colors.light.primary} strokeWidth={2} style={styles.buttonIcon} />
            </TouchableOpacity>
          )}

          {sessionId && !isRunning && (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleResume}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>Resume</Text>
                <Play size={20} color={Colors.light.primary} strokeWidth={2} style={styles.buttonIcon} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleComplete}
                activeOpacity={0.7}
              >
                <Text style={styles.completeButtonText}>Complete Session</Text>
                <Check size={18} color={Colors.light.success} strokeWidth={2.5} style={styles.buttonIcon} />
              </TouchableOpacity>
            </>
          )}

          {sessionId && isRunning && (
            <TouchableOpacity
              style={[styles.primaryButton, styles.pauseButton]}
              onPress={handlePause}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Pause</Text>
              <Pause size={20} color={Colors.light.primary} strokeWidth={2} style={styles.buttonIcon} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

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

      <Modal
        visible={showCompleteForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCompleteForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Session</Text>
            <Text style={styles.modalSubtitle}>Enter pages read or the last page number</Text>

            <View style={{ width: '100%', marginBottom: 12 }}>
              <View style={styles.inputRow}>
                <View style={styles.inputColumn}>
                  <Text style={styles.inputLabel}>Pages</Text>
                  <TextInput
                    style={[styles.pageInput, styles.pageInputLeft]}
                    keyboardType="number-pad"
                    placeholder="e.g. 20"
                    placeholderTextColor={'rgba(0,0,0,0.35)'}
                    value={pagesInput}
                    onChangeText={(t) => { setPagesInput(t); if (t.trim() !== '') setLastPageInput(''); }}
                  />
                </View>

                <Text style={styles.orText}>or</Text>

                <View style={styles.inputColumn}>
                  <Text style={styles.inputLabel}>Last page</Text>
                  <TextInput
                    style={[styles.pageInput, styles.pageInputRight]}
                    keyboardType="number-pad"
                    placeholder="e.g. 123"
                    placeholderTextColor={'rgba(0,0,0,0.35)'}
                    value={lastPageInput}
                    onChangeText={(t) => { setLastPageInput(t); if (t.trim() !== '') setPagesInput(''); }}
                  />
                </View>
              </View>
            </View>

            <Text style={[styles.modalPagesValue, { marginBottom: 12 }]}>{pagesRead}</Text>

            <View style={{ width: '100%', marginBottom: 12 }}>
              <Text style={[styles.inputLabel, { textAlign: 'left', marginBottom: 8 }]}>Reflection (optional)</Text>
              <TextInput
                style={styles.reflectionInput}
                multiline
                placeholder="Write a short reflection (optional, under 300 words)"
                placeholderTextColor={'rgba(0,0,0,0.25)'}
                value={reflectionText}
                onChangeText={(t) => {
                  const words = t.trim().split(/\s+/).filter(Boolean);
                  if (words.length > 300) {
                    setReflectionText(words.slice(0, 300).join(' '));
                  } else {
                    setReflectionText(t);
                  }
                }}
              />
              <Text style={styles.wordCountText}>{reflectionText.trim().split(/\s+/).filter(Boolean).length} / 300 words</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity style={[styles.skipButton, { flex: 1 }]} onPress={() => setShowCompleteForm(false)}>
                <Text style={styles.skipButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.shareButton, { flex: 1 }]} onPress={confirmComplete}>
                <Text style={styles.shareButtonText}>Confirm</Text>
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
    paddingHorizontal: Math.max(16, 20 * scale),
    paddingTop: Math.max(12, 16 * verticalScale),
  },
  closeButton: {
    width: Math.max(40, 44 * scale),
    height: Math.max(40, 44 * scale),
    borderRadius: Math.max(20, 22 * scale),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Math.max(20, 32 * scale),
    paddingTop: Math.max(20, 40 * verticalScale),
    paddingBottom: Math.max(40, 60 * verticalScale),
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: SCREEN_HEIGHT * 0.75,
  },
  bookInfo: {
    alignItems: 'center',
    maxWidth: 300,
    marginTop: Math.min(-10, -30 * verticalScale),
  },
  bookTitle: {
    fontSize: Math.min(24, Math.max(20, 24 * scale)),
    fontWeight: '700' as const,
    color: Colors.light.surface,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  bookAuthor: {
    fontSize: Math.min(16, Math.max(14, 16 * scale)),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    gap: Math.max(8, 12 * scale),
    marginVertical: Math.max(8, 12 * verticalScale),
  },
  modeButton: {
    paddingVertical: Math.max(6, 8 * scale),
    paddingHorizontal: Math.max(10, 14 * scale),
    borderRadius: Math.max(8, 12 * scale),
    backgroundColor: 'rgba(255,255,255,0.06)',
    minWidth: Math.max(100, 120 * scale),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeActive: {
    backgroundColor: Colors.light.surface,
  },
  modeText: {
    color: Colors.light.textSecondary,
    fontWeight: '600' as const,
  },
  modeTextActive: {
    color: Colors.light.primary,
  },
  presetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  presetActive: {
    backgroundColor: Colors.light.surface,
  },
  presetText: {
    color: Colors.light.surface,
    fontWeight: '600' as const,
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeInputColumn: {
    alignItems: 'center',
  },
  timeInput: {
    width: Math.max(56, 64 * scale),
    height: Math.max(36, 40 * scale),
    borderRadius: Math.max(8, 10 * scale),
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: Colors.light.surface,
    textAlign: 'center',
    fontSize: Math.min(16, Math.max(14, 16 * scale)),
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  setButton: {
    backgroundColor: Colors.light.surface,
    height: Math.max(36, 40 * scale),
    minWidth: Math.max(56, 64 * scale),
    paddingHorizontal: Math.max(10, 12 * scale),
    borderRadius: Math.max(8, 10 * scale),
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Math.max(6, 8 * scale),
    marginTop: Math.max(18, 20 * verticalScale),
  },
  setButtonText: {
    color: Colors.light.primary,
    fontWeight: '700' as const,
    fontSize: Math.min(16, Math.max(14, 16 * scale)),
    lineHeight: Math.max(36, 40 * scale),
    textAlign: 'center',
  },
  modesWrapper: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    marginVertical: Math.max(4, 6 * verticalScale),
    minHeight: Math.max(40, 44 * verticalScale),
    marginTop: Math.min(-25, -50 * verticalScale),
  },
  presetsRow: {
    position: 'absolute',
    top: Math.max(50, 57 * verticalScale),
    alignSelf: 'center',
    flexDirection: 'row',
    gap: Math.max(8, 10 * scale),
    zIndex: 20,
    paddingHorizontal: Math.max(4, 6 * scale),
    paddingVertical: 2,
    borderRadius: Math.max(10, 14 * scale),
    backgroundColor: 'transparent',
  },
  timerCircle: {
    width: Math.min(240, Math.max(180, 240 * scale)),
    height: Math.min(240, Math.max(180, 240 * scale)),
    borderRadius: Math.min(120, Math.max(90, 120 * scale)),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: Math.max(6, 8 * scale),
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Math.max(15, 30 * verticalScale),
  },
  timerText: {
    fontSize: Math.min(56, Math.max(42, 56 * scale)),
    fontWeight: '800' as const,
    color: Colors.light.surface,
    letterSpacing: -2,
  },
  timerLabel: {
    fontSize: Math.min(16, Math.max(14, 16 * scale)),
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Math.max(6, 8 * scale),
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  pageInput: {
    width: 120,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    color: Colors.light.surface,
    fontSize: 16,
    textAlign: 'center',
  },
  inputColumn: {
    flex: 1,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: Math.min(12, Math.max(10, 12 * scale)),
    color: Colors.light.textSecondary,
    marginBottom: Math.max(4, 6 * scale),
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  orText: {
    color: Colors.light.textSecondary,
    marginHorizontal: 10,
    fontWeight: '600' as const,
  },
  pageInputLeft: {
    width: '100%',
    maxWidth: 140,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    color: Colors.light.text,
    fontSize: 18,
  },
  pageInputRight: {
    width: '100%',
    maxWidth: 140,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    color: Colors.light.text,
    fontSize: 18,
  },
  modalPagesValue: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: Colors.light.text,
    textAlign: 'center',
  },
  reflectionInput: {
    width: '100%',
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
    color: Colors.light.text,
    marginBottom: 6,
  },
  wordCountText: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  pageButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: Math.max(8, 12 * scale),
    marginTop: Math.max(12, 20 * verticalScale),
  },
  primaryButton: {
    backgroundColor: Colors.light.surface,
    borderRadius: Math.max(16, 20 * scale),
    padding: Math.max(16, 20 * scale),
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Math.max(4, 6 * scale),
  },
  pauseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButtonText: {
    fontSize: Math.min(18, Math.max(16, 18 * scale)),
    fontWeight: '700' as const,
    color: Colors.light.primary,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Math.max(16, 20 * scale),
    padding: Math.max(16, 20 * scale),
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Math.max(4, 6 * scale),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  completeButtonText: {
    fontSize: Math.min(16, Math.max(14, 16 * scale)),
    fontWeight: '700' as const,
    color: Colors.light.surface,
    letterSpacing: -0.2,
    textAlign: 'center',
  },

  buttonIcon: {
    marginTop: 8,
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
    borderRadius: Math.max(20, 28 * scale),
    padding: Math.max(20, 28 * scale),
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: Math.min(28, Math.max(24, 28 * scale)),
    fontWeight: '800' as const,
    color: Colors.light.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: Math.min(15, Math.max(13, 15 * scale)),
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Math.max(16, 24 * scale),
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
    borderRadius: Math.max(12, 16 * scale),
    padding: Math.max(14, 18 * scale),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Math.max(8, 10 * scale),
  },
  shareButtonText: {
    fontSize: Math.min(17, Math.max(15, 17 * scale)),
    fontWeight: '700' as const,
    color: Colors.light.surface,
    letterSpacing: -0.2,
  },
  skipButton: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: Math.max(12, 16 * scale),
    padding: Math.max(14, 18 * scale),
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: Math.min(16, Math.max(14, 16 * scale)),
    fontWeight: '700' as const,
    color: Colors.light.textSecondary,
    letterSpacing: -0.2,
  },
});
