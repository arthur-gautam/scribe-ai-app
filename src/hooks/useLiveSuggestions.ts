import { useState, useRef, useCallback, useEffect } from 'react';
import { generateLiveSuggestion, AISuggestion } from '../services/gemini';

interface LiveSuggestionsState {
    currentSuggestion: AISuggestion | null;
    suggestionHistory: AISuggestion[];
    isGenerating: boolean;
    lastWordCount: number;
}

const WORD_THRESHOLD = 50; // Generate suggestion every 50 words
const MIN_INTERVAL_MS = 15000; // Minimum 15 seconds between suggestions

export function useLiveSuggestions(sessionGoal: string) {
    const [state, setState] = useState<LiveSuggestionsState>({
        currentSuggestion: null,
        suggestionHistory: [],
        isGenerating: false,
        lastWordCount: 0,
    });

    const lastSuggestionTime = useRef<number>(0);
    const isActiveRef = useRef<boolean>(false);

    // Start listening for suggestions
    const startSuggestions = useCallback(() => {
        isActiveRef.current = true;
        setState(prev => ({
            ...prev,
            currentSuggestion: null,
            suggestionHistory: [],
            lastWordCount: 0,
        }));
    }, []);

    // Stop listening for suggestions
    const stopSuggestions = useCallback(() => {
        isActiveRef.current = false;
    }, []);

    // Process transcript and potentially generate suggestion
    const processTranscript = useCallback(async (transcript: string) => {
        if (!isActiveRef.current) return;

        const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
        const wordsSinceLastSuggestion = wordCount - state.lastWordCount;
        const timeSinceLastSuggestion = Date.now() - lastSuggestionTime.current;

        // Check if we should generate a new suggestion
        if (
            wordsSinceLastSuggestion >= WORD_THRESHOLD &&
            timeSinceLastSuggestion >= MIN_INTERVAL_MS &&
            !state.isGenerating
        ) {
            setState(prev => ({ ...prev, isGenerating: true }));

            try {
                // Get last 3 sentences for context
                const sentences = transcript.match(/[^.!?]+[.!?]+/g) || [];
                const recentText = sentences.slice(-3).join(' ') || transcript.slice(-500);

                const suggestion = await generateLiveSuggestion(recentText, sessionGoal);

                if (suggestion && suggestion.confidence > 0.5) {
                    lastSuggestionTime.current = Date.now();
                    setState(prev => ({
                        ...prev,
                        currentSuggestion: suggestion,
                        suggestionHistory: [...prev.suggestionHistory, suggestion],
                        isGenerating: false,
                        lastWordCount: wordCount,
                    }));
                } else {
                    setState(prev => ({
                        ...prev,
                        isGenerating: false,
                        lastWordCount: wordCount,
                    }));
                }
            } catch (error) {
                console.error('Live suggestion error:', error);
                setState(prev => ({ ...prev, isGenerating: false }));
            }
        }
    }, [state.lastWordCount, state.isGenerating, sessionGoal]);

    // Clear current suggestion (after user acknowledges it)
    const clearCurrentSuggestion = useCallback(() => {
        setState(prev => ({ ...prev, currentSuggestion: null }));
    }, []);

    return {
        ...state,
        startSuggestions,
        stopSuggestions,
        processTranscript,
        clearCurrentSuggestion,
    };
}

export default useLiveSuggestions;
