import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';

export type SubscriptionStatus = {
  isPremium: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
};

const REVENUECAT_API_KEY = 'test_EBCTTKAYreuszKiTMMyAjaLkcnF';
const ENTITLEMENT_ID = 'Readly Premium';

export const [RevenueCatProvider, useRevenueCat] = createContextHook(() => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializePurchases = async () => {
      try {
        console.log('Initializing RevenueCat...');

        if (Platform.OS === 'web') {
          console.log('RevenueCat not supported on web');
          setIsLoading(false);
          return;
        }

        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        
        await Purchases.configure({
          apiKey: REVENUECAT_API_KEY,
        });

        console.log('RevenueCat configured successfully');
        setIsInitialized(true);

        const info = await Purchases.getCustomerInfo();
        console.log('Customer info loaded:', info);
        setCustomerInfo(info);

        const offers = await Purchases.getOfferings();
        console.log('Offerings loaded:', offers);
        setOfferings(offers);

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing RevenueCat:', error);
        setIsLoading(false);
      }
    };

    initializePurchases();

    if (Platform.OS !== 'web') {
      const customerInfoListener = Purchases.addCustomerInfoUpdateListener((info) => {
        console.log('Customer info updated:', info);
        setCustomerInfo(info);
      });

      return () => {
        customerInfoListener.remove();
      };
    }
  }, []);

  const isPremium = useMemo(() => {
    if (Platform.OS === 'web') return false;
    if (!customerInfo) return false;
    
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    return !!entitlement;
  }, [customerInfo]);

  const purchasePackage = async (pkg: PurchasesPackage) => {
    try {
      if (Platform.OS === 'web') {
        throw new Error('Purchases not supported on web');
      }

      console.log('Purchasing package:', pkg.identifier);
      const { customerInfo: info } = await Purchases.purchasePackage(pkg);
      console.log('Purchase successful:', info);
      setCustomerInfo(info);
      return info;
    } catch (error: any) {
      console.error('Purchase error:', error);
      if (error.userCancelled) {
        console.log('User cancelled purchase');
      }
      throw error;
    }
  };

  const purchaseProduct = async (productId: string) => {
    try {
      if (Platform.OS === 'web') {
        throw new Error('Purchases not supported on web');
      }

      const pkg = getPackageByProductId(productId);
      if (!pkg) {
        throw new Error(`Package not found for product: ${productId}`);
      }

      return await purchasePackage(pkg);
    } catch (error) {
      console.error('Purchase product error:', error);
      throw error;
    }
  };

  const restorePurchases = async () => {
    try {
      if (Platform.OS === 'web') {
        throw new Error('Restore not supported on web');
      }

      console.log('Restoring purchases...');
      const info = await Purchases.restorePurchases();
      console.log('Purchases restored:', info);
      setCustomerInfo(info);
      return info;
    } catch (error) {
      console.error('Restore error:', error);
      throw error;
    }
  };

  const getPackageByProductId = (productId: string): PurchasesPackage | null => {
    if (!offerings || !offerings.current) return null;

    const allPackages = [
      ...(offerings.current.availablePackages || []),
      offerings.current.monthly,
      offerings.current.annual,
    ].filter(Boolean) as PurchasesPackage[];

    return allPackages.find(pkg => 
      pkg.product.identifier === productId || 
      pkg.identifier === productId
    ) || null;
  };

  const getMonthlyPackage = (): PurchasesPackage | null => {
    if (!offerings || !offerings.current) return null;
    return offerings.current.monthly || getPackageByProductId('monthly');
  };

  const getYearlyPackage = (): PurchasesPackage | null => {
    if (!offerings || !offerings.current) return null;
    return offerings.current.annual || getPackageByProductId('yearly');
  };

  return useMemo(() => ({
    isPremium,
    isLoading,
    isInitialized,
    customerInfo,
    offerings,
    purchasePackage,
    purchaseProduct,
    restorePurchases,
    getPackageByProductId,
    getMonthlyPackage,
    getYearlyPackage,
  }), [
    isPremium,
    isLoading,
    isInitialized,
    customerInfo,
    offerings,
  ]);
});

export const usePremium = () => {
  const { isPremium, isLoading } = useRevenueCat();
  return { isPremium, isLoading };
};
