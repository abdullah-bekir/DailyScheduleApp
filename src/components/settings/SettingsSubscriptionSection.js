import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from 'react-native';
import Purchases from 'react-native-purchases';

import PrimaryButton from '../common/PrimaryButton';
import TextLink from '../common/TextLink';
import { PRIVACY_POLICY_URL, TERMS_URL } from '../../constants/legalUrls';
import { useLocale } from '../../context/LocaleContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useTheme } from '../../context/ThemeContext';
import { planDisplayPrice } from '../../lib/premiumPlans';
import { openExternalUrl, openSubscriptionManagement } from '../../utils/openExternalUrl';
import SettingsSectionCard from './SettingsSectionCard';

function createStyles(colors) {
  return StyleSheet.create({
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
    },
    statusText: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    statusTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    statusSub: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 17,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: colors.primaryLight,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.4,
      color: colors.primary,
      textTransform: 'uppercase',
    },
    note: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 19,
    },
    legal: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 18,
    },
    pendingBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
    },
    pendingText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
      lineHeight: 19,
    },
    warnBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: `${colors.danger}55`,
      backgroundColor: `${colors.danger}12`,
    },
    warnText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
      lineHeight: 19,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    linkRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      alignItems: 'center',
    },
  });
}

function formatDate(value, language) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return d.toLocaleDateString(language, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return d.toLocaleDateString();
  }
}

function periodOfProduct(productId, productIds) {
  const id = String(productId ?? '');
  if (!id) return null;
  if (id === productIds?.annual) return 'annual';
  if (id === productIds?.monthly) return 'monthly';
  if (/annual|year/i.test(id)) return 'annual';
  if (/month/i.test(id)) return 'monthly';
  return null;
}

