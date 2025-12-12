const N8N_WEBHOOK_URL = process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL!;

export interface SessionPayload {
    session_id: string;
    user_id: string;
    user_email: string;
    title: string;
    goal: string;
    full_transcript: string;
    duration: number;
    timestamp: string;
}

export interface N8NResponse {
    success: boolean;
    summary?: {
        key_findings: string[];
        action_items: { id: string; text: string; completed: boolean }[];
        summary_text: string;
    };
    error?: string;
}

export async function sendSessionToN8N(payload: SessionPayload): Promise<N8NResponse> {
    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`n8n webhook failed: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            summary: data.summary,
        };
    } catch (error: any) {
        console.error('n8n webhook error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

export default { sendSessionToN8N };
