import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

const DEEPGRAM_API_KEY = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY!;

export class DeepgramService {
  private client: any;
  private connection: any;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient(DEEPGRAM_API_KEY);
  }

  async connect(onTranscript: (text: string, isFinal: boolean) => void): Promise<void> {
    try {
      this.connection = this.client.listen.live({
        model: 'nova-2-medical', // Optimized for medical terminology
        language: 'en-US',
        smart_format: true,
        punctuate: true,
        interim_results: true,
        utterance_end_ms: 1000,
        vad_events: true,
      });

      this.connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('Deepgram connection opened');
        this.isConnected = true;
      });

      this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        if (transcript) {
          const isFinal = data.is_final;
          onTranscript(transcript, isFinal);
        }
      });

      this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error('Deepgram error:', error);
      });

      this.connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram connection closed');
        this.isConnected = false;
      });

    } catch (error) {
      console.error('Failed to connect to Deepgram:', error);
      throw error;
    }
  }

  sendAudio(audioData: ArrayBuffer): void {
    if (this.isConnected && this.connection) {
      this.connection.send(audioData);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      this.connection.finish();
      this.isConnected = false;
    }
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const deepgramService = new DeepgramService();
