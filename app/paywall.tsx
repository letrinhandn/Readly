import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Crown, 
  Check, 
  X, 
  Sparkles,
  BookOpen,
  TrendingUp,
  Share2,
  Palette
} from 'lucide-react-native';
import { useRevenueCat } from '@/contexts/revenuecat-context';
import { useTheme } from '@/contexts/theme-context';

const PAYWALL_ID = 'default_paywall_id';

export default function PaywallScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    offerings,
    isLoading,
    purchaseProduct,
    restorePurchases,
    getMonthlyPackage,
    getYearlyPackage,
  } = useRevenueCat();

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const monthlyPackage = getMonthlyPackage();
  const yearlyPackage = getYearlyPackage();

  const handlePurchase = async (productId: string) => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Subscriptions are not available on web');
      return;
    }

    try {
      setIsPurchasing(true);
      await purchaseProduct(productId);
      Alert.alert(
        'Success!',
        'You are now a Premium member!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Error', 'Failed to complete purchase. Please try again.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Restore is not available on web');
      return;
    }

    try {
      setIsPurchasing(true);
      const info = await restorePurchases();
      
      if (info.entitlements.active['Readly Premium']) {
        Alert.alert('Success', 'Your subscription has been restored!');
        router.back();
      } else {
        Alert.alert('No Purchase Found', 'No active subscription found to restore.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading offers...
        </Text>
      </View>
    );
  }

  const features = [
    { icon: Palette, title: '10 Premium Share Themes', description: 'Exclusive designs for your reading cards' },
    { icon: BookOpen, title: 'Unlimited Books', description: 'Track as many books as you want' },
    { icon: TrendingUp, title: 'Advanced Analytics', description: 'Deep insights into your reading habits' },
    { icon: Share2, title: 'Priority Support', description: 'Get help when you need it' },
  ];

  const monthlyPrice = monthlyPackage?.product.priceString || '$4.99';
  const yearlyPrice = yearlyPackage?.product.priceString || '$39.99';
  const yearlyMonthlyPrice = yearlyPackage 
    ? `$${(parseFloat(yearlyPackage.product.price.toString()) / 12).toFixed(2)}`
    : '$3.33';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Upgrade to Premium',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          presentation: 'modal',
        }} 
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#FF6B6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Crown size={64} color="#FFF" strokeWidth={2} />
          <Text style={styles.headerTitle}>Readly Premium</Text>
          <Text style={styles.headerSubtitle}>
            Unlock the full reading experience
          </Text>
        </LinearGradient>

        <View style={[styles.featuresContainer, { backgroundColor: colors.surface }]}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}15` }]}>
                <feature.icon size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.plansContainer}>
          <TouchableOpacity
            style={[
              styles.planCard,
              { 
                backgroundColor: colors.surface,
                borderColor: selectedPlan === 'yearly' ? colors.primary : colors.border,
              },
              selectedPlan === 'yearly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.7}
          >
            <View style={styles.planBadgeContainer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bestValueBadge}
              >
                <Sparkles size={14} color="#FFF" strokeWidth={2} />
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.planHeader}>
              <Text style={[styles.planName, { color: colors.text }]}>Yearly</Text>
              <View style={styles.priceContainer}>
                <Text style={[styles.planPrice, { color: colors.text }]}>{yearlyPrice}</Text>
                <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>/year</Text>
              </View>
              <Text style={[styles.planMonthly, { color: colors.textSecondary }]}>
                Only {yearlyMonthlyPrice}/month
              </Text>
            </View>

            {selectedPlan === 'yearly' && (
              <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                <Check size={16} color="#FFF" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              { 
                backgroundColor: colors.surface,
                borderColor: selectedPlan === 'monthly' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.7}
          >
            <View style={styles.planHeader}>
              <Text style={[styles.planName, { color: colors.text }]}>Monthly</Text>
              <View style={styles.priceContainer}>
                <Text style={[styles.planPrice, { color: colors.text }]}>{monthlyPrice}</Text>
                <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>/month</Text>
              </View>
              <Text style={[styles.planMonthly, { color: colors.textSecondary }]}>
                Billed monthly
              </Text>
            </View>

            {selectedPlan === 'monthly' && (
              <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                <Check size={16} color="#FFF" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.subscribeButton,
            { backgroundColor: colors.primary },
            isPurchasing && styles.subscribeButtonDisabled,
          ]}
          onPress={() => handlePurchase(selectedPlan)}
          disabled={isPurchasing}
          activeOpacity={0.8}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.subscribeButtonText}>
                Start {selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} Plan
              </Text>
              <Sparkles size={20} color="#FFF" strokeWidth={2} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isPurchasing}
        >
          <Text style={[styles.restoreButtonText, { color: colors.textSecondary }]}>
            Restore Purchases
          </Text>
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: colors.textTertiary }]}>
          Cancel anytime. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
        </Text>
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerGradient: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  featuresContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  plansContainer: {
    marginTop: 32,
    marginHorizontal: 20,
    gap: 16,
  },
  planCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    position: 'relative',
  },
  planCardSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  planBadgeContainer: {
    position: 'absolute',
    top: -12,
    right: 20,
  },
  bestValueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bestValueText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  planHeader: {
    gap: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '900',
  },
  planPeriod: {
    fontSize: 16,
    fontWeight: '600',
  },
  planMonthly: {
    fontSize: 14,
  },
  checkmark: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeButton: {
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  restoreButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  disclaimer: {
    marginTop: 24,
    marginHorizontal: 20,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
