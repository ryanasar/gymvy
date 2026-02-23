import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { useAuth } from '@/lib/auth';
import {
  trackPaywallViewed,
  trackTrialStarted,
  trackSubscriptionStarted,
  trackSubscriptionCancelled,
} from '@/lib/analytics';

// RevenueCat API keys
const REVENUECAT_IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '';
const REVENUECAT_ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '';

// Your entitlement identifier from RevenueCat dashboard
const PREMIUM_ENTITLEMENT_ID = 'premium';

interface SubscriptionContextType {
  // State
  isInitialized: boolean;
  isPremium: boolean;
  isTrialActive: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  checkSubscriptionStatus: () => Promise<void>;
  trackPaywall: (source: string) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isInitialized: false,
  isPremium: false,
  isTrialActive: false,
  customerInfo: null,
  offerings: null,
  isLoading: false,
  error: null,
  purchasePackage: async () => false,
  restorePurchases: async () => false,
  checkSubscriptionStatus: async () => {},
  trackPaywall: () => {},
});

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize RevenueCat
  useEffect(() => {
    const initializePurchases = async () => {
      try {
        const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_API_KEY : REVENUECAT_ANDROID_API_KEY;

        if (!apiKey) {
          return;
        }

        // Enable debug logs in development
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        await Purchases.configure({ apiKey });
        setIsInitialized(true);

        // Fetch initial offerings
        await fetchOfferings();
      } catch (err) {
        console.error('[Subscription] Failed to initialize RevenueCat:', err);
        setError('Failed to initialize subscriptions');
      }
    };

    initializePurchases();
  }, []);

  // Identify user when they log in
  useEffect(() => {
    const identifyUser = async () => {
      if (!isInitialized || !user?.id) return;

      try {
        // Log in the user to RevenueCat (ID must be a string)
        const userId = String(user.id);
        const { customerInfo } = await Purchases.logIn(userId);
        updateSubscriptionStatus(customerInfo);
      } catch (err) {
        console.error('[Subscription] Failed to identify user:', err);
      }
    };

    identifyUser();
  }, [isInitialized, user?.id]);

  // Listen for subscription changes
  useEffect(() => {
    if (!isInitialized) return;

    const customerInfoUpdateListener = (info: CustomerInfo) => {
      updateSubscriptionStatus(info);
    };

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
    };
  }, [isInitialized]);

  // Update subscription status from CustomerInfo
  const updateSubscriptionStatus = (info: CustomerInfo) => {
    setCustomerInfo(info);

    // Check if user has premium entitlement
    const premiumEntitlement = info.entitlements.active[PREMIUM_ENTITLEMENT_ID];
    const hasPremium = !!premiumEntitlement;
    setIsPremium(hasPremium);

    // Check if currently in trial period
    if (premiumEntitlement) {
      const periodType = premiumEntitlement.periodType;
      setIsTrialActive(periodType === 'TRIAL');
    } else {
      setIsTrialActive(false);
    }
  };

  // Fetch available offerings/packages
  const fetchOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setOfferings(offerings.current);
      }
    } catch (err) {
      console.error('[Subscription] Failed to fetch offerings:', err);
    }
  };

  // Check current subscription status
  const checkSubscriptionStatus = useCallback(async () => {
    if (!isInitialized) return;

    try {
      setIsLoading(true);
      const info = await Purchases.getCustomerInfo();
      updateSubscriptionStatus(info);
    } catch (err) {
      console.error('[Subscription] Failed to check status:', err);
      setError('Failed to check subscription status');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Purchase a package
  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    if (!isInitialized) {
      setError('Subscriptions not initialized');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      updateSubscriptionStatus(customerInfo);

      // Track the purchase
      const premiumEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
      if (premiumEntitlement) {
        if (premiumEntitlement.periodType === 'TRIAL') {
          trackTrialStarted();
        } else {
          trackSubscriptionStarted({
            plan: pkg.identifier,
            price: pkg.product.price,
            currency: pkg.product.currencyCode,
          });
        }
      }

      return true;
    } catch (err: any) {
      // User cancelled is not an error
      if (err.userCancelled) {
        return false;
      }

      console.error('[Subscription] Purchase failed:', err);
      setError(err.message || 'Purchase failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Restore previous purchases
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isInitialized) {
      setError('Subscriptions not initialized');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const info = await Purchases.restorePurchases();
      updateSubscriptionStatus(info);

      const restored = !!info.entitlements.active[PREMIUM_ENTITLEMENT_ID];
      return restored;
    } catch (err: any) {
      console.error('[Subscription] Restore failed:', err);
      setError(err.message || 'Failed to restore purchases');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Track paywall views for analytics
  const trackPaywall = useCallback((source: string) => {
    trackPaywallViewed(source);
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        isInitialized,
        isPremium,
        isTrialActive,
        customerInfo,
        offerings,
        isLoading,
        error,
        purchasePackage,
        restorePurchases,
        checkSubscriptionStatus,
        trackPaywall,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Helper hook for checking premium access
export const usePremiumAccess = () => {
  const { isPremium, isTrialActive } = useSubscription();
  return isPremium || isTrialActive;
};

export default SubscriptionProvider;
