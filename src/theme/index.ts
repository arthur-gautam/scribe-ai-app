// ============================================
// SCRIBEAI - UNIFIED THEME SYSTEM
// ============================================

export const colors = {
  // Primary Brand Colors
  primary: '#1E3A5F',
  primaryLight: '#2A4A6F',
  secondary: '#2AA696',
  secondaryLight: '#4ECDC4',
  
  // Backgrounds
  background: '#F3F4F6',
  surface: '#FFFFFF',
  
  // Text
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
  
  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  
  // UI Elements
  border: '#E2E8F0',
  inputBg: '#F7F8FA',
  divider: '#E5E7EB',
  
  // Special
  live: '#EF4444',
  insight: '#ECFDF5',
  insightBorder: '#D1FAE5',
  insightText: '#065F46',
  waveform: '#3B82F6',
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const borderRadius = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999,
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};

export default { colors, spacing, borderRadius, shadows };
