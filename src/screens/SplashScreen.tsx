import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import Svg, { Path, G } from 'react-native-svg';

// ============================================
// SCRIBEAI LOGO COMPONENT
// ============================================
const ScribeAILogo = ({ size = 140 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Left waveform lines */}
    <G opacity={0.8}>
      <Path d="M10 55 L10 45" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M16 55 L16 38" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M22 55 L22 42" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </G>

    {/* Main stylized S logo */}
    <Path
      d="M35 20 C50 20, 62 28, 62 40 C62 52, 50 56, 42 56 C52 56, 65 62, 65 74 C65 86, 50 92, 35 92"
      stroke="#FFFFFF"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Right waveform lines */}
    <G opacity={0.8}>
      <Path d="M78 55 L78 45" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M84 55 L84 38" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M90 55 L90 42" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </G>

    {/* Heartbeat/EKG line */}
    <Path
      d="M5 56 L28 56 L32 48 L38 64 L44 52 L50 56 L95 56"
      stroke="#4ECDC4"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

// ============================================
// SPLASH SCREEN
// ============================================
interface Props {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.8);

  useEffect(() => {
    // Logo entrance
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSequence(
      withTiming(1.05, { duration: 500, easing: Easing.out(Easing.back) }),
      withTiming(1, { duration: 300 })
    );

    // Text animations
    textOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    taglineOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));

    // Glow pulse
    glowScale.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1500 }),
          withTiming(0.9, { duration: 1500 })
        ),
        -1,
        true
      )
    );

    // Navigate after animation
    if (onFinish) {
      const timer = setTimeout(onFinish, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: 0.25,
  }));

  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <LinearGradient colors={['#1A3650', '#0D1F30']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <Animated.View style={[styles.glow, glowStyle]} />
          <Animated.View style={logoStyle}>
            <ScribeAILogo size={140} />
          </Animated.View>
        </View>
        <Animated.Text style={[styles.appName, textStyle]}>ScribeAI</Animated.Text>
      </View>

      <Animated.View style={[styles.taglineContainer, taglineStyle]}>
        <Text style={styles.tagline}>Powered by MedhaAI ™</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#4ECDC4',
  },
  appName: { fontSize: 36, fontWeight: '300', color: '#FFFFFF', letterSpacing: 3 },
  taglineContainer: { position: 'absolute', bottom: 60, width: '100%', alignItems: 'center' },
  tagline: { fontSize: 13, color: 'rgba(255, 255, 255, 0.45)', letterSpacing: 0.5 },
});
