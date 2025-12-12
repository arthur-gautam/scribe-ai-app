import { NativeStackScreenProps } from '@react-navigation/native-stack';

// ============================================
// ROOT STACK PARAMS
// ============================================
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

// ============================================
// MAIN STACK PARAMS (Authenticated)
// ============================================
export type MainStackParamList = {
  Dashboard: undefined;
  NewSession: undefined;
  LiveRecording: {
    sessionId: string;
    title: string;
    goal: string;
  };
  Processing: {
    sessionId: string;
  };
  Summary: {
    sessionId: string;
  };
  Settings: undefined;
};

// ============================================
// SCREEN PROPS
// ============================================
export type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;
export type AuthScreenProps = NativeStackScreenProps<RootStackParamList, 'Auth'>;
export type DashboardScreenProps = NativeStackScreenProps<MainStackParamList, 'Dashboard'>;
export type NewSessionScreenProps = NativeStackScreenProps<MainStackParamList, 'NewSession'>;
export type LiveRecordingScreenProps = NativeStackScreenProps<MainStackParamList, 'LiveRecording'>;
export type ProcessingScreenProps = NativeStackScreenProps<MainStackParamList, 'Processing'>;
export type SummaryScreenProps = NativeStackScreenProps<MainStackParamList, 'Summary'>;
export type SettingsScreenProps = NativeStackScreenProps<MainStackParamList, 'Settings'>;
