import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import { useRecording } from '../hooks/useRecording';
import { useLiveSuggestions } from '../hooks/useLiveSuggestions';
import { AISuggestion } from '../services/gemini';

// Types for navigation
type RootStackParamList = {
  LiveRecording: {
    sessionId: string;
    patientId: string;
    title: string;
    goal: string;
  };
  Processing: {
    sessionId: string;
    transcript: string;
    duration: number;
    title: string;
    goal: string;
  };
};

type LiveRecordingScreenRouteProp = RouteProp<RootStackParamList, 'LiveRecording'>;

const { width } = Dimensions.get('window');

export default function LiveRecordingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<LiveRecordingScreenRouteProp>();
  const { sessionId, title, goal } = route.params;

  // Hooks
  const {
    isRecording,
    isPaused,
    duration,
    transcript,
    interimTranscript,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isConnectedToDeepgram,
  } = useRecording();

  const {
    currentSuggestion,
    isGenerating,
    startSuggestions,
    stopSuggestions,
    processTranscript,
    clearCurrentSuggestion,
  } = useLiveSuggestions(goal);

  // Refs and State
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showTranscript, setShowTranscript] = useState(true);

  // Initial recording start
  useEffect(() => {
    startRecording();
    startSuggestions();

    return () => {
      stopSuggestions();
    };
  }, []);

  // Monitor transcript for suggestions
  useEffect(() => {
    if (transcript) {
      processTranscript(transcript);

      // Auto-scroll to bottom
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }
  }, [transcript]);

  // Animate suggestion appearance
  useEffect(() => {
    if (currentSuggestion) {
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentSuggestion]);

  // Recording pulse animation
  useEffect(() => {
    if (isRecording && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, isPaused]);

  // Format duration (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = async () => {
    Alert.alert(
      'End Session?',
      'Are you sure you want to end this recording session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            const result = await stopRecording();
            stopSuggestions();

            if (result.success) {
              navigation.replace('Processing', {
                sessionId,
                transcript: result.transcript,
                duration: result.duration,
                title,
                goal,
              });
            } else {
              Alert.alert('Error', 'Failed to save recording.');
            }
          },
        },
      ]
    );
  };

  const handleSuggestionAction = (suggestion: AISuggestion) => {
    // Here you could add logic to "accept" or "save" the suggestion
    // For now, allow dismissing it
    clearCurrentSuggestion();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'question': return 'help-circle-outline';
      case 'warning': return 'alert-circle-outline';
      case 'action': return 'checkbox-marked-circle-outline';
      default: return 'lightbulb-on-outline';
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'question': return '#3B82F6'; // Blue
      case 'warning': return '#EF4444'; // Red
      case 'action': return '#10B981'; // Green
      default: return '#F59E0B'; // Amber
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1A365D', '#0F172A']}
        style={styles.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{isPaused ? 'Paused' : 'Live Recording'}</Text>
        </View>
        <View style={styles.connectionStatus}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isConnectedToDeepgram ? '#10B981' : '#EF4444' }
          ]} />
          <Text style={styles.statusText}>
            {isConnectedToDeepgram ? 'Live' : 'Connecting...'}
          </Text>
        </View>
      </View>

      {/* Timer & Visualization */}
      <View style={styles.timerContainer}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={styles.recordingIndicator}>
            <MaterialCommunityIcons name="microphone" size={32} color="white" />
          </View>
        </Animated.View>
        <Text style={styles.timerText}>{formatTime(duration)}</Text>
      </View>

      {/* Transcript Area */}
      <View style={styles.transcriptContainer}>
        <View style={styles.transcriptHeader}>
          <Text style={styles.sectionTitle}>LIVE TRANSCRIPT</Text>
          <TouchableOpacity onPress={() => setShowTranscript(!showTranscript)}>
            <Ionicons name={showTranscript ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {showTranscript ? (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {transcript ? (
              <Text style={styles.transcriptText}>
                {transcript}
                <Text style={styles.interimText}> {interimTranscript}</Text>
              </Text>
            ) : (
              <Text style={styles.placeholderText}>
                Listening for conversation...
              </Text>
            )}
          </ScrollView>
        ) : (
          <View style={styles.hiddenTranscriptPlaceholder}>
            <Text style={styles.hiddenText}>Transcript hidden for privacy</Text>
          </View>
        )}
      </View>

      {/* AI Suggestions Overlay */}
      {currentSuggestion && (
        <Animated.View style={[styles.suggestionOverlay, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
            style={styles.suggestionContent}
          >
            <View style={styles.suggestionHeader}>
              <View style={styles.suggestionBadge}>
                <MaterialCommunityIcons
                  name={getSuggestionIcon(currentSuggestion.type)}
                  size={16}
                  color={getSuggestionColor(currentSuggestion.type)}
                />
                <Text style={[styles.suggestionType, { color: getSuggestionColor(currentSuggestion.type) }]}>
                  AI Suggestion
                </Text>
              </View>
              <TouchableOpacity onPress={clearCurrentSuggestion}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.suggestionText}>{currentSuggestion.suggestion}</Text>

            <View style={styles.suggestionActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: getSuggestionColor(currentSuggestion.type) }]}
                onPress={() => handleSuggestionAction(currentSuggestion)}
              >
                <Text style={styles.actionButtonText}>Acknowledge</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {isPaused ? (
          <TouchableOpacity style={styles.resumeButton} onPress={resumeRecording}>
            <Ionicons name="play" size={32} color="white" />
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pauseButton} onPress={pauseRecording}>
            <Ionicons name="pause" size={32} color="white" />
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
          <View style={styles.stopIcon} />
          <Text style={styles.buttonText}>End Session</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  recordingIndicator: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200',
    color: 'white',
    fontVariant: ['tabular-nums'],
  },
  transcriptContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for suggestion overlay
  },
  transcriptText: {
    fontSize: 18,
    lineHeight: 28,
    color: 'white',
  },
  interimText: {
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  placeholderText: {
    color: '#64748B',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
  },
  hiddenTranscriptPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenText: {
    color: '#64748B',
    fontSize: 16,
  },
  suggestionOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionContent: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionType: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  suggestionText: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 12,
  },
  suggestionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  controlsContainer: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    gap: 16,
  },
  pauseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  resumeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  stopButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  stopIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
