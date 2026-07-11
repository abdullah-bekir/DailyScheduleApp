import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Purchases from 'react-native-purchases';
import { useTranslation } from 'react-i18next';

import PrimaryButton from '../components/common/PrimaryButton';
import ScreenHero from '../components/layout/ScreenHero';
import SectionHeader from '../components/layout/SectionHeader';
import TextLink from '../components/common/TextLink';
import { useSubscription } from '../context/SubscriptionContext';
import { useTheme } from '../context/ThemeContext';
import { cardShadow } from '../theme/shadows';

function createStyles(colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    body: {
      paddingHorizontal: 20,
      gap: 18,
      marginTop: -18,
      paddingBottom: 36,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingVertical: 6,
    },
    benefitBullet: {
      fontSize: 16,
      marginTop: 1,
    },
    benefitText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: colors.textPrimary,
      lineHeight: 22,
    },
    planCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      gap: 10,
      ...cardShadow(colors),
    },
    planTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    planPrice: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.primary,
    },
    planHint: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 19,
    },
    closeBtn: {
      alignSelf: 'flex-end',
      paddingVertical: 8,
      paddingHorizontal: 4,
      marginBottom: -4,
    },
    closeLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.primary,
    },
    footer: {
      alignItems: 'center',
      gap: 10,
      paddingTop: 8,
    },
    warnBox: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceSubtle,
      padding: 14,
    },
    warnText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });
}

export default function PaywallScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { offerings, purchasePackage, restorePurchases, ready, entitlementId } = useSubscription();
  const [busyId, setBusyId] = useState(null);

  const current = offerings?.current;
  const packages = current?.availablePackages ?? [];

  const monthly = useMemo(
    () => packages.find((p) => p.packageType === Purchases.PACKAGE_TYPE.MONTHLY) ?? null,
    [packages],
  );
  const annual = useMemo(
    () => packages.find((p) => p.packageType === Purchases.PACKAGE_TYPE.ANNUAL) ?? null,
    [packages],
  );

  const onPurchase = useCallback(
    async (pkg) => {
      if (!pkg) return;
      setBusyId(pkg.identifier);
      try {
        await purchasePackage(pkg);
        Alert.alert(t('paywall.purchaseSuccessTitle'), t('paywall.purchaseSuccessBody'), [
          { text: t('common.ok'), onPress: () => navigation.goBack() },
        ]);
      } catch (e) {
        if (
          e?.userCancelled ||
          e?.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
        ) {
          return;
        }
        Alert.alert(t('paywall.purchaseErrorTitle'), e?.message ?? t('paywall.purchaseErrorBody'));
      } finally {
        setBusyId(null);
      }
    },
    [navigation, purchasePackage, t],
  );

  const onRestore = useCallback(async () => {
    setBusyId('restore');
    try {
      const info = await restorePurchases();
      const active = Boolean(info?.entitlements?.active?.[entitlementId]);
      Alert.alert(
        t('paywall.restoreTitle'),
        active ? t('paywall.restoreActive') : t('paywall.restoreNoActive'),
      );
    } catch (e) {
      Alert.alert(t('paywall.restoreTitle'), e?.message ?? t('paywall.purchaseErrorBody'));
    } finally {
      setBusyId(null);
    }
  }, [entitlementId, restorePurchases, t]);

  const missingProducts = ready && packages.length === 0;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: Math.max(insets.top, 12), paddingHorizontal: 16 }}>
        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.closeLabel}>{t('common.close')}</Text>
        </Pressable>
      </View>

      <ScreenHero
        eyebrow={t('paywall.eyebrow')}
        title={t('paywall.title')}
        subtitle={t('paywall.subtitle')}
        titleSize={28}
      />

      <View style={[styles.body, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <SectionHeader title={t('paywall.benefitsTitle')} subtitle={t('paywall.benefitsSubtitle')} />
        <View>
          {[
            t('paywall.benefitNoAds'),
            t('paywall.benefitUpdates'),
            t('paywall.benefitPrivacy'),
          ].map((line) => (
            <View key={line} style={styles.benefitRow}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>{line}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title={t('paywall.plansTitle')} subtitle={t('paywall.plansSubtitle')} />

        {missingProducts ? (
          <View style={styles.warnBox}>
            <Text style={styles.warnText}>
              {t('paywall.missingProducts')}
            </Text>
          </View>
        ) : null}

        {monthly ? (
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>{t('paywall.monthly')}</Text>
            <Text style={styles.planPrice}>{monthly.product.priceString}</Text>
            <Text style={styles.planHint}>{monthly.product.title}</Text>
            <PrimaryButton
              title={busyId === monthly.identifier ? t('common.processing') : t('paywall.monthlySelect')}
              onPress={() => onPurchase(monthly)}
              disabled={Boolean(busyId)}
            />
          </View>
        ) : null}

        {annual ? (
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>{t('paywall.annual')}</Text>
            <Text style={styles.planPrice}>{annual.product.priceString}</Text>
            <Text style={styles.planHint}>{annual.product.title}</Text>
            <PrimaryButton
              title={busyId === annual.identifier ? t('common.processing') : t('paywall.annualSelect')}
              onPress={() => onPurchase(annual)}
              disabled={Boolean(busyId)}
            />
          </View>
        ) : null}

        <View style={styles.footer}>
          <TextLink title={t('paywall.restore')} onPress={() => !busyId && onRestore()} />
          {busyId === 'restore' ? <ActivityIndicator color={colors.primary} /> : null}
        </View>
      </View>
    </ScrollView>
  );
}
