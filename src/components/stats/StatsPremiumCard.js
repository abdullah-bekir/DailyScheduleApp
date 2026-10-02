import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../common/PrimaryButton';
import TextLink from '../common/TextLink';
import { planDisplayPrice } from '../../lib/premiumPlans';
import { useTheme } from '../../context/ThemeContext';
import { cardShadow } from '../../theme/shadows';

function createStyles(colors, isDark, isPro) {
  return StyleSheet.create({
    shell: {
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isPro ? colors.success : colors.primary,
      backgroundColor: isDark ? colors.surface : colors.primaryLight,
      ...cardShadow(colors, 'sm'),
    },
    inner: {
      padding: 18,
      gap: 14,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 14,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isPro ? `${colors.success}55` : `${colors.primary}44`,
    },
    copy: {
      flex: 1,
      gap: 4,
      minWidth: 0,
    },
    eyebrow: {
      fontSize: 11,
      fontWeight: '800',
      color: isPro ? colors.success : colors.primary,
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    headline: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.4,
    },
    body: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 20,
    },
    planRow: {
      flexDirection: 'row',
      gap: 10,
    },
    planTile: {
      flex: 1,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingVertical: 14,
      paddingHorizontal: 12,
      gap: 4,
      alignItems: 'center',
    },
    planTileHighlight: {
      borderColor: colors.primary,
      backgroundColor: isDark ? colors.primaryLight : colors.surface,
    },
    planLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    planPrice: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    planPriceMuted: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textTertiary,
    },
    pending: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      lineHeight: 19,
      textAlign: 'center',
    },
    actions: {
      gap: 10,
    },
    buyRow: {
      flexDirection: 'row',
      gap: 10,
    },
    buyHalf: {
      flex: 1,
    },
  });
}

export default function StatsPremiumCard({
  isPro,
  billingConfigured,
  ready,
  hasPurchasablePlans,
  monthlyPlan,
  annualPlan,
  purchaseBusy,
  restoreBusy,
  onBuyMonthly,
  onBuyAnnual,
  onOpenPaywall,
  onRestore,
}) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark, isPro), [colors, isDark, isPro]);

  const monthlyPrice = planDisplayPrice(monthlyPlan);
  const annualPrice = planDisplayPrice(annualPlan);
  const canBuyMonthly = billingConfigured && monthlyPlan;
  const canBuyAnnual = billingConfigured && annualPlan;

  return (
    <View style={styles.shell}>
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <Ionicons
              name={isPro ? 'shield-checkmark' : 'diamond-outline'}
              size={26}
              color={isPro ? colors.success : colors.primary}
            />
          </View>
          <View style={styles.copy}>
            <Text style={styles.eyebrow}>{isPro ? t('stats.premiumBadgeActive') : t('stats.premiumBadge')}</Text>
            <Text style={styles.headline}>
              {isPro ? t('stats.premiumActiveTitle') : t('stats.premiumTitle')}
            </Text>
            <Text style={styles.body}>
              {isPro ? t('stats.premiumActiveBody') : t('stats.premiumBody')}
            </Text>
          </View>
        </View>

        {!isPro ? (
          <>
            <View style={styles.planRow}>
              <View style={[styles.planTile, canBuyMonthly && styles.planTileHighlight]}>
                <Text style={styles.planLabel}>{t('stats.premiumPlanMonthlyLabel')}</Text>
                <Text style={monthlyPrice ? styles.planPrice : styles.planPriceMuted}>
                  {monthlyPrice ?? '—'}
                </Text>
              </View>
              <View style={[styles.planTile, canBuyAnnual && styles.planTileHighlight]}>
                <Text style={styles.planLabel}>{t('stats.premiumPlanAnnualLabel')}</Text>
                <Text style={annualPrice ? styles.planPrice : styles.planPriceMuted}>
                  {annualPrice ?? '—'}
                </Text>
              </View>
            </View>

            {ready && (!billingConfigured || !hasPurchasablePlans) ? (
              <Text style={styles.pending}>
                {billingConfigured ? t('stats.premiumPricePending') : t('paywall.billingNotConfigured')}
              </Text>
            ) : null}

            <View style={styles.actions}>
              {canBuyMonthly && canBuyAnnual ? (
                <View style={styles.buyRow}>
                  <View style={styles.buyHalf}>
                    <PrimaryButton
                      title={purchaseBusy ? t('common.processing') : t('stats.premiumBuyMonthly')}
                      onPress={onBuyMonthly}
                      disabled={purchaseBusy || restoreBusy}
                    />
                  </View>
                  <View style={styles.buyHalf}>
                    <PrimaryButton
                      title={purchaseBusy ? t('common.processing') : t('stats.premiumBuyAnnual')}
                      variant="outline"
                      onPress={onBuyAnnual}
                      disabled={purchaseBusy || restoreBusy}
                    />
                  </View>
                </View>
              ) : (
                <PrimaryButton
                  title={
                    purchaseBusy
                      ? t('common.processing')
                      : canBuyMonthly || canBuyAnnual
                        ? t('stats.premiumBuy')
                        : t('stats.premiumSeePlans')
                  }
                  onPress={canBuyMonthly ? onBuyMonthly : canBuyAnnual ? onBuyAnnual : onOpenPaywall}
                  disabled={purchaseBusy || restoreBusy}
                />
              )}
              <TextLink title={t('stats.premiumSeePlans')} onPress={onOpenPaywall} />
              {billingConfigured ? (
                <TextLink
                  title={restoreBusy ? t('common.processing') : t('paywall.restore')}
                  onPress={onRestore}
                />
              ) : null}
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}
