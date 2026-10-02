import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PrimaryButton from '../components/common/PrimaryButton';
import TextLink from '../components/common/TextLink';
import { TERMS_URL } from '../constants/legalUrls';
import { useSupabaseSession } from '../context/SupabaseContext';
import { useTheme } from '../context/ThemeContext';
import { openExternalUrl } from '../utils/openExternalUrl';
import { normalizeUsername, validateUsername } from '../utils/authUsername';

function createStyles(colors, isDark) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 24,
    },
    hero: {
      alignItems: 'center',
      gap: 12,
      marginBottom: 28,
    },
    logo: {
      width: 88,
      height: 88,
      borderRadius: 22,
    },
    brand: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.6,
    },
    tagline: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      maxWidth: 320,
    },
    form: {
      gap: 14,
    },
    field: {
      gap: 6,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.35,
      textTransform: 'uppercase',
    },
    input: {
      minHeight: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    termsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginTop: 4,
    },
    checkbox: {
      width: 26,
      height: 26,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      marginTop: 2,
    },
    checkboxOn: {
      borderColor: colors.primary,
      backgroundColor: isDark ? colors.primaryLight : colors.primary,
    },
    termsText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 20,
    },
    termsLink: {
      color: colors.primary,
      fontWeight: '700',
    },
    footer: {
      alignItems: 'center',
      marginTop: 24,
      paddingTop: 8,
    },
    backLink: {
      marginTop: 12,
    },
  });
}

function mapAuthError(t, error) {
  const msg = String(error?.message ?? '').toLowerCase();
  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return t('auth.errorInvalidLogin');
  }
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return t('auth.errorUsernameTaken');
  }
  return error?.message || t('auth.errorGeneric');
}

export default function AuthWelcomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { signInWithUsername, signUpWithUsername } = useSupabaseSession();

  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  const topPad = Math.max(insets.top + 36, 56);
  const bottomPad = Math.max(insets.bottom + 24, 32);

  const onLogin = async () => {
    const u = normalizeUsername(username);
    const pwd = String(password ?? '');
    const userErr = validateUsername(u);
    if (userErr) {
      Alert.alert(t('auth.titleLogin'), t(`auth.errorUsername_${userErr}`));
      return;
    }
    if (!pwd) {
      Alert.alert(t('auth.titleLogin'), t('auth.errorPasswordRequired'));
      return;
    }
    setBusy(true);
    try {
      await signInWithUsername(u, pwd);
    } catch (e) {
      Alert.alert(t('auth.titleLogin'), mapAuthError(t, e));
    } finally {
      setBusy(false);
    }
  };

  const onRegister = async () => {
    const u = normalizeUsername(username);
    const pwd = String(password ?? '');
    const confirm = String(confirmPassword ?? '');
    const userErr = validateUsername(u);
    if (userErr) {
      Alert.alert(t('auth.titleRegister'), t(`auth.errorUsername_${userErr}`));
      return;
    }
    if (pwd.length < 6) {
      Alert.alert(t('auth.titleRegister'), t('auth.errorPasswordShort'));
      return;
    }
    if (pwd !== confirm) {
      Alert.alert(t('auth.titleRegister'), t('auth.errorPasswordMismatch'));
      return;
    }
    if (!termsAccepted) {
      Alert.alert(t('auth.titleRegister'), t('auth.errorTermsRequired'));
      return;
    }
    setBusy(true);
    try {
      const { needsEmailConfirmation } = await signUpWithUsername(u, pwd);
      if (needsEmailConfirmation) {
        Alert.alert(t('auth.confirmTitle'), t('auth.confirmBody'));
      }
      setPassword('');
      setConfirmPassword('');
      setTermsAccepted(false);
      setMode('login');
    } catch (e) {
      Alert.alert(t('auth.titleRegister'), mapAuthError(t, e));
    } finally {
      setBusy(false);
    }
  };

  const switchToRegister = () => {
    setMode('register');
    setPassword('');
    setConfirmPassword('');
    setTermsAccepted(false);
  };

  const switchToLogin = () => {
    setMode('login');
    setConfirmPassword('');
    setTermsAccepted(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: bottomPad }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} accessibilityLabel="Planly" />
          <Text style={styles.brand}>Planly</Text>
          <Text style={styles.tagline}>
            {mode === 'login' ? t('auth.subtitleLogin') : t('auth.subtitleRegister')}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>{t('auth.usernameLabel')}</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              placeholder={t('auth.usernamePlaceholder')}
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('auth.passwordLabel')}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType={mode === 'register' ? 'newPassword' : 'password'}
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {mode === 'register' ? (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>{t('auth.confirmPasswordLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="newPassword"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <Pressable
                style={styles.termsRow}
                onPress={() => setTermsAccepted((v) => !v)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: termsAccepted }}
              >
                <View style={[styles.checkbox, termsAccepted && styles.checkboxOn]}>
                  {termsAccepted ? (
                    <Ionicons name="checkmark" size={16} color={isDark ? colors.primary : colors.onPrimary} />
                  ) : null}
                </View>
                <Text style={styles.termsText}>
                  {t('auth.termsPrefix')}{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => openExternalUrl(TERMS_URL)}
                    suppressHighlighting
                  >
                    {t('auth.termsLink')}
                  </Text>
                </Text>
              </Pressable>

              <PrimaryButton
                title={busy ? t('common.processing') : t('auth.createAccountBtn')}
                onPress={onRegister}
                disabled={busy}
              />
              <View style={styles.backLink}>
                <TextLink title={t('auth.backToLogin')} onPress={switchToLogin} />
              </View>
            </>
          ) : (
            <>
              <PrimaryButton
                title={busy ? t('common.processing') : t('auth.loginBtn')}
                onPress={onLogin}
                disabled={busy}
              />
              <View style={styles.footer}>
                <TextLink title={t('auth.createAccountLink')} onPress={switchToRegister} />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
