import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

/** Onaylı Planly ikonu — `assets/brand-logo-source.png` (mağaza ikonu ile aynı kaynak). */
export default function AppBrandMark({ size = 40, accessibilityLabel = 'Planly' }) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width: size,
          height: size,
        },
        image: {
          width: size,
          height: size,
          borderRadius: size * 0.22,
        },
      }),
    [size],
  );

  return (
    <View style={styles.wrap}>
      <Image
        source={require('../../../assets/brand-logo-source.png')}
        style={styles.image}
        resizeMode="cover"
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}
