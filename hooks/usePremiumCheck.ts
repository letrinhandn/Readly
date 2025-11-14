import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { usePremium } from '@/contexts/revenuecat-context';

export function usePremiumRequired() {
  const router = useRouter();
  const { isPremium, isLoading } = usePremium();

  useEffect(() => {
    if (!isLoading && !isPremium) {
      Alert.alert(
        'Premium Required',
        'This feature is only available for Premium members. Would you like to upgrade?',
        [
          {
            text: 'Upgrade',
            onPress: () => router.push('/paywall'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [isPremium, isLoading, router]);

  return { isPremium, isLoading };
}

export function usePremiumFeature(featureName: string) {
  const { isPremium, isLoading } = usePremium();
  const router = useRouter();

  const requirePremium = (callback: () => void) => {
    if (isPremium) {
      callback();
    } else {
      Alert.alert(
        'Premium Required',
        `${featureName} is only available for Premium members. Upgrade now to unlock this feature!`,
        [
          {
            text: 'Upgrade',
            onPress: () => router.push('/paywall'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  return {
    isPremium,
    isLoading,
    requirePremium,
  };
}
