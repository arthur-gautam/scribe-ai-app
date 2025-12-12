import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { colors, spacing, borderRadius, shadows } from '../theme';

// ============================================
// ICON COMPONENTS
// ============================================
const Logo = ({ size = 48 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M15 55 L15 42" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" />
    <Path d="M22 55 L22 35" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" />
    <Path
      d="M35 25 C48 25, 58 32, 58 42 C58 52, 48 55, 42 55 C50 55, 62 60, 62 70 C62 80, 50 85, 38 85"
      stroke={colors.primary}
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <Path d="M78 55 L78 42" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" />
    <Path d="M85 55 L85 35" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" />
    <Path d="M10 58 L30 58 L34 50 L40 66 L46 54 L52 58 L90 58" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" fill="none" />
  </Svg>
);

const MailIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="4" width="20" height="16" rx="2" stroke={colors.textMuted} strokeWidth="1.5" />
    <Path d="M22 6L12 13L2 6" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const LockIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="11" rx="2" stroke={colors.textMuted} strokeWidth="1.5" />
    <Path d="M7 11V7a5 5 0 0110 0v4" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    {visible ? (
      <>
        <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={colors.textMuted} strokeWidth="1.5" />
        <Circle cx="12" cy="12" r="3" stroke={colors.textMuted} strokeWidth="1.5" />
      </>
    ) : (
      <>
        <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" />
        <Path d="M1 1l22 22" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" />
      </>
    )}
  </Svg>
);

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </Svg>
);

const ArrowIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14M12 5l7 7-7 7" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ============================================
// AUTH SCREEN COMPONENT
// ============================================
interface Props {
  onLogin?: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onGoogleLogin?: () => Promise<void>;
  onCreateAccount?: () => void;
}

export default function AuthScreen({ onLogin, onGoogleLogin, onCreateAccount }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const buttonScale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale.value }] }));

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      if (onLogin) {
        const result = await onLogin(email, password);
        if (!result.success) Alert.alert('Error', result.error || 'Login failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.card}>
            {/* Logo */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.logoContainer}>
              <Logo size={56} />
            </Animated.View>

            {/* Header */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.headerContainer}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue to your dashboard</Text>
            </Animated.View>

            {/* Email Input */}
            <Animated.View entering={FadeInDown.delay(300).duration(500)} style={[styles.inputContainer, emailFocused && styles.inputFocused]}>
              <View style={styles.inputIcon}><MailIcon /></View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </Animated.View>

            {/* Password Input */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)} style={[styles.inputContainer, passwordFocused && styles.inputFocused]}>
              <View style={styles.inputIcon}><LockIcon /></View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <EyeIcon visible={showPassword} />
              </TouchableOpacity>
            </Animated.View>

            {/* Sign In Button */}
            <Animated.View entering={FadeInDown.delay(500).duration(500)} style={[styles.buttonWrapper, buttonStyle]}>
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSignIn}
                onPressIn={() => (buttonScale.value = withSpring(0.97))}
                onPressOut={() => (buttonScale.value = withSpring(1))}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.signInText}>Sign In</Text>}
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </Animated.View>

            {/* Google Button */}
            <Animated.View entering={FadeInDown.delay(700).duration(500)}>
              <TouchableOpacity style={styles.googleButton} onPress={onGoogleLogin}>
                <GoogleIcon />
                <Text style={styles.googleText}>Continue with Google</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Create Account */}
            <Animated.View entering={FadeInDown.delay(800).duration(500)} style={styles.createContainer}>
              <TouchableOpacity style={styles.createButton} onPress={onCreateAccount}>
                <Text style={styles.createText}>Create an account</Text>
                <ArrowIcon />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    paddingHorizontal: 24,
    paddingVertical: 40,
    ...shadows.medium,
  },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputFocused: { borderColor: colors.secondary, backgroundColor: colors.surface },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: colors.textPrimary },
  eyeButton: { padding: 4 },
  buttonWrapper: { marginTop: 8, marginBottom: 24 },
  signInButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.divider },
  dividerText: { paddingHorizontal: 16, fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 12,
  },
  googleText: { fontSize: 16, fontWeight: '500', color: colors.textPrimary },
  createContainer: { alignItems: 'center', marginTop: 24 },
  createButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  createText: { fontSize: 15, color: colors.secondary, fontWeight: '500' },
});
