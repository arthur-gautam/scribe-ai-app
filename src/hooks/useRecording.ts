import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { deepgramService } from '../services/deepgram';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  transcript: string;
  interimTranscript: string;
  audioUri: string | null;
  isConnectedToDeepgram: boolean;
}

export function useRecording() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    transcript: '',
    interimTranscript: '',
    audioUri: null,
    isConnectedToDeepgram: false,
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<string>('');

  // Handle transcript updates from Deepgram
  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      transcriptRef.current += (transcriptRef.current ? ' ' : '') + text;
      setState(prev => ({
        ...prev,
        transcript: transcriptRef.current,
        interimTranscript: '',
      }));
    } else {
      setState(prev => ({
        ...prev,
        interimTranscript: text,
      }));
    }
  }, []);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      return true;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }, []);

  // Start recording with Deepgram
  const startRecording = useCallback(async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Permission denied' };
      }

      // Connect to Deepgram first
      await deepgramService.connect(handleTranscript);

      // Create and prepare recording
      const { recording } = await Audio.Recording.createAsync(
        {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          android: {
            extension: '.wav',
            outputFormat: Audio.AndroidOutputFormat.DEFAULT,
            audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 256000,
          },
          ios: {
            extension: '.wav',
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 256000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        },
        // Stream audio to Deepgram
        (status) => {
          if (status.isRecording && status.metering !== undefined) {
            // Audio data would be streamed here
            // Note: expo-av doesn't provide raw audio chunks directly
            // For production, use react-native-live-audio-stream
          }
        },
        100 // Update every 100ms
      );

      recordingRef.current = recording;

      // Reset transcript
      transcriptRef.current = '';

      // Start duration timer
      timerRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);

      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        transcript: '',
        interimTranscript: '',
        audioUri: null,
        isConnectedToDeepgram: true,
      }));

      return { success: true };
    } catch (error: any) {
      console.error('Start recording error:', error);
      return { success: false, error: error.message };
    }
  }, [requestPermissions, handleTranscript]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Disconnect from Deepgram
      await deepgramService.disconnect();

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();

        recordingRef.current = null;

        setState(prev => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          audioUri: uri,
          isConnectedToDeepgram: false,
        }));

        // Reset audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });

        return {
          success: true,
          audioUri: uri,
          duration: state.duration,
          transcript: transcriptRef.current,
        };
      }

      return { success: false, error: 'No active recording' };
    } catch (error: any) {
      console.error('Stop recording error:', error);
      return { success: false, error: error.message };
    }
  }, [state.duration]);

  // Pause recording
  const pauseRecording = useCallback(async () => {
    try {
      if (recordingRef.current && state.isRecording && !state.isPaused) {
        await recordingRef.current.pauseAsync();

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        setState(prev => ({ ...prev, isPaused: true }));
        return { success: true };
      }
      return { success: false, error: 'Not recording' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [state.isRecording, state.isPaused]);

  // Resume recording
  const resumeRecording = useCallback(async () => {
    try {
      if (recordingRef.current && state.isPaused) {
        await recordingRef.current.startAsync();

        timerRef.current = setInterval(() => {
          setState(prev => ({
            ...prev,
            duration: prev.duration + 1,
          }));
        }, 1000);

        setState(prev => ({ ...prev, isPaused: false }));
        return { success: true };
      }
      return { success: false, error: 'Not paused' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [state.isPaused]);

  // Get current transcript
  const getTranscript = useCallback(() => {
    return transcriptRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      deepgramService.disconnect();
    };
  }, []);

  return {
    ...state,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    getTranscript,
  };
}

export default useRecording;
