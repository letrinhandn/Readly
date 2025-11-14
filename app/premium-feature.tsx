import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Lock, Sparkles, ArrowRight } from 'lucide-react-native';
import { usePremium } from '@/contexts/revenuecat-context';
import { useTheme } from '@/contexts/theme-context';

export default function PremiumFeatureScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isPremium, isLoading } = usePremium();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!isPremium) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Premium Feature',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
          }}
        />

        <View style={styles.content}>
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF6B6B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lockIconContainer}
          >
            <Lock size={64} color="#FFF" strokeWidth={2} />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text }]}>
            Premium Feature
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            This feature is only available for Premium members. Upgrade now to unlock all premium features!
          </Text>

          <View style={[styles.benefitsContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.benefitsTitle, { color: colors.text }]}>
              Premium Benefits:
            </Text>
            
            <View style={styles.benefit}>
              <Crown size={20} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                10 Premium Share Themes
              </Text>
            </View>

            <View style={styles.benefit}>
              <Sparkles size={20} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Advanced Analytics
              </Text>
            </View>

            <View style={styles.benefit}>
              <Sparkles size={20} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Unlimited Books
              </Text>
            </View>

            <View style={styles.benefit}>
              <Sparkles size={20} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Priority Support
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            <ArrowRight size={20} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Premium Feature',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView contentContainerStyle={styles.premiumContent}>
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#FF6B6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumHeader}
        >
          <Crown size={48} color="#FFF" strokeWidth={2} />
          <Text style={styles.premiumTitle}>Premium Feature Unlocked!</Text>
        </LinearGradient>

        <View style={[styles.premiumCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.premiumCardTitle, { color: colors.text }]}>
            Welcome, Premium Member!
          </Text>
          <Text style={[styles.premiumCardDescription, { color: colors.textSecondary }]}>
            You now have access to all premium features. Enjoy your enhanced reading experience!
          </Text>
        </View>

        <View style={styles.featuresList}>
          <Text style={[styles.featuresListTitle, { color: colors.text }]}>
            Your Premium Benefits:
          </Text>

          <View style={[styles.featureCard, { backgroundColor: colors.surface }]}>
            <Sparkles size={24} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.featureCardText, { color: colors.text }]}>
              10 Premium Share Themes
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.surface }]}>
            <Sparkles size={24} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.featureCardText, { color: colors.text }]}>
              Advanced Analytics
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.surface }]}>
            <Sparkles size={24} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.featureCardText, { color: colors.text }]}>
              Unlimited Books
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.surface }]}>
            <Sparkles size={24} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.featureCardText, { color: colors.text }]}>
              Priority Support
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  benefitsContainer: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    gap: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '500',
  },
  upgradeButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  premiumContent: {
    padding: 24,
    gap: 24,
  },
  premiumHeader: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  premiumCard: {
    padding: 24,
    borderRadius: 16,
    gap: 12,
  },
  premiumCardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  premiumCardDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  featuresList: {
    gap: 16,
  },
  featuresListTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 12,
  },
  featureCardText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
