import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases from 'react-native-purchases';

import {
  fetchDirectStoreProducts,
  getConfiguredProductIds,
  hasPurchasablePlan,
  pickPackagesFromOfferings,
} from '../lib/premiumPlans';
import { useSupabaseSession } from './SupabaseContext';

const EMPTY_PLANS = { monthly: { package: null, product: null }, annual: { package: null, product: null } };

const SubscriptionContext = createContext(null);

function createBillingError(code = 'BILLING_NOT_CONFIGURED') {
  const err = new Error(code);
  err.code = code;
  return err;
}

/** EAS / .env placeholder veya eksik anahtar — RevenueCat "Invalid API key" verir. */
function isRevenueCatApiKeyConfigured(key, os) {
  const k = String(key ?? '').trim();
  if (!k || /BURAYA|buraya|YOUR_|XXX|example/i.test(k)) return false;
  if (os === 'ios') return k.startsWith('appl_') && k.length >= 16;
  if (os === 'android') return k.startsWith('goog_') && k.length >= 16;
  return false;
}

function hasActivePremium(info, entitlementId) {
  const active = info?.entitlements?.active;
  if (active && typeof active === 'object') {
    const id = String(entitlementId || 'premium');
    if (active[id]) return true;
    const want = id.toLowerCase();
    if (Object.keys(active).some((key) => key.toLowerCase() === want)) return true;
  }
  const subs = info?.activeSubscriptions;
  return Array.isArray(subs) && subs.length > 0;
}

async function loadPremiumPlans(offerings, productIds) {
  const fromPackages = pickPackagesFromOfferings(offerings, productIds);
  const plans = {
    monthly: { package: fromPackages.monthly, product: null },
    annual: { package: fromPackages.annual, product: null },
  };
  if (hasPurchasablePlan(plans)) return plans;
  try {
    const direct = await fetchDirectStoreProducts(productIds);
    if (direct.monthly) plans.monthly.product = direct.monthly;
    if (direct.annual) plans.annual.product = direct.annual;
  } catch {
    /* Store ürünleri yok — ASC + RevenueCat iOS kontrol listesi */
  }
  return plans;
}

async function ensurePurchasesLoggedIn(userId) {
  const id = typeof userId === 'string' ? userId.trim() : '';
  if (!id) return;
  try {
    await Purchases.logIn(id);
  } catch {
    /* RC anonim kalabilir; restore yine denenecek */
  }
}

async function refreshCustomerInfoAfterRestore(initialInfo) {
  let info = initialInfo;
  try {
    if (Platform.OS === 'android' && typeof Purchases.syncPurchasesForResult === 'function') {
      const synced = await Purchases.syncPurchasesForResult();
      if (synced?.customerInfo) info = synced.customerInfo;
    } else if (Platform.OS === 'ios') {
      if (typeof Purchases.invalidateCustomerInfoCache === 'function') {
        await Purchases.invalidateCustomerInfoCache();
      }
      info = await Purchases.getCustomerInfo();
    }
  } catch {
    /* restorePurchases sonucu yeterli olabilir */
  }
  return info;
}

