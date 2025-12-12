import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Svg, { Path, Rect, Circle, Polyline } from 'react-native-svg';
import { colors, spacing, borderRadius, shadows } from '../theme';

// ============================================
// ICONS
// ============================================
const MoreIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="1.5" fill={colors.textSecondary} />
    <Circle cx="12" cy="12" r="1.5" fill={colors.textSecondary} />
    <Circle cx="12" cy="19" r="1.5" fill={colors.textSecondary} />
  </Svg>
);

const ClipboardIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
    <Rect x="8" y="2" width="8" height="4" rx="1" stroke={colors.textSecondary} strokeWidth="2" />
  </Svg>
);

const CheckCircleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={colors.textSecondary} strokeWidth="2" />
    <Path d="M9 12l2 2 4-4" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MailIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="4" width="20" height="16" rx="2" stroke="#FFF" strokeWidth="2" />
    <Path d="M22 6l-10 7L2 6" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const CopyIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="9" width="13" height="13" rx="2" stroke={colors.textSecondary} strokeWidth="2" />
    <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={colors.textSecondary} strokeWidth="2" />
  </Svg>
);

const PdfIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={colors.textSecondary} strokeWidth="2" />
    <Polyline points="14,2 14,8 20,8" stroke={colors.textSecondary} strokeWidth="2" />
    <Path d="M9 15h6" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// ============================================
// CHECKBOX COMPONENT
// ============================================
const Checkbox = ({ checked, onToggle }: { checked: boolean; onToggle: () => void }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.8, {}, () => {
      scale.value = withSpring(1);
    });
    onToggle();
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View style={animatedStyle}>
        {checked ? (
          <View style={styles.checkboxChecked}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17l-5-5" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        ) : (
          <View style={styles.checkboxUnchecked} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================
// SUMMARY SCREEN
// ============================================
interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Props {
  sessionId?: string;
  title?: string;
  name?: string;
  timeAgo?: string;
  keyFindings?: string[];
  actionItems?: ActionItem[];
  transcript?: string;
  onBack?: () => void;
  onEmail?: () => void;
  onCopy?: () => void;
  onPdf?: () => void;
  onToggleAction?: (id: string) => void;
}

export default function SummaryScreen({
  title = 'Patient Intake',
  name = 'John Doe',
  timeAgo = '12 min ago',
  keyFindings = [
    'Patient reports dizziness appearing consistently for the past three days.',
    'Symptoms worsen in the evenings, impacting ability to perform household tasks.',
    'No recent falls or loss of consciousness reported in the last 10 days.',
  ],
  actionItems: initialActionItems = [
    { id: '1', text: 'Order blood pressure monitoring', completed: true },
    { id: '2', text: 'Schedule follow-up appointment regarding medication adjustment', completed: false },
    { id: '3', text: 'Refer to cardiology for consultation', completed: false },
    { id: '4', text: 'Review current medication list', completed: true },
  ],
  onBack,
  onEmail,
  onCopy,
  onPdf,
  onToggleAction,
}: Props) {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');
  const [actionItems, setActionItems] = useState(initialActionItems);

  const handleToggle = (id: string) => {
    setActionItems(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
    onToggleAction?.(id);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{name} · {timeAgo}</Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <MoreIcon />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'summary' && styles.tabActive]}
            onPress={() => setActiveTab('summary')}
          >
            <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>Summary</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'transcript' && styles.tabActive]}
            onPress={() => setActiveTab('transcript')}
          >
            <Text style={[styles.tabText, activeTab === 'transcript' && styles.tabTextActive]}>Transcript</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'summary' ? (
          <>
            {/* Key Findings */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.card}>
              <View style={styles.cardHeader}>
                <ClipboardIcon />
                <Text style={styles.cardTitle}>Key Findings</Text>
              </View>
              <View style={styles.findingsList}>
                {keyFindings.map((finding, index) => (
                  <View key={index} style={styles.findingItem}>
                    <View style={styles.findingBullet} />
                    <Text style={styles.findingText}>{finding}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Action Items */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.card}>
              <View style={styles.cardHeader}>
                <CheckCircleIcon />
                <Text style={styles.cardTitle}>Action Items</Text>
              </View>
              <View style={styles.actionList}>
                {actionItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.actionItem}
                    onPress={() => handleToggle(item.id)}
                    activeOpacity={0.7}
                  >
                    <Checkbox checked={item.completed} onToggle={() => handleToggle(item.id)} />
                    <Text style={[styles.actionText, item.completed && styles.actionTextCompleted]}>
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </>
        ) : (
          <Animated.View entering={FadeIn.duration(300)} style={styles.card}>
            <Text style={styles.transcriptText}>
              [Transcript content would appear here with speaker labels and timestamps]
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.emailButton} onPress={onEmail} activeOpacity={0.8}>
          <MailIcon />
          <Text style={styles.emailText}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onCopy} activeOpacity={0.7}>
          <CopyIcon />
          <Text style={styles.iconButtonText}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onPdf} activeOpacity={0.7}>
          <PdfIcon />
          <Text style={styles.iconButtonText}>PDF</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.surface,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary },
  moreButton: { padding: spacing.sm },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.sm },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.secondary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.secondary },
  content: { flex: 1, backgroundColor: colors.background },
  contentContainer: { padding: spacing.md, paddingBottom: 120 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  findingsList: { gap: spacing.md },
  findingItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  findingBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
    marginTop: 7,
  },
  findingText: { flex: 1, fontSize: 14, lineHeight: 22, color: colors.textSecondary },
  actionList: { gap: spacing.md },
  actionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  checkboxChecked: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
  },
  actionText: { flex: 1, fontSize: 14, lineHeight: 22, color: colors.textSecondary },
  actionTextCompleted: { textDecorationLine: 'line-through', color: colors.textMuted },
  transcriptText: { fontSize: 14, lineHeight: 22, color: colors.textSecondary },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  emailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.soft,
  },
  emailText: { fontSize: 15, fontWeight: '600', color: colors.textWhite },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: 2,
  },
  iconButtonText: { fontSize: 10, fontWeight: '500', color: colors.textSecondary },
});
