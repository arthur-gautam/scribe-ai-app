import { useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// ============================================
// AUTH STATE INTERFACE
// ============================================
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

// ============================================
// USE AUTH HOOK
// ============================================
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });

  // Google OAuth Setup
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  // Listen to auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      }));
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));

        // Create user profile on sign up
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureUserProfile(session.user.id, session.user.email!, session.user.user_metadata?.full_name);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      signInWithGoogle(id_token);
    }
  }, [response]);

  // ============================================
  // AUTH METHODS
  // ============================================

  // Email/Password Sign In
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        error: getErrorMessage(error.message) 
      };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Email/Password Sign Up
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        error: getErrorMessage(error.message) 
      };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Google Sign In with ID Token
  const signInWithGoogle = useCallback(async (idToken: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        error: getErrorMessage(error.message) 
      };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Trigger Google OAuth flow
  const loginWithGoogle = useCallback(async () => {
    try {
      await promptAsync();
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [promptAsync]);

  // Sign Out
  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (updates: { full_name?: string; avatar_url?: string }) => {
    if (!state.user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [state.user]);

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    initialized: state.initialized,
    isAuthenticated: !!state.session,
    signIn,
    signUp,
    loginWithGoogle,
    signOut,
    updateProfile,
    googleAuthReady: !!request,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================
async function ensureUserProfile(userId: string, email: string, fullName?: string) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (!existing) {
    await supabase.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName || email.split('@')[0],
      settings: {
        auto_email_summaries: true,
        default_session_length: 30,
        ai_suggestion_frequency: 30,
      },
    });
  }
}

function getErrorMessage(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please verify your email address',
    'User already registered': 'An account with this email already exists',
    'Password should be at least 6 characters': 'Password must be at least 6 characters',
    'Email rate limit exceeded': 'Too many attempts. Please try again later.',
  };
  return errorMap[message] || message;
}

export default useAuth;
