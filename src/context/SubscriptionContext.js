import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases from 'react-native-purchases';

const SubscriptionContext = createContext(null);

function createBillingError(code = 'BILLING_NOT_CONFIGURED') {
  const err = new Error(code);
  err.code = code;
  return err;
}

export function SubscriptionProvider({ children }) {
  const extra = Constants.expoConfig?.extra ?? {};
  const entitlementId = extra.revenueCatEntitlementId || 'premium';
  const apiKey =
    Platform.OS === 'ios'
      ? String(extra.revenueCatApiKeyIOS ?? '').trim()
      : String(extra.revenueCatApiKeyAndroid ?? '').trim();
  const billingConfigured =
    Boolean(apiKey) && Constants.appOwnership !== 'expo';

  const [ready, setReady] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [offerings, setOfferings] = useState(null);

  useEffect(() => {
    if (!billingConfigured) {
      setReady(true);
      setIsPro(false);
      setOfferings(null);
      return undefined;
    }

    let cancelled = false;

    Purchases.setLogLevel(Purchases.LOG_LEVEL.WARN);
    Purchases.configure({ apiKey });

    const applyInfo = (info) => {
      if (cancelled || !info) return;
      setIsPro(Boolean(info.entitlements?.active?.[entitlementId]));
    };

    const boot = async () => {
      try {
        const info = await Purchases.getCustomerInfo();
        applyInfo(info);
      } catch {
        if (!cancelled) setIsPro(false);
      }
      try {
        const off = await Purchases.getOfferings();
        if (!cancelled) setOfferings(off);
      } catch {
        if (!cancelled) setOfferings(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    boot();

    const listener = (info) => applyInfo(info);
    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      cancelled = true;
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [apiKey, billingConfigured, entitlementId]);

  const purchasePackage = useCallback(
    async (pkg) => {
      if (!billingConfigured) {
        throw createBillingError();
      }
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setIsPro(Boolean(customerInfo?.entitlements?.active?.[entitlementId]));
      return customerInfo;
    },
    [billingConfigured, entitlementId],
  );

  const restorePurchases = useCallback(async () => {
    if (!billingConfigured) {
      throw createBillingError();
    }
    const info = await Purchases.restorePurchases();
    setIsPro(Boolean(info?.entitlements?.active?.[entitlementId]));
    return info;
  }, [billingConfigured, entitlementId]);

  const value = useMemo(
    () => ({
      ready,
      isPro,
      offerings,
      purchasePackage,
      restorePurchases,
      entitlementId,
      billingConfigured,
    }),
    [ready, isPro, offerings, purchasePackage, restorePurchases, entitlementId, billingConfigured],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return ctx;
}
