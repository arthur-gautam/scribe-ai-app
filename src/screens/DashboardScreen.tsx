import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors, spacing, borderRadius, shadows } from '../theme';

// ============================================
// TYPES
// ============================================
type SessionStatus = 'processed' | 'processing' | 'draft';
type SessionType = 'patient_intake' | 'follow_up' | 'team_standup' | 'consultation';

interface Session {
  id: string;
  type: SessionType;
  title: string;
  name: string;
  date: string;
  duration: string;
  status: SessionStatus;
  progress: number;
}

// ============================================
// ICONS
// ============================================
const SearchIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={colors.textMuted} strokeWidth="2" />
    <Path d="M20 20L16.5 16.5" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const TypeIcon = ({ type }: { type: SessionType }) => {
  const iconProps = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none" };
  const strokeProps = { stroke: colors.primary, strokeWidth: "2", strokeLinecap: "round" as const };
  
  switch (type) {
    case 'patient_intake':
      return <Svg {...iconProps}><Rect x="4" y="4" width="16" height="16" rx="2" {...strokeProps} /><Path d="M9 12h6M12 9v6" {...strokeProps} /></Svg>;
    case 'follow_up':
      return <Svg {...iconProps}><Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" {...strokeProps} /></Svg>;
    case 'team_standup':
      return <Svg {...iconProps}><Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" {...strokeProps} /><Circle cx="9" cy="7" r="4" {...strokeProps} /><Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" {...strokeProps} /></Svg>;
    case 'consultation':
      return <Svg {...iconProps}><Path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" {...strokeProps} /><Path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" {...strokeProps} /></Svg>;
  }
};

const PlusIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const TabIcon = ({ name, active }: { name: string; active: boolean }) => {
  const color = active ? colors.primary : colors.textMuted;
  const icons: Record<string, JSX.Element> = {
    sessions: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" /><Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" /><Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" /><Rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" /></Svg>,
    insights: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" /></Svg>,
    settings: <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" /><Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="2" /></Svg>,
  };
  return icons[name] || null;
};

// ============================================
// STATUS BADGE
// ============================================
const StatusBadge = ({ status }: { status: SessionStatus }) => {
  const config = {
    processed: { bg: colors.successLight, text: colors.success, label: 'Processed' },
    processing: { bg: colors.warningLight, text: colors.warning, label: 'Processing' },
    draft: { bg: colors.border, text: colors.textSecondary, label: 'Draft' },
  };
  const { bg, text, label } = config[status];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

// ============================================
// SESSION CARD
// ============================================
const SessionCard = ({ session, index, onPress }: { session: Session; index: number; onPress: () => void }) => {
  const typeLabels: Record<SessionType, string> = {
    patient_intake: 'PATIENT INTAKE',
    follow_up: 'FOLLOW-UP CALL',
    team_standup: 'TEAM STANDUP',
    consultation: 'CONSULTATION',
  };
  const progressColors = {
    processed: colors.success,
    processing: colors.warning,
    draft: colors.textMuted,
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(400)}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTypeRow}>
            <TypeIcon type={session.type} />
            <Text style={styles.cardType}>{typeLabels[session.type]}</Text>
          </View>
          <StatusBadge status={session.status} />
        </View>

        <Text style={styles.cardName}>{session.name}</Text>

        <View style={styles.cardMeta}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="4" width="18" height="18" rx="2" stroke={colors.textMuted} strokeWidth="2" />
            <Path d="M16 2v4M8 2v4M3 10h18" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={styles.cardMetaText}>{session.date}</Text>
          <Text style={styles.cardMetaDot}>•</Text>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={colors.textMuted} strokeWidth="2" />
            <Path d="M12 6v6l4 2" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={styles.cardMetaText}>{session.duration}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${session.progress}%`, backgroundColor: progressColors[session.status] }]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================
// DASHBOARD SCREEN
// ============================================
interface Props {
  onNewSession?: () => void;
  onSessionPress?: (sessionId: string) => void;
  onSettingsPress?: () => void;
  sessions?: Session[];
  userAvatar?: string;
}

export default function DashboardScreen({ onNewSession, onSessionPress, onSettingsPress, sessions: propSessions, userAvatar }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('sessions');

  // Mock data if no sessions provided
  const sessions: Session[] = propSessions || [
    { id: '1', type: 'patient_intake', title: 'Patient Intake', name: 'John Doe', date: 'Dec 10', duration: '12min', status: 'processed', progress: 100 },
    { id: '2', type: 'follow_up', title: 'Follow-up Call', name: 'Sarah Chen', date: 'Dec 9', duration: '8min', status: 'processing', progress: 67 },
    { id: '3', type: 'team_standup', title: 'Team Standup', name: 'Weekly Sync', date: 'Dec 8', duration: '23min', status: 'processed', progress: 100 },
    { id: '4', type: 'consultation', title: 'Consultation', name: 'Dr. Emily Watts', date: 'Dec 7', duration: '--:--', status: 'draft', progress: 10 },
  ];

  const filteredSessions = sessions.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Sessions</Text>
        <TouchableOpacity>
          <Image
            source={{ uri: userAvatar || 'https://i.pravatar.cc/100?img=32' }}
            style={styles.avatar}
          />
          <View style={styles.onlineIndicator} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}><SearchIcon /></View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search sessions..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sessions List */}
      <FlatList
        data={filteredSessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SessionCard
            session={item}
            index={index}
            onPress={() => onSessionPress?.(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to start your first recording</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onNewSession} activeOpacity={0.8}>
        <PlusIcon />
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {(['sessions', 'insights', 'settings'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => {
              setActiveTab(tab);
              if (tab === 'settings') onSettingsPress?.();
            }}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: colors.surface },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    ...shadows.soft,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: 180 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardType: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, color: colors.textSecondary, textTransform: 'uppercase' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  cardMetaText: { fontSize: 13, color: colors.textSecondary },
  cardMetaDot: { color: colors.textMuted },
  progressBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  emptyState: { alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  tabItem: { alignItems: 'center', gap: 4 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: colors.textMuted },
  tabLabelActive: { color: colors.primary },
});