export function SubscriptionProvider({ children }) {
  const { userId } = useSupabaseSession();
  const extra = Constants.expoConfig?.extra ?? {};
  const entitlementId = extra.revenueCatEntitlementId || 'premium';
  const productIds = useMemo(() => getConfiguredProductIds(extra), [extra]);
  const apiKey =
    Platform.OS === 'ios'
      ? String(extra.revenueCatApiKeyIOS ?? '').trim()
      : String(extra.revenueCatApiKeyAndroid ?? '').trim();
  const billingConfigured =
    isRevenueCatApiKeyConfigured(apiKey, Platform.OS) && Constants.appOwnership !== 'expo';

  const [ready, setReady] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [offerings, setOfferings] = useState(null);
  const [premiumPlans, setPremiumPlans] = useState(EMPTY_PLANS);
  const entitlementIdRef = useRef(entitlementId);
  entitlementIdRef.current = entitlementId;

  useEffect(() => {
    if (!billingConfigured) {
      setReady(true);
      setIsPro(false);
      setOfferings(null);
      setPremiumPlans(EMPTY_PLANS);
      return undefined;
    }

    let cancelled = false;

    Purchases.setLogLevel(Purchases.LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey });

    const applyInfo = (info) => {
      if (cancelled || !info) return;
      setIsPro(hasActivePremium(info, entitlementId));
    };

    const boot = async () => {
      try {
        const info = await Purchases.getCustomerInfo();
        applyInfo(info);
      } catch {
        if (!cancelled) setIsPro(false);
      }
      try {
        let off = await Purchases.getOfferings();
        let plans = await loadPremiumPlans(off, productIds);
        if (!cancelled) {
          setOfferings(off);
          setPremiumPlans(plans);
        }
        if (!cancelled && !hasPurchasablePlan(plans) && Platform.OS === 'ios') {
          for (let attempt = 0; attempt < 3 && !hasPurchasablePlan(plans); attempt += 1) {
            await new Promise((r) => setTimeout(r, 1200 + attempt * 800));
            off = await Purchases.getOfferings();
            plans = await loadPremiumPlans(off, productIds);
            if (!cancelled) {
              setOfferings(off);
              setPremiumPlans(plans);
            }
          }
        }
      } catch {
        if (!cancelled) {
          setOfferings(null);
          setPremiumPlans(EMPTY_PLANS);
        }
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
  }, [apiKey, billingConfigured, entitlementId, productIds]);

  useEffect(() => {
    if (!billingConfigured || !ready) return undefined;
    const id = typeof userId === 'string' ? userId.trim() : '';
    if (!id) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const { customerInfo } = await Purchases.logIn(id);
        if (!cancelled && customerInfo) {
          setIsPro(hasActivePremium(customerInfo, entitlementIdRef.current));
        }
        const off = await Purchases.getOfferings();
        if (!cancelled) {
          const plans = await loadPremiumPlans(off, productIds);
          setOfferings(off);
          setPremiumPlans(plans);
        }
      } catch {
        /* RC anonim kalır; satın alma yine çalışabilir */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [billingConfigured, productIds, ready, userId]);

  const purchasePremium = useCallback(
    async (period) => {
      if (!billingConfigured) throw createBillingError();
      await ensurePurchasesLoggedIn(userId);
      const slot = period === 'annual' ? premiumPlans.annual : premiumPlans.monthly;
      let customerInfo;
      if (slot.package) {
        ({ customerInfo } = await Purchases.purchasePackage(slot.package));
      } else if (slot.product) {
        ({ customerInfo } = await Purchases.purchaseStoreProduct(slot.product));
      } else {
        throw createBillingError('NO_PRODUCT');
      }
      setIsPro(hasActivePremium(customerInfo, entitlementId));
      return customerInfo;
    },
    [billingConfigured, entitlementId, premiumPlans, userId],
  );

  const purchasePackage = useCallback(
    async (pkg) => {
      if (!billingConfigured) {
        throw createBillingError();
      }
      await ensurePurchasesLoggedIn(userId);
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setIsPro(hasActivePremium(customerInfo, entitlementId));
      return customerInfo;
    },
    [billingConfigured, entitlementId, userId],
  );

  const reloadStoreAndPlans = useCallback(async () => {
    const off = await Purchases.getOfferings();
    const plans = await loadPremiumPlans(off, productIds);
    setOfferings(off);
    setPremiumPlans(plans);
    return plans;
  }, [productIds]);

  const refreshSubscription = useCallback(async () => {
    if (!billingConfigured) return;
    await ensurePurchasesLoggedIn(userId);
    try {
      if (typeof Purchases.invalidateCustomerInfoCache === 'function') {
        await Purchases.invalidateCustomerInfoCache();
      }
      const info = await Purchases.getCustomerInfo();
      setIsPro(hasActivePremium(info, entitlementId));
      await reloadStoreAndPlans();
    } catch {
      /* ağ / mağaza geçici hatası */
    }
  }, [billingConfigured, entitlementId, reloadStoreAndPlans, userId]);

  const restorePurchases = useCallback(async () => {
    if (!billingConfigured) {
      throw createBillingError();
    }
    await ensurePurchasesLoggedIn(userId);
    let info = await Purchases.restorePurchases();
    info = await refreshCustomerInfoAfterRestore(info);
    setIsPro(hasActivePremium(info, entitlementId));
    await reloadStoreAndPlans();
    return info;
  }, [billingConfigured, entitlementId, reloadStoreAndPlans, userId]);

  const isPremiumActive = useCallback(
    (info) => hasActivePremium(info, entitlementId),
    [entitlementId],
  );

  const value = useMemo(
    () => ({
      ready,
      isPro,
      offerings,
      premiumPlans,
      hasPurchasablePlans: hasPurchasablePlan(premiumPlans),
      purchasePackage,
      purchasePremium,
      restorePurchases,
      refreshSubscription,
      isPremiumActive,
      entitlementId,
      billingConfigured,
    }),
    [
      ready,
      isPro,
      offerings,
      premiumPlans,
      purchasePackage,
      purchasePremium,
      restorePurchases,
      refreshSubscription,
      isPremiumActive,
      entitlementId,
      billingConfigured,
    ],
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
