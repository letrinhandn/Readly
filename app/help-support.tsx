import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronLeft, Mail, MessageCircle, BookOpen, FileText, Shield, Star, ExternalLink, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/theme-context';

const SUPPORT_EMAIL = 'readly.app@outlook.com';
const APP_VERSION = '1.0.0';

export default function HelpSupportScreen() {
  const { colors } = useTheme();

  const handleEmailSupport = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const subject = encodeURIComponent('Readly App - Support Request');
    const body = encodeURIComponent(`\n\n\n---\nApp Version: ${APP_VERSION}\nPlatform: ${Platform.OS}\n`);
    const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert('Email Not Available', `Please send your message to: ${SUPPORT_EMAIL}`);
      }
    } catch (error) {
      console.error('Error opening email:', error);
      Alert.alert('Error', `Unable to open email. Please contact us at: ${SUPPORT_EMAIL}`);
    }
  };

  const handleFAQItem = (question: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('FAQ', question);
  };

  const faqItems = [
    {
      question: 'How do I add a book?',
      answer: 'Tap the + button on the Library tab or use the scan feature to add books quickly.',
      icon: BookOpen,
      color: colors.primary,
    },
    {
      question: 'How does reading tracking work?',
      answer: 'Start a focus session from any book and track your reading time automatically.',
      icon: MessageCircle,
      color: colors.accent,
    },
    {
      question: 'Can I sync my data?',
      answer: 'Yes! Your reading data syncs automatically when you sign in with your account.',
      icon: FileText,
      color: colors.success,
    },
    {
      question: 'Is my data private?',
      answer: 'Absolutely. We take your privacy seriously and never share your personal reading data.',
      icon: Shield,
      color: colors.warning,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.text, fontWeight: '700' as const, fontSize: 17 },
          headerTitle: 'Help & Support',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                router.back();
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={styles.backButton}
            >
              <ChevronLeft size={28} color={colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primary + '15' }]}>
            <MessageCircle size={32} color={colors.primary} strokeWidth={2.5} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>We’re Here to Help</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Get support, find answers to common questions, or share your feedback with us.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>

          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: colors.surface }]}
            onPress={handleEmailSupport}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIcon, { backgroundColor: colors.primary + '15' }]}>
              <Mail size={24} color={colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.contactText}>
              <Text style={[styles.contactTitle, { color: colors.text }]}>Email Support</Text>
              <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
                {SUPPORT_EMAIL}
              </Text>
            </View>
            <Send size={20} color={colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>

          <View style={[styles.infoCard, { backgroundColor: colors.accent + '10' }]}>
            <Text style={[styles.infoText, { color: colors.accent }]}>
              💬 We typically respond within 24-48 hours on business days.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>

          {faqItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.faqCard, { backgroundColor: colors.surface }]}
              onPress={() => handleFAQItem(item.answer)}
              activeOpacity={0.7}
            >
              <View style={[styles.faqIcon, { backgroundColor: item.color + '15' }]}>
                <item.icon size={22} color={item.color} strokeWidth={2.5} />
              </View>
              <View style={styles.faqText}>
                <Text style={[styles.faqQuestion, { color: colors.text }]}>
                  {item.question}
                </Text>
              </View>
              <ExternalLink size={18} color={colors.textTertiary} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About Readly</Text>

          <View style={[styles.aboutCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
              Readly is your personal reading companion, designed to help you build better reading habits and track your literary journey.
            </Text>
            <View style={styles.versionContainer}>
              <Text style={[styles.versionLabel, { color: colors.textTertiary }]}>Version</Text>
              <Text style={[styles.versionValue, { color: colors.text }]}>{APP_VERSION}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.rateCard, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              Alert.alert('Rate Us', 'Thank you for your support! Rating feature coming soon.');
            }}
            activeOpacity={0.8}
          >
            <Star size={24} color={colors.surface} strokeWidth={2.5} fill={colors.surface} />
            <Text style={[styles.rateText, { color: colors.surface }]}>Rate Readly</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.footerCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Made with ❤️ for book lovers everywhere
          </Text>
          <Text style={[styles.footerCopyright, { color: colors.textTertiary }]}>
            © 2024 Readly. All rights reserved.
          </Text>
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginLeft: 12,
  },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    gap: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  contactSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  faqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  faqIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqText: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  aboutCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutText: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22,
    marginBottom: 16,
  },
  versionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  versionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  versionValue: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  rateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 18,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  rateText: {
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  footerCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 6,
    textAlign: 'center',
  },
  footerCopyright: {
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
});
