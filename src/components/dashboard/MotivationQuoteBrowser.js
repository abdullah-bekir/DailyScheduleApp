import { Ionicons } from '@expo/vector-icons';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { getMotivationQuotesForStats } from '../../utils/dailyMotivation';

/** Tüm motivasyon sözlerinde aynı işaret (Günlük rutin… satırında kullanılan ✨ ile uyumlu) */
const MOTIVATION_QUOTE_EMOJI = '✨';

function randomQuoteIndex(poolLength, avoidIdx = undefined) {
  if (poolLength <= 0) return 0;
  if (poolLength === 1) return 0;
  let n = Math.floor(Math.random() * poolLength);
  if (avoidIdx === undefined || poolLength <= 2) return n;
  let guard = 0;
  while (n === avoidIdx && guard < 32) {
    n = Math.floor(Math.random() * poolLength);
    guard += 1;
  }
  return n;
}

function createStyles(colors) {
  const quoteColor = colors.textPrimary;

  return StyleSheet.create({
    wrap: {
      borderRadius: 18,
      paddingVertical: 15,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: 12,
    },
    label: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.85,
      textTransform: 'uppercase',
      textAlign: 'center',
      alignSelf: 'stretch',
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'center',
      gap: 8,
    },
    navArrow: {
      width: 34,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'stretch',
      minHeight: 72,
    },
    quoteCenter: {
      flex: 1,
      minWidth: 0,
      maxWidth: '82%',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    quoteWrap: {
      width: '100%',
      textAlign: 'center',
      alignSelf: 'center',
    },
    emojiTrail: {
      fontSize: 24,
      lineHeight: 26,
    },
    quoteText: {
      fontSize: 14,
      fontWeight: '600',
      color: quoteColor,
      lineHeight: 22,
      fontStyle: 'italic',
      textAlign: 'center',
    },
  });
}

export default function MotivationQuoteBrowser({ totalToday, remainingToday }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const quotes = useMemo(
    () => getMotivationQuotesForStats({ total: totalToday, remaining: remainingToday }),
    [totalToday, remainingToday],
  );

  const quotesLenRef = useRef(quotes.length);
  quotesLenRef.current = quotes.length;

  const segmentKey = `${totalToday}-${remainingToday}`;

  const [index, setIndex] = useState(0);

  /** İlk açılış, havuz veya liste durumu değişince rastgele söz */
  useLayoutEffect(() => {
    setIndex(randomQuoteIndex(quotes.length));
  }, [segmentKey, quotes.length]);

  /** Uygulama her öne geldiğinde (aynı gün içinde de) başka bir söz — mümkünse öncekinden farklı */
  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (!prev.match(/inactive|background/) || next !== 'active') return;
      const len = quotesLenRef.current;
      setIndex((p) => randomQuoteIndex(len, len > 2 ? p : undefined));
    });
    return () => sub.remove();
  }, []);

  const goPrev = () => {
    setIndex((i) => (i - 1 + quotes.length) % quotes.length);
  };

  const goNext = () => {
    setIndex((i) => (i + 1) % quotes.length);
  };

  const safeIdx = quotes.length ? index % quotes.length : 0;
  const text = quotes[safeIdx] ?? '';

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Bugünün motivasyonu</Text>

      <View style={styles.navRow}>
        <Pressable
          style={styles.navArrow}
          onPress={goPrev}
          accessibilityRole="button"
          accessibilityLabel="Önceki motivasyon sözü"
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </Pressable>

        <View style={styles.quoteCenter}>
          <Text style={styles.quoteWrap}>
            <Text style={styles.quoteText}>{text}</Text>
            <Text style={styles.emojiTrail} accessibilityElementsHidden={true}>
              {'\u00A0'}
              {MOTIVATION_QUOTE_EMOJI}
            </Text>
          </Text>
        </View>

        <Pressable
          style={styles.navArrow}
          onPress={goNext}
          accessibilityRole="button"
          accessibilityLabel="Sonraki motivasyon sözü"
        >
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}
