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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, spacing, borderRadius, shadows } from '../theme';

// ============================================
// ICONS
// ============================================
const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EditIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const TargetIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={colors.secondary} strokeWidth="2" />
    <Circle cx="12" cy="12" r="6" stroke={colors.secondary} strokeWidth="2" />
    <Circle cx="12" cy="12" r="2" fill={colors.secondary} />
  </Svg>
);

const LightbulbIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.71.71M2 12h1M4.22 19.78l.71-.71M12 21v1M19.78 19.78l-.71-.71M22 12h-1M19.78 4.22l-.71.71" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Path d="M9 18a7 7 0 116 0" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const MicIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
    <Path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// ============================================
// NEW SESSION SCREEN
// ============================================
interface Props {
  onBack?: () => void;
  onStartRecording?: (title: string, goal: string) => void;
}

export default function NewSessionScreen({ onBack, onStartRecording }: Props) {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [titleFocused, setTitleFocused] = useState(false);
  const [goalFocused, setGoalFocused] = useState(false);

  // Button animation
  const buttonScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  // Animate glow when both fields have content
  React.useEffect(() => {
    if (title && goal) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0);
    }
  }, [title, goal]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleStartRecording = () => {
    if (title.trim() && goal.trim()) {
      onStartRecording?.(title.trim(), goal.trim());
    }
  };

  const isValid = title.trim() && goal.trim();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Session</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Session Title */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <View style={styles.labelRow}>
              <EditIcon />
              <Text style={styles.label}>Session Title</Text>
            </View>
            <TextInput
              style={[styles.titleInput, titleFocused && styles.inputFocused]}
              placeholder="e.g. Patient Follow-up"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
            />
          </Animated.View>

          {/* Session Goal */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.goalSection}>
            <View style={styles.labelRow}>
              <TargetIcon />
              <Text style={styles.label}>Session Goal</Text>
            </View>
            <View style={[styles.goalContainer, goalFocused && styles.inputFocused]}>
              <TextInput
                style={styles.goalInput}
                placeholder='What should AI focus on? e.g., "Diagnose knee pain..."'
                placeholderTextColor={colors.textMuted}
                value={goal}
                onChangeText={setGoal}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                onFocus={() => setGoalFocused(true)}
                onBlur={() => setGoalFocused(false)}
              />
              <View style={styles.helperContainer}>
                <LightbulbIcon />
                <Text style={styles.helperText}>
                  This helps AI provide smarter suggestions based on your specific context.
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Divider */}
          <View style={styles.divider} />
        </View>

        {/* Start Recording Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.buttonContainer}>
          {/* Glow effect */}
          <Animated.View style={[styles.buttonGlow, glowStyle]} />
          
          <Animated.View style={buttonStyle}>
            <TouchableOpacity
              onPress={handleStartRecording}
              onPressIn={() => (buttonScale.value = withSpring(0.96))}
              onPressOut={() => (buttonScale.value = withSpring(1))}
              disabled={!isValid}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={isValid ? ['#2AA696', '#10B981'] : ['#94A3B8', '#94A3B8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButton}
              >
                <MicIcon />
                <Text style={styles.startButtonText}>Start Recording</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: { padding: spacing.sm },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  headerPlaceholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  titleInput: {
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  inputFocused: { borderColor: colors.secondary, backgroundColor: colors.surface },
  goalSection: { marginBottom: spacing.lg },
  goalContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  goalInput: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 140,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  helperText: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.xl,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  buttonGlow: {
    position: 'absolute',
    top: -10,
    left: spacing.lg,
    right: spacing.lg,
    bottom: -10,
    borderRadius: borderRadius.lg + 10,
    backgroundColor: colors.secondary,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.medium,
  },
  startButtonText: { fontSize: 18, fontWeight: '600', color: colors.textWhite },
});
