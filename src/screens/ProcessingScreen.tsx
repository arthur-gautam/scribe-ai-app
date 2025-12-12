import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sendSessionToN8N } from '../services/n8n';

type RootStackParamList = {
  Processing: {
    sessionId: string;
    transcript: string;
    duration: number;
    title: string;
    goal: string;
  };
  Summary: {
    sessionId: string;
    summaryData: any;
  };
};

type ProcessingScreenRouteProp = RouteProp<RootStackParamList, 'Processing'>;

export default function ProcessingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ProcessingScreenRouteProp>();
  const { sessionId, transcript, duration, title, goal } = route.params;

  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startProcessing();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const startProcessing = async () => {
    try {
      // 1. Prepare payload
      setStatus('Analyzing conversation...');

      const payload = {
        session_id: sessionId,
        user_id: 'current-user-id', // Replace with actual user ID from auth context
        user_email: 'user@example.com', // Replace with actual email
        title,
        goal,
        full_transcript: transcript,
        duration,
        timestamp: new Date().toISOString(),
      };

      // 2. Send to n8n
      setStatus('Generating clinical notes...');
      const result = await sendSessionToN8N(payload);

      if (result.success && result.summary) {
        setStatus('Finalizing...');
        // Small delay for UX
        setTimeout(() => {
          navigation.replace('Summary', {
            sessionId,
            summaryData: result.summary,
          });
        }, 1000);
      } else {
        throw new Error(result.error || 'Failed to generate summary');
      }

    } catch (err: any) {
      console.error('Processing error:', err);
      setError(err.message || 'An unexpected error occurred');
      setStatus('Processing failed');
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={['#1A365D', '#0F172A']}
          style={styles.background}
        />
        <View style={styles.content}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Processing Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText} onPress={() => navigation.goBack()}>
            Go back to recordings
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1A365D', '#0F172A']}
        style={styles.background}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <View style={styles.spinnerContainer}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              style={styles.spinnerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
        </Animated.View>

        <View style={styles.centerIcon}>
          <MaterialCommunityIcons name="brain" size={32} color="white" />
        </View>

        <Text style={styles.title}>AI Processing</Text>
        <Text style={styles.subtitle}>{title}</Text>

        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#94A3B8" style={styles.loader} />
          <Text style={styles.statusText}>{status}</Text>
        </View>

        <Text style={styles.tipText}>
          This usually takes 10-20 seconds depending on the session length.
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  spinnerContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
  },
  spinnerGradient: {
    flex: 1,
    borderRadius: 60,
  },
  centerIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16, // half of size (32)
    marginTop: -80, // rough adjustment to center in spinner
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 32,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  loader: {
    marginRight: 10,
  },
  statusText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '500',
  },
  tipText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    color: '#E2E8F0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
});
