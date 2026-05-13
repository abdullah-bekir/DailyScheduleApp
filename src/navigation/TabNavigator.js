import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TabBarIcon from '../components/common/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import TasksStackNavigator from './TasksStackNavigator';
import { useTheme } from '../context/ThemeContext';
import { tabBarLift } from '../theme/shadows';

const Tab = createBottomTabNavigator();

const tabConfig = {
  AnaSayfa: {
    component: HomeScreen,
    icon: { outline: 'home-outline', filled: 'home' },
    label: 'Ana Sayfa',
    navLabel: 'Anasayfa',
  },
  Gorevler: {
    component: TasksStackNavigator,
    icon: { outline: 'list-outline', filled: 'list' },
    label: 'Görevler',
    navLabel: 'Görevler',
  },
  Istatistikler: {
    component: StatsScreen,
    icon: { outline: 'bar-chart-outline', filled: 'bar-chart' },
    label: 'İstatistikler',
    navLabel: 'İstatistikler',
  },
  Ayarlar: {
    component: SettingsScreen,
    icon: { outline: 'settings-outline', filled: 'settings' },
    label: 'Ayarlar',
    navLabel: 'Ayarlar',
  },
};

export default function TabNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const tabBarBottomInset = 0;

  const tabScreenOptions = useMemo(
    () =>
      ({ route }) => ({
        headerShown: false,
        sceneContainerStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#B0B0B6',
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: -1,
          height: 62 + tabBarBottomInset,
          paddingBottom: tabBarBottomInset,
          paddingTop: 5,
          borderTopWidth: 0,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#ECECEE',
          ...tabBarLift(colors),
        },
        tabBarItemStyle: {
          paddingTop: 0,
        },
        tabBarIcon: ({ focused }) => (
          <TabBarIcon {...tabConfig[route.name].icon} focused={focused} label={tabConfig[route.name].navLabel} />
        ),
      }),
    [colors, tabBarBottomInset],
  );

  return (
    <Tab.Navigator detachInactiveScreens={false} screenOptions={tabScreenOptions}>
      {Object.entries(tabConfig).map(([name, config]) => (
        <Tab.Screen key={name} name={name} component={config.component} options={{ title: config.label }} />
      ))}
    </Tab.Navigator>
  );
}
