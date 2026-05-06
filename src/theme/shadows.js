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

/** Üst gölge — alt sekme çubuğu için */
export function tabBarLift(colors) {
  return {
    shadowColor: colors.shadowColor,
    shadowOpacity: Platform.OS === 'android' ? 0 : Math.min(colors.shadowOpacityCard + 0.03, 0.14),
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -10 },
    elevation: 20,
  };
}
