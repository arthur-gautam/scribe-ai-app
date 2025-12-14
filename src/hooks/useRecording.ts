import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { deepgramService } from '../services/deepgram';
import { ExpoPlayAudioStream } from '@quiztr/expo-audio-stream';
import { Buffer } from 'buffer';

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

  const subscriptionRef = useRef<any>(null);
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

      const { subscription } = await ExpoPlayAudioStream.startRecording({
        sampleRate: 16000,
        channels: 1,
        encoding: 'pcm_16bit',
        interval: 100, // 100ms chunks
        onAudioStream: async (event: any) => {
            if (event.data) {
                // Convert base64 to ArrayBuffer using Buffer (works in RN with polyfill)
                const buffer = Buffer.from(event.data, 'base64');
                const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
                deepgramService.sendAudio(arrayBuffer);
            }
        },
      });

      subscriptionRef.current = subscription;

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

      let uri: string | null = null;
      try {
        const recording = await ExpoPlayAudioStream.stopRecording();
        uri = recording?.fileUri ?? null;
      } catch (e) {
        console.warn('Error stopping recording:', e);
      }

      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }

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

    } catch (error: any) {
      console.error('Stop recording error:', error);
      return { success: false, error: error.message };
    }
  }, [state.duration]);

  // Pause recording
  const pauseRecording = useCallback(async () => {
    try {
      if (state.isRecording && !state.isPaused) {
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
      if (state.isPaused) {
        // Resume timer
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
      if (subscriptionRef.current) {
          subscriptionRef.current.remove();
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
