import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useRevenueCat } from '@/contexts/revenuecat-context';
import { useUser } from '@/contexts/user-context';
import supabase from '@/lib/supabase';

export function useSyncPremiumWithBackend() {
  const { customerInfo } = useRevenueCat();
  const { profile } = useUser();

  useEffect(() => {
    const syncPremiumStatus = async () => {
      if (Platform.OS === 'web' || !profile || !customerInfo) return;

      try {
        const isPremium = !!customerInfo.entitlements.active['Readly Premium'];
        const expirationDate = customerInfo.entitlements.active['Readly Premium']?.expirationDate;

        console.log('Syncing premium status to backend:', isPremium);

        const { error } = await supabase
          .from('user_profiles')
          .update({
            is_premium: isPremium,
            premium_expires_at: expirationDate || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (error) {
          console.error('Failed to sync premium status:', error);
        } else {
          console.log('Premium status synced successfully');
        }
      } catch (err) {
        console.error('Error syncing premium status:', err);
      }
    };

    syncPremiumStatus();
  }, [customerInfo, profile]);
}

export default useSyncPremiumWithBackend;
