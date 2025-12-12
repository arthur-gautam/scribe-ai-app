import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types
export interface Session {
  id: string;
  user_id: string;
  title: string;
  session_type: 'patient_intake' | 'follow_up' | 'team_standup' | 'consultation';
  goal: string;
  status: 'draft' | 'live' | 'processing' | 'processed';
  transcript: string;
  summary: {
    key_findings: string[];
    action_items: { id: string; text: string; completed: boolean }[];
  } | null;
  duration: number;
  created_at: string;
}

export default supabase;
