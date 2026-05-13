import { Platform } from 'react-native';

/** Kart gölgeleri — palette içindeki shadow* ve elevation* değerlerini kullanır */
export function cardShadow(colors, size = 'lg') {
  const lg = {
    shadowColor: colors.shadowColor,
    shadowOpacity: Platform.OS === 'android' ? 0 : colors.shadowOpacityCard,
    shadowRadius: colors.shadowRadiusCard,
    shadowOffset: { width: 0, height: colors.shadowOffsetYCard },
    elevation: colors.elevationCard,
  };
  const sm = {
    shadowColor: colors.shadowColor,
    shadowOpacity: Platform.OS === 'android' ? 0 : colors.shadowOpacitySm,
    shadowRadius: colors.shadowRadiusSm,
    shadowOffset: { width: 0, height: colors.shadowOffsetYSm },
    elevation: colors.elevationSm,
  };
  return size === 'lg' ? lg : sm;
}

/** Üst gölge — alt sekme çubuğu (hafif; üst çizgi TabNavigator’da) */
export function tabBarLift(colors) {
  return {
    shadowColor: colors.shadowColor,
    shadowOpacity: Platform.OS === 'android' ? 0 : Math.min(colors.shadowOpacitySm + 0.025, 0.09),
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  };
}
