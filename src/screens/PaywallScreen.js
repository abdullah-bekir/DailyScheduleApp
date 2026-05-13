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
        Alert.alert('Premium', 'Satın alma tamamlandı. Teşekkürler!', [
          { text: 'Tamam', onPress: () => navigation.goBack() },
        ]);
      } catch (e) {
        if (
          e?.userCancelled ||
          e?.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
        ) {
          return;
        }
        Alert.alert('Satın alma', e?.message ?? 'İşlem tamamlanamadı.');
      } finally {
        setBusyId(null);
      }
    },
    [navigation, purchasePackage],
  );

  const onRestore = useCallback(async () => {
    setBusyId('restore');
    try {
      const info = await restorePurchases();
      const active = Boolean(info?.entitlements?.active?.[entitlementId]);
      Alert.alert(
        'Geri yükleme',
        active ? 'Premium aktif görünüyor.' : 'Bu hesapta aktif abonelik bulunamadı.',
      );
    } catch (e) {
      Alert.alert('Geri yükleme', e?.message ?? 'İşlem tamamlanamadı.');
    } finally {
      setBusyId(null);
    }
  }, [entitlementId, restorePurchases]);

  const missingProducts = ready && packages.length === 0;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: Math.max(insets.top, 12), paddingHorizontal: 16 }}>
        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.closeLabel}>Kapat</Text>
        </Pressable>
      </View>

      <ScreenHero
        eyebrow="Premium"
        title="Reklamsız ve daha fazlası"
        subtitle="RevenueCat üzerinden abonelik; ürünleri App Store / Play Console ve RevenueCat panelinde tanımlamanız gerekir."
        titleSize={28}
      />

      <View style={[styles.body, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <SectionHeader title="Neler dahil" subtitle="Örnek avantaj listesi — paneldeki entitlement ile eşleşir." />
        <View>
          {[
            'Uygulama içi reklamların kapatılması (banner + ara ekran)',
            'Öncelikli tema ve görünüm güncellemeleri (yol haritasına bağlı)',
            'Veri ve gizlilik yaklaşımı aynı kalır; satın alma mağaza hesabınıza bağlıdır',
          ].map((line) => (
            <View key={line} style={styles.benefitRow}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>{line}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Planlar" subtitle="Aylık ve yıllık paketler RevenueCat offerings üzerinden gelir." />

        {missingProducts ? (
          <View style={styles.warnBox}>
            <Text style={styles.warnText}>
              Henüz paket bulunamadı. `.env` içine RevenueCat API anahtarlarını ekleyin; RevenueCat’te Offering ve
              App Store / Play ürünlerini bağlayın. Ardından development build ile yeniden deneyin.
            </Text>
          </View>
        ) : null}

        {monthly ? (
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>Aylık</Text>
            <Text style={styles.planPrice}>{monthly.product.priceString}</Text>
            <Text style={styles.planHint}>{monthly.product.title}</Text>
            <PrimaryButton
              title={busyId === monthly.identifier ? 'İşleniyor…' : 'Aylık planı seç'}
              onPress={() => onPurchase(monthly)}
              disabled={Boolean(busyId)}
            />
          </View>
        ) : null}

        {annual ? (
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>Yıllık</Text>
            <Text style={styles.planPrice}>{annual.product.priceString}</Text>
            <Text style={styles.planHint}>{annual.product.title}</Text>
            <PrimaryButton
              title={busyId === annual.identifier ? 'İşleniyor…' : 'Yıllık planı seç'}
              onPress={() => onPurchase(annual)}
              disabled={Boolean(busyId)}
            />
          </View>
        ) : null}

        <View style={styles.footer}>
          <TextLink title="Satın alımları geri yükle" onPress={() => !busyId && onRestore()} />
          {busyId === 'restore' ? <ActivityIndicator color={colors.primary} /> : null}
        </View>
      </View>
    </ScrollView>
  );
}