export default function SettingsSubscriptionSection() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { language } = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    ready,
    isPro,
    billingConfigured,
    premiumPlans,
    productIds,
    subscriptionDetails,
    purchasePremium,
    restorePurchases,
    isPremiumActive,
    refreshSubscription,
  } = useSubscription();
  const [busy, setBusy] = useState(null);
  const [pendingPeriod, setPendingPeriod] = useState(null);

  const storeName = Platform.OS === 'ios' ? t('paywall.storeAppStore') : t('paywall.storeGooglePlay');
  const monthlyPlan = premiumPlans.monthly.package ?? premiumPlans.monthly.product;
  const annualPlan = premiumPlans.annual.package ?? premiumPlans.annual.product;
  const monthlyPrice = planDisplayPrice(monthlyPlan);
  const annualPrice = planDisplayPrice(annualPlan);

  const activePeriod = useMemo(
    () => (isPro ? periodOfProduct(subscriptionDetails?.productId, productIds) : null),
    [isPro, productIds, subscriptionDetails],
  );

  // Plan değişikliği yenilemede devreye girdiyse bekleyen bilgisini temizle.
  useEffect(() => {
    if (!isPro || (pendingPeriod && activePeriod === pendingPeriod)) setPendingPeriod(null);
  }, [activePeriod, isPro, pendingPeriod]);

  // Ekran açıldığında abonelik bilgisini tazele (yenileme sonrası değişiklik görünsün).
  useEffect(() => {
    if (billingConfigured) refreshSubscription();
  }, [billingConfigured, refreshSubscription]);

  const expiryText = useMemo(() => {
    const date = formatDate(subscriptionDetails?.expiresAt, language);
    if (!date) return '';
    return subscriptionDetails?.willRenew === false
      ? t('settings.subEnds', { date })
      : t('settings.subRenews', { date });
  }, [language, subscriptionDetails, t]);

  const runPurchase = useCallback(
    async (period) => {
      setBusy(period);
      try {
        const info = await purchasePremium(period);
        if (!isPremiumActive(info)) {
          Alert.alert(t('paywall.purchaseSuccessTitle'), t('paywall.purchaseErrorBody'));
          return;
        }
        const entitlement = info?.entitlements?.active
          ? Object.values(info.entitlements.active)[0]
          : null;
        const nowPeriod = periodOfProduct(entitlement?.productIdentifier, productIds);
        if (activePeriod && nowPeriod && nowPeriod !== period) {
          // Apple, değişikliği bir sonraki yenilemede uygular.
          setPendingPeriod(period);
          Alert.alert(
            t('paywall.purchaseSuccessTitle'),
            t('settings.subPendingNote', {
              plan: period === 'annual' ? t('paywall.annual') : t('paywall.monthly'),
            }),
          );
          return;
        }
        Alert.alert(t('paywall.purchaseSuccessTitle'), t('paywall.purchaseSuccessBody'));
      } catch (e) {
        if (e?.userCancelled || e?.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return;
        const msg =
          e?.code === 'BILLING_NOT_CONFIGURED'
            ? t('paywall.billingNotConfigured')
            : e?.message ?? t('paywall.purchaseErrorBody');
        Alert.alert(t('paywall.purchaseErrorTitle'), msg);
      } finally {
        setBusy(null);
      }
    },
    [activePeriod, isPremiumActive, productIds, purchasePremium, t],
  );

  const onSwitchPlan = useCallback(
    (period) => {
      const price = period === 'annual' ? annualPrice : monthlyPrice;
      const planName = period === 'annual' ? t('paywall.annual') : t('paywall.monthly');
      Alert.alert(
        t('settings.subSwitchTitle'),
        t('settings.subSwitchBody', { plan: planName, price: price ?? '—', store: storeName }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('settings.subSwitchConfirm'), onPress: () => runPurchase(period) },
        ],
      );
    },
    [annualPrice, monthlyPrice, runPurchase, storeName, t],
  );

  const onRestore = useCallback(async () => {
    setBusy('restore');
    try {
      const info = await restorePurchases();
      Alert.alert(
        t('paywall.restoreTitle'),
        isPremiumActive(info) ? t('paywall.restoreActive') : t('paywall.restoreNoActive'),
      );
    } catch (e) {
      const msg =
        e?.code === 'BILLING_NOT_CONFIGURED'
          ? t('paywall.billingNotConfigured')
          : e?.message ?? t('paywall.purchaseErrorBody');
      Alert.alert(t('paywall.restoreTitle'), msg);
    } finally {
      setBusy(null);
    }
  }, [isPremiumActive, restorePurchases, t]);

  const onManage = useCallback(() => {
    const steps = Platform.OS === 'ios' ? t('settings.subCancelStepsIos') : t('settings.subCancelStepsAndroid');
    Alert.alert(
      t('settings.subCancelTitle'),
      `${steps}\n\n${t('settings.subCancelKeep')}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.subOpenStore', { store: storeName }), onPress: () => openSubscriptionManagement() },
      ],
    );
  }, [storeName, t]);

  const onRetry = useCallback(async () => {
    setBusy('retry');
    try {
      await refreshSubscription();
    } finally {
      setBusy(null);
    }
  }, [refreshSubscription]);

  const hasPlans = Boolean(monthlyPlan || annualPlan);
  const planLabel =
    activePeriod === 'annual'
      ? t('paywall.annual')
      : activePeriod === 'monthly'
        ? t('paywall.monthly')
        : t('settings.subPlanUnknown');

  return (
    <SettingsSectionCard
      icon="diamond-outline"
      title={t('settings.subTitle')}
      subtitle={t('settings.subSubtitle')}
      tone={isPro ? 'premium' : 'default'}
    >
      {!billingConfigured ? (
        <Text style={styles.note}>{t('paywall.billingNotConfigured')}</Text>
      ) : !ready ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <View style={styles.statusRow}>
            <Ionicons
              name={isPro ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={isPro ? colors.success : colors.textTertiary}
            />
            <View style={styles.statusText}>
              <Text style={styles.statusTitle}>
                {isPro ? t('settings.subStatusActive') : t('settings.subStatusFree')}
              </Text>
              <Text style={styles.statusSub}>
                {isPro
                  ? [planLabel, subscriptionDetails?.isTrial ? t('settings.subTrial') : '', expiryText]
                      .filter(Boolean)
                      .join(' · ')
                  : t('settings.subFreeIntro')}
              </Text>
            </View>
            {isPro ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Premium</Text>
              </View>
            ) : null}
          </View>

          {isPro && subscriptionDetails?.billingIssue ? (
            <View style={styles.warnBox}>
              <Ionicons name="warning-outline" size={20} color={colors.danger} />
              <Text style={styles.warnText}>{t('settings.subBillingIssue', { store: storeName })}</Text>
            </View>
          ) : null}

          {isPro ? (
            <>
              {!pendingPeriod && activePeriod === 'monthly' && annualPlan ? (
                <PrimaryButton
                  title={
                    busy === 'annual'
                      ? t('common.processing')
                      : t('settings.subSwitchAnnual', { price: annualPrice ?? '—' })
                  }
                  onPress={() => !busy && onSwitchPlan('annual')}
                  disabled={Boolean(busy)}
                />
              ) : null}
              {!pendingPeriod && activePeriod === 'annual' && monthlyPlan ? (
                <PrimaryButton
                  title={
                    busy === 'monthly'
                      ? t('common.processing')
                      : t('settings.subSwitchMonthly', { price: monthlyPrice ?? '—' })
                  }
                  variant="outline"
                  onPress={() => !busy && onSwitchPlan('monthly')}
                  disabled={Boolean(busy)}
                  mutedCta
                />
              ) : null}
              {pendingPeriod ? (
                <View style={styles.pendingBox}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <Text style={styles.pendingText}>
                    {t('settings.subPendingNote', {
                      plan: pendingPeriod === 'annual' ? t('paywall.annual') : t('paywall.monthly'),
                    })}
                  </Text>
                </View>
              ) : null}
              <PrimaryButton
                title={t('settings.subManage')}
                variant="outline"
                onPress={onManage}
                mutedCta
              />
              <Text style={styles.note}>{t('settings.subManageHint', { store: storeName })}</Text>
            </>
          ) : hasPlans ? (
            <>
              {annualPlan ? (
                <PrimaryButton
                  title={
                    busy === 'annual'
                      ? t('common.processing')
                      : t('settings.subChoose', { plan: t('paywall.annual'), price: annualPrice ?? '—' })
                  }
                  onPress={() => !busy && runPurchase('annual')}
                  disabled={Boolean(busy)}
                />
              ) : null}
              {monthlyPlan ? (
                <PrimaryButton
                  title={
                    busy === 'monthly'
                      ? t('common.processing')
                      : t('settings.subChoose', { plan: t('paywall.monthly'), price: monthlyPrice ?? '—' })
                  }
                  variant="outline"
                  onPress={() => !busy && runPurchase('monthly')}
                  disabled={Boolean(busy)}
                  mutedCta
                />
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.note}>{t('paywall.missingProducts')}</Text>
              <TextLink title={t('common.retry')} onPress={() => !busy && onRetry()} />
            </>
          )}

          <View style={styles.divider} />
          <View style={styles.linkRow}>
            <TextLink title={t('paywall.restore')} onPress={() => !busy && onRestore()} />
            {busy === 'restore' || busy === 'retry' ? <ActivityIndicator color={colors.primary} /> : null}
          </View>
          {hasPlans || isPro ? (
            <Text style={styles.legal}>{t('paywall.legalAutoRenew', { store: storeName })}</Text>
          ) : null}
          <View style={styles.linkRow}>
            <TextLink title={t('paywall.legalTermsLink')} onPress={() => openExternalUrl(TERMS_URL)} />
            <TextLink title={t('paywall.legalPrivacyLink')} onPress={() => openExternalUrl(PRIVACY_POLICY_URL)} />
          </View>
        </>
      )}
    </SettingsSectionCard>
  );
}
