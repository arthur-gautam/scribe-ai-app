// Mock global fetch
global.fetch = jest.fn();

// Mock console to avoid cluttering test output
global.console = {
    ...console,
    // log: jest.fn(),
    // error: jest.fn(),
    // warn: jest.fn(),
};

// Mock env vars
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'mock-key';
process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'mock-gemini-key';
process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY = 'mock-deepgram-key';
process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL = 'https://mock-n8n.com/webhook';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Mock Expo AV
jest.mock('expo-av', () => ({
    Audio: {
        requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
        setAudioModeAsync: jest.fn().mockResolvedValue(true),
    }
}));

// Mock Expo Audio Stream
jest.mock('@quiztr/expo-audio-stream', () => ({
    ExpoPlayAudioStream: {
        startRecording: jest.fn().mockImplementation(async ({ onAudioStream }) => {
            // Simulate stream data after a short delay
            setTimeout(() => {
                // "Hello" in base64 is SGVsbG8=
                if (onAudioStream) {
                    onAudioStream({ data: 'SGVsbG8=' });
                }
            }, 50);
            return {
                subscription: { remove: jest.fn() }
            };
        }),
        stopRecording: jest.fn().mockResolvedValue({
            fileUri: 'file://audio.wav'
        }),
    }
}));
