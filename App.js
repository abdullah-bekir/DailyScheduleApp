import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppOpenAdController from './src/components/ads/AppOpenAdController';
import RemoteProfileSync from './src/components/sync/RemoteProfileSync';
import { LocaleProvider } from './src/context/LocaleContext';
import { SupabaseProvider } from './src/context/SupabaseContext';
import { TasksProvider } from './src/context/TasksContext';
import { registerAllAdFormatsInOrder } from './src/lib/ads/registerAdFormats';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

function ThemedShell() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  useEffect(() => {
    if (Constants.appOwnership === 'expo') return;
    try {
      const mobileAds = require('react-native-google-mobile-ads').default;
      mobileAds().initialize().catch(() => {});
      registerAllAdFormatsInOrder();
    } catch {
      // Native ads modülü henüz hazır değilse uygulamayı düşürme.
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SupabaseProvider>
          <LocaleProvider>
            <ThemeProvider>
              <SubscriptionProvider>
                <TasksProvider>
                  <AppOpenAdController />
                  <RemoteProfileSync />
                  <ThemedShell />
                </TasksProvider>
              </SubscriptionProvider>
            </ThemeProvider>
          </LocaleProvider>
        </SupabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
