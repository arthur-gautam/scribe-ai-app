import { useState, useEffect, useCallback } from 'react';
import { supabase, Session as DBSession } from '../services/supabase';
import { useAuth } from './useAuth';

// ============================================
// USE SESSIONS HOOK
// ============================================
export function useSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<DBSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all sessions for current user
  const fetchSessions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setSessions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create new session
  const createSession = useCallback(async (
    title: string,
    goal: string,
    sessionType: DBSession['session_type'] = 'patient_intake'
  ): Promise<DBSession | null> => {
    if (!user) return null;

    try {
      const newSession = {
        user_id: user.id,
        title,
        goal,
        session_type: sessionType,
        status: 'live' as const,
        transcript: '',
        summary: null,
        duration: 0,
      };

      const { data, error } = await supabase
        .from('sessions')
        .insert(newSession)
        .select()
        .single();

      if (error) throw error;
      
      // Optimistically add to local state
      setSessions(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [user]);

  // Update session
  const updateSession = useCallback(async (
    sessionId: string,
    updates: Partial<DBSession>
  ) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setSessions(prev =>
        prev.map(s => (s.id === sessionId ? data : s))
      );

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  // Update session status (for processing flow)
  const updateSessionStatus = useCallback(async (
    sessionId: string,
    status: DBSession['status']
  ) => {
    return updateSession(sessionId, { status });
  }, [updateSession]);

  // Save transcript
  const saveTranscript = useCallback(async (
    sessionId: string,
    transcript: string,
    duration: number
  ) => {
    return updateSession(sessionId, { 
      transcript, 
      duration,
      status: 'processing' 
    });
  }, [updateSession]);

  // Save summary (after AI processing)
  const saveSummary = useCallback(async (
    sessionId: string,
    summary: DBSession['summary']
  ) => {
    return updateSession(sessionId, { 
      summary, 
      status: 'processed' 
    });
  }, [updateSession]);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      // Remove from local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  // Get single session by ID
  const getSession = useCallback(async (sessionId: string): Promise<DBSession | null> => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  // Subscribe to a specific session (for real-time processing updates)
  const subscribeToSession = useCallback((
    sessionId: string,
    onUpdate: (session: DBSession) => void
  ) => {
    const subscription = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const updatedSession = payload.new as DBSession;
          onUpdate(updatedSession);
          
          // Also update local state
          setSessions(prev =>
            prev.map(s => (s.id === sessionId ? updatedSession : s))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Toggle action item completion
  const toggleActionItem = useCallback(async (
    sessionId: string,
    actionItemId: string
  ) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session?.summary) return { success: false, error: 'No summary found' };

    const updatedActionItems = session.summary.action_items.map(item =>
      item.id === actionItemId ? { ...item, completed: !item.completed } : item
    );

    return updateSession(sessionId, {
      summary: {
        ...session.summary,
        action_items: updatedActionItems,
      },
    });
  }, [sessions, updateSession]);

  // Initial fetch when user changes
  useEffect(() => {
    if (user) {
      fetchSessions();
    } else {
      setSessions([]);
      setLoading(false);
    }
  }, [user, fetchSessions]);

  // Real-time subscription for all user sessions
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSessions(prev => {
              // Avoid duplicates
              if (prev.some(s => s.id === payload.new.id)) return prev;
              return [payload.new as DBSession, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setSessions(prev =>
              prev.map(s => (s.id === payload.new.id ? payload.new as DBSession : s))
            );
          } else if (payload.eventType === 'DELETE') {
            setSessions(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    updateSessionStatus,
    saveTranscript,
    saveSummary,
    deleteSession,
    getSession,
    subscribeToSession,
    toggleActionItem,
  };
}

export default useSessions;
