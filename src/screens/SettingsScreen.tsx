import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Switch,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors, spacing, borderRadius, shadows } from '../theme';

// ============================================
// ICONS
// ============================================
const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ArrowIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14M12 5l7 7-7 7" stroke="#2D9CDB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MailIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="4" width="20" height="16" rx="2" stroke={colors.textSecondary} strokeWidth="2" />
    <Path d="M22 6l-10 7L2 6" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const TimerIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="13" r="8" stroke={colors.textSecondary} strokeWidth="2" />
    <Path d="M12 9v4l2 2" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
    <Path d="M9 2h6" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const BrainIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 002 2h4a2 2 0 002-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7z" stroke={colors.textSecondary} strokeWidth="2" />
    <Path d="M9 21h6" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const HelpIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={colors.textSecondary} strokeWidth="2" />
    <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="17" r="0.5" fill={colors.textSecondary} stroke={colors.textSecondary} />
  </Svg>
);

const AlertIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={colors.textSecondary} strokeWidth="2" />
    <Path d="M12 9v4M12 17h.01" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const LockIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="11" rx="2" stroke={colors.textSecondary} strokeWidth="2" />
    <Path d="M7 11V7a5 5 0 0110 0v4" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const LogoutIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={colors.danger} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 17l5-5-5-5M21 12H9" stroke={colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TabIcon = ({ name, active }: { name: string; active: boolean }) => {
  const color = active ? colors.secondary : colors.textMuted;
  const icons: Record<string, JSX.Element> = {
    home: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth="2" /><Path d="M9 22V12h6v10" stroke={color} strokeWidth="2" /></Svg>,
    record: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Rect x="4" y="4" width="4" height="16" rx="1" stroke={color} strokeWidth="2" /><Rect x="10" y="7" width="4" height="10" rx="1" stroke={color} strokeWidth="2" /><Rect x="16" y="4" width="4" height="16" rx="1" stroke={color} strokeWidth="2" /></Svg>,
    settings: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" /><Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="2" /></Svg>,
  };
  return icons[name] || null;
};

// ============================================
// SETTING ROW COMPONENT
// ============================================
interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  isLast?: boolean;
}

const SettingRow = ({ icon, label, value, onPress, toggle, toggleValue, onToggle, isLast }: SettingRowProps) => (
  <TouchableOpacity
    style={[styles.settingRow, !isLast && styles.settingRowBorder]}
    onPress={onPress}
    disabled={toggle}
    activeOpacity={0.7}
  >
    <View style={styles.settingLeft}>
      {icon}
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
    {toggle ? (
      <Switch
        value={toggleValue}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.success }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.border}
      />
    ) : (
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <ChevronIcon />
      </View>
    )}
  </TouchableOpacity>
);

// ============================================
// SETTINGS SCREEN
// ============================================
interface Props {
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  settings?: {
    autoEmail: boolean;
    sessionLength: number;
    aiFrequency: number;
  };
  onBack?: () => void;
  onEditProfile?: () => void;
  onSignOut?: () => void;
  onUpdateSettings?: (key: string, value: any) => void;
}

export default function SettingsScreen({
  user = { name: 'Dr. Sarah Mitchell', email: 'dr.sarahmitchell.com' },
  settings: initialSettings = { autoEmail: true, sessionLength: 30, aiFrequency: 30 },
  onBack,
  onEditProfile,
  onSignOut,
  onUpdateSettings,
}: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState('settings');

  const handleToggle = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    onUpdateSettings?.(key, value);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: onSignOut },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <Image
              source={{ uri: user.avatarUrl || 'https://i.pravatar.cc/100?img=32' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
            <Text style={styles.editText}>Edit</Text>
            <ArrowIcon />
          </TouchableOpacity>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.section}>
            <SettingRow
              icon={<MailIcon />}
              label="Auto-email summaries"
              toggle
              toggleValue={settings.autoEmail}
              onToggle={(v) => handleToggle('autoEmail', v)}
            />
            <SettingRow
              icon={<TimerIcon />}
              label="Default session length"
              value={`${settings.sessionLength} min`}
              onPress={() => {}}
            />
            <SettingRow
              icon={<BrainIcon />}
              label="AI suggestion frequency"
              value={`${settings.aiFrequency} sec`}
              onPress={() => {}}
              isLast
            />
          </View>
        </Animated.View>

        {/* Support Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.section}>
            <SettingRow icon={<HelpIcon />} label="Help Center" onPress={() => {}} />
            <SettingRow icon={<AlertIcon />} label="Report an Issue" onPress={() => {}} />
            <SettingRow icon={<LockIcon />} label="Privacy Policy" onPress={() => {}} isLast />
          </View>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.signOutContainer}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
            <LogoutIcon />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Version 1.0.0 (Build 42)</Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {(['home', 'record', 'settings'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab)}
          >
            <TabIcon name={tab} active={activeTab === tab} />
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  backButton: { padding: spacing.sm },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  headerPlaceholder: { width: 40 },
  content: { flex: 1 },
  contentContainer: { padding: spacing.md, paddingBottom: 120 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: colors.border },
  profileName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  profileEmail: { fontSize: 13, color: colors.textSecondary },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { fontSize: 14, fontWeight: '500', color: '#2D9CDB' },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.soft,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  settingLabel: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  settingValue: { fontSize: 14, color: colors.textSecondary },
  signOutContainer: { marginTop: spacing.md, alignItems: 'center' },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.danger,
    gap: spacing.sm,
  },
  signOutText: { fontSize: 16, fontWeight: '600', color: colors.danger },
  versionText: { fontSize: 12, color: colors.textMuted, marginTop: spacing.md },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  tabItem: { alignItems: 'center', gap: 4 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: colors.textMuted },
  tabLabelActive: { color: colors.secondary },
});
