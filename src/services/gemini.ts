import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface AISuggestion {
    suggestion: string;
    type: 'question' | 'observation' | 'action' | 'warning';
    confidence: number;
}

export async function generateLiveSuggestion(
    recentTranscript: string,
    sessionGoal: string
): Promise<AISuggestion | null> {
    try {
        const prompt = `You are a helpful medical assistant listening to a clinical conversation.
Your role is to provide ONE short, helpful suggestion based on the conversation.
Session Goal: ${sessionGoal}

Rules:
- Keep suggestions under 20 words
- Be specific and actionable
- Focus on what the clinician might have missed
- Never repeat previous suggestions
- Return valid JSON only

Recent conversation (last 3 sentences):
${recentTranscript}

Response format:
{
  "suggestion": "Your brief suggestion here",
  "type": "question|observation|action|warning",
  "confidence": 0.0-1.0
}`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        suggestion: { type: SchemaType.STRING },
                        type: { type: SchemaType.STRING, enum: ["question", "observation", "action", "warning"] },
                        confidence: { type: SchemaType.NUMBER }
                    },
                    required: ["suggestion", "type", "confidence"]
                }
            }
        });

        const response = result.response;
        const text = response.text();

        if (text) {
            return JSON.parse(text) as AISuggestion;
        }
        return null;
    } catch (error) {
        console.error('Gemini suggestion error:', error);
        return null;
    }
}

export async function generateSessionSummary(
    fullTranscript: string,
    sessionGoal: string
): Promise<{
    keyFindings: string[];
    actionItems: string[];
    summary: string;
} | null> {
    try {
        const prompt = `You are a medical documentation assistant. Analyze this clinical session transcript and extract key information.
Session Goal: ${sessionGoal}

Transcript:
${fullTranscript}

Return valid JSON with:
- keyFindings: list of strings
- actionItems: list of strings
- summary: brief 2-3 sentence summary`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        keyFindings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        actionItems: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        summary: { type: SchemaType.STRING }
                    },
                    required: ["keyFindings", "actionItems", "summary"]
                }
            }
        });

        const response = result.response;
        const text = response.text();

        if (text) {
            return JSON.parse(text);
        }
        return null;
    } catch (error) {
        console.error('Gemini summary error:', error);
        return null;
    }
}

export default { generateLiveSuggestion, generateSessionSummary };
