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
  Linking,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Crown,
  Settings,
  RefreshCw,
  ExternalLink,
  Calendar,
  CreditCard,
  Info,
} from 'lucide-react-native';
import { useRevenueCat } from '@/contexts/revenuecat-context';
import { useTheme } from '@/contexts/theme-context';

export default function SubscriptionManagementScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    isPremium,
    customerInfo,
    isLoading,
    restorePurchases,
  } = useRevenueCat();

  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Restore is not available on web');
      return;
    }

    try {
      setIsRestoring(true);
      const info = await restorePurchases();
      
      if (info.entitlements.active['Readly Premium']) {
        Alert.alert('Success', 'Your subscription has been restored!');
      } else {
        Alert.alert('No Purchase Found', 'No active subscription found to restore.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const openManageSubscription = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else if (Platform.OS === 'android') {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    } else {
      Alert.alert('Not Available', 'Please manage your subscription in the app store');
    }
  };

  const openCustomerCenter = () => {
    Alert.alert(
      'Customer Center',
      'RevenueCat Customer Center UI is coming soon. For now, you can manage your subscription in the app store.',
      [
        {
          text: 'Manage Subscription',
          onPress: openManageSubscription,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading subscription...
        </Text>
      </View>
    );
  }

  const entitlement = customerInfo?.entitlements.active['Readly Premium'];
  const expirationDate = entitlement?.expirationDate;
  const willRenew = entitlement?.willRenew;
  const productIdentifier = entitlement?.productIdentifier;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Subscription',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isPremium ? (
          <>
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF6B6B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumCard}
            >
              <Crown size={48} color="#FFF" strokeWidth={2} />
              <Text style={styles.premiumTitle}>Premium Member</Text>
              <Text style={styles.premiumSubtitle}>
                Thank you for your support!
              </Text>
            </LinearGradient>

            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <CreditCard size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Plan
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {productIdentifier?.includes('yearly') || productIdentifier?.includes('annual') 
                      ? 'Yearly Premium' 
                      : 'Monthly Premium'}
                  </Text>
                </View>
              </View>

              {expirationDate && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Calendar size={20} color={colors.primary} strokeWidth={2} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      {willRenew ? 'Renews on' : 'Expires on'}
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {new Date(expirationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Info size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Status
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {willRenew ? 'Active (Auto-renewing)' : 'Active (Expiring)'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={openManageSubscription}
              activeOpacity={0.7}
            >
              <Settings size={20} color={colors.text} strokeWidth={2} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                Manage Subscription
              </Text>
              <ExternalLink size={16} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={openCustomerCenter}
              activeOpacity={0.7}
            >
              <Settings size={20} color={colors.text} strokeWidth={2} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                Customer Center
              </Text>
              <ExternalLink size={16} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={[styles.freeCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.freeTitle, { color: colors.text }]}>
                Free Plan
              </Text>
              <Text style={[styles.freeDescription, { color: colors.textSecondary }]}>
                Upgrade to Premium to unlock all features
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/paywall')}
              activeOpacity={0.8}
            >
              <Crown size={20} color="#FFF" strokeWidth={2} />
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.restoreButton, { backgroundColor: colors.surface }]}
          onPress={handleRestore}
          disabled={isRestoring}
          activeOpacity={0.7}
        >
          {isRestoring ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <RefreshCw size={20} color={colors.text} strokeWidth={2} />
          )}
          <Text style={[styles.restoreButtonText, { color: colors.text }]}>
            Restore Purchases
          </Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={[styles.infoSectionTitle, { color: colors.text }]}>
            Need Help?
          </Text>
          <Text style={[styles.infoSectionText, { color: colors.textSecondary }]}>
            If you're having issues with your subscription, please contact support or visit the App Store/Google Play Store to manage your subscription.
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
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  premiumCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
  },
  premiumTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  premiumSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFF',
    opacity: 0.9,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    gap: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  freeCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  freeTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  freeDescription: {
    fontSize: 15,
    textAlign: 'center',
  },
  upgradeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 16,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  restoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 20,
    gap: 12,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoSectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
