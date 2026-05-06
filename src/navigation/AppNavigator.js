import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
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
  },
  Gorevler: {
    component: TasksStackNavigator,
    icon: { outline: 'list-outline', filled: 'list' },
    label: 'Görevler',
  },
  Istatistikler: {
    component: StatsScreen,
    icon: { outline: 'bar-chart-outline', filled: 'bar-chart' },
    label: 'İstatistikler',
  },
  Ayarlar: {
    component: SettingsScreen,
    icon: { outline: 'settings-outline', filled: 'settings' },
    label: 'Ayarlar',
  },
};

export default function AppNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.border,
        notification: colors.primary,
      },
    }),
    [colors],
  );

  const tabBarBottomPadding = Math.max(insets.bottom, 10);

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        detachInactiveScreens={false}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            height: 56 + tabBarBottomPadding,
            paddingBottom: tabBarBottomPadding,
            paddingTop: 6,
            borderTopWidth: 0,
            backgroundColor: colors.surface,
            ...tabBarLift(colors),
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.15,
          },
          tabBarIcon: ({ focused }) => (
            <TabBarIcon {...tabConfig[route.name].icon} focused={focused} />
          ),
        })}
      >
        {Object.entries(tabConfig).map(([name, config]) => (
          <Tab.Screen
            key={name}
            name={name}
            component={config.component}
            options={{ title: config.label }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
