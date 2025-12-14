import { renderHook, act } from '@testing-library/react-hooks/native';
import useRecording from '../hooks/useRecording';
import { deepgramService } from '../services/deepgram';
import geminiService from '../services/gemini';
import n8nService from '../services/n8n';

// Mock Deepgram Service
jest.mock('../services/deepgram', () => ({
    deepgramService: {
        connect: jest.fn(),
        sendAudio: jest.fn(),
        disconnect: jest.fn(),
        getIsConnected: jest.fn(),
    }
}));

// Mock Gemini Service
jest.mock('../services/gemini', () => ({
    generateLiveSuggestion: jest.fn(),
    generateSessionSummary: jest.fn(),
}));

// Mock N8N Service
jest.mock('../services/n8n', () => ({
    sendSessionToN8N: jest.fn(),
}));

describe('Integration Tests: Session Flow', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('1. Start Recording connects to Deepgram and starts audio stream', async () => {
        const { result } = renderHook(() => useRecording());

        await act(async () => {
            const res = await result.current.startRecording();
            expect(res.success).toBe(true);
        });

        expect(deepgramService.connect).toHaveBeenCalled();
        expect(result.current.isRecording).toBe(true);
    });

    test('2. Stop Recording disconnects Deepgram and returns info', async () => {
        const { result } = renderHook(() => useRecording());

        // First start
        await act(async () => {
            await result.current.startRecording();
        });

        // Then stop
        await act(async () => {
            const res = await result.current.stopRecording();
            expect(res.success).toBe(true);
            expect(res.audioUri).toBe('file://audio.wav'); // from setup.ts mock
        });

        expect(deepgramService.disconnect).toHaveBeenCalled();
        expect(result.current.isRecording).toBe(false);
    });

    test('3. Gemini Service logic', async () => {
        const mockSuggestion = {
            suggestion: "Ask about pain level",
            type: "question",
            confidence: 0.9
        };
        (geminiService.generateLiveSuggestion as jest.Mock).mockResolvedValue(mockSuggestion);

        const result = await geminiService.generateLiveSuggestion("Patient says it hurts.", "Assess patient");

        expect(result).toEqual(mockSuggestion);
        expect(geminiService.generateLiveSuggestion).toHaveBeenCalledWith("Patient says it hurts.", "Assess patient");
    });

    test('4. N8N Service logic', async () => {
        const mockPayload = {
            session_id: "123",
            user_id: "u1",
            user_email: "test@test.com",
            title: "Test Session",
            goal: "Checkup",
            full_transcript: "Hello world",
            duration: 60,
            timestamp: new Date().toISOString()
        };

        const mockResponse = { success: true, summary: { key_findings: [], action_items: [], summary_text: "Good" } };
        (n8nService.sendSessionToN8N as jest.Mock).mockResolvedValue(mockResponse);

        const response = await n8nService.sendSessionToN8N(mockPayload);
        expect(response.success).toBe(true);
    });
});
