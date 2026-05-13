import { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { cardShadow } from '../../theme/shadows';

/** Açık temada `palettes.ctaMuted` ile aynı; koyu temada sabit bant */
const GREETING = {
  bgFallback: '#3D3E44',
  date: '#B4B8BF',
  title: '#FAFAFA',
};

const titleSerif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

function createStyles(colors) {
  return StyleSheet.create({
    shell: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingBottom: 22,
      borderBottomLeftRadius: 26,
      borderBottomRightRadius: 26,
      borderBottomWidth: 0,
      borderBottomColor: 'transparent',
      ...cardShadow(colors, 'sm'),
      ...(Platform.OS === 'android' ? { elevation: 0, shadowOpacity: 0 } : {}),
    },
    inner: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 14,
    },
    accent: {
      width: 4,
      borderRadius: 999,
      backgroundColor: colors.primary,
      opacity: 0.88,
      alignSelf: 'stretch',
      minHeight: 52,
    },
    textCol: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
    },
    eyebrowPill: {
      alignSelf: 'flex-start',
      backgroundColor: colors.surfaceSubtle,
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },
    eyebrow: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      color: colors.textSecondary,
    },
    title: {
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.85,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 22,
      letterSpacing: -0.12,
    },
  });
}

function createGreetingStyles() {
  return StyleSheet.create({
    shell: {
      paddingHorizontal: 22,
      paddingBottom: 26,
      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
    },
    dateLine: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 1.2,
      color: GREETING.date,
      marginBottom: 14,
    },
    greetingTitle: {
      fontFamily: titleSerif,
      fontWeight: '700',
      color: GREETING.title,
      letterSpacing: -0.6,
    },
    greetingSubtitle: {
      marginTop: 10,
      fontSize: 15,
      fontWeight: '500',
      color: GREETING.date,
      lineHeight: 22,
      letterSpacing: -0.1,
    },
  });
}

/**
 * @param {'default' | 'greeting'} [variant]
 * @param {string} [dateLine] — variant=greeting: üst satır (büyük harf tarih)
 */
export default function ScreenHero({
  variant = 'default',
  eyebrow,
  title,
  subtitle,
  titleSize = 32,
  dateLine,
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const gStyles = useMemo(() => createGreetingStyles(), []);
  const showEyebrow = Boolean(eyebrow && String(eyebrow).trim());
  const titleLineHeight = Math.round(titleSize * 1.06);

  if (variant === 'greeting') {
    const padTop = Math.max(insets.top, 12) + 8;

    const bandBg = colors.ctaMuted ?? GREETING.bgFallback;

    return (
      <View style={[gStyles.shell, { paddingTop: padTop, backgroundColor: bandBg }]}>
        {dateLine ? (
          <Text style={gStyles.dateLine} numberOfLines={2}>
            {dateLine}
          </Text>
        ) : null}
        <Text style={[gStyles.greetingTitle, { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.12) }]}>
          {title}
        </Text>
        {subtitle ? <Text style={gStyles.greetingSubtitle}>{subtitle}</Text> : null}
      </View>
    );
  }

  return (
    <View style={[styles.shell, { paddingTop: Math.max(insets.top, 12) + 10 }]}>
      <View style={styles.inner}>
        <View style={styles.accent} />
        <View style={styles.textCol}>
          {showEyebrow ? (
            <View style={styles.eyebrowPill}>
              <Text style={styles.eyebrow} numberOfLines={1}>
                {eyebrow}
              </Text>
            </View>
          ) : null}
          <Text
            style={[
              styles.title,
              {
                fontSize: titleSize,
                lineHeight: titleLineHeight,
                marginTop: showEyebrow ? 0 : 1,
              },
            ]}
          >
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}
