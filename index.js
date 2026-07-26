import 'react-native-gesture-handler';
import './src/setupNativeNavigation';
import { registerRootComponent } from 'expo';

import App from './App';

/** Planly giriş noktası — Expo Go ve native build için App kaydı */
registerRootComponent(App);
