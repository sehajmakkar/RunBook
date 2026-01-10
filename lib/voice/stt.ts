"use client";

import { DEEPGRAM_CONFIG } from "./deepgram";
import { float32ToInt16, calculateAudioLevel, detectVoiceActivity } from "./audio-utils";

export interface STTCallbacks {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError: (error: Error) => void;
  onConnectionChange: (connected: boolean) => void;
  onVoiceActivity?: (isActive: boolean, level: number) => void;
}

export interface STTOptions {
  sampleRate?: number;
  vadThreshold?: number;
}

/**
 * Speech-to-Text client using Deepgram WebSocket
 * Connects directly from browser to Deepgram for lowest latency
 */
export class DeepgramSTT {
  private ws: WebSocket | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private callbacks: STTCallbacks;
  private options: Required<STTOptions>;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor(callbacks: STTCallbacks, options: STTOptions = {}) {
    this.callbacks = callbacks;
    this.options = {
      sampleRate: options.sampleRate ?? 16000,
      vadThreshold: options.vadThreshold ?? 0.01,
    };
  }

  /**
   * Start STT - request microphone access and connect to Deepgram
   */
  async start(): Promise<void> {
    try {
      // Get temporary API key from server
      const tokenResponse = await fetch("/api/voice/token");
      if (!tokenResponse.ok) {
        throw new Error("Failed to get Deepgram token");
      }
      const { token } = await tokenResponse.json();

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: this.options.sampleRate,
        },
      });

      // Set up audio processing
      this.audioContext = new AudioContext({ sampleRate: this.options.sampleRate });
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Use ScriptProcessorNode for audio processing (deprecated but widely supported)
      // TODO: Migrate to AudioWorklet for better performance
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      // Connect to Deepgram WebSocket
      await this.connectWebSocket(token);

      // Process audio data
      this.processor.onaudioprocess = (event) => {
        if (!this.isConnected || !this.ws) return;

        const inputData = event.inputBuffer.getChannelData(0);
        
        // Calculate audio level for VAD
        const level = calculateAudioLevel(inputData);
        const isVoiceActive = detectVoiceActivity(level, this.options.vadThreshold);
        
        if (this.callbacks.onVoiceActivity) {
          this.callbacks.onVoiceActivity(isVoiceActive, level);
        }

        // Convert to PCM16 and send to Deepgram
        const pcm16 = float32ToInt16(inputData);
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(pcm16.buffer);
        }
      };

      // Connect audio nodes
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

    } catch (error) {
      this.callbacks.onError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Connect to Deepgram WebSocket
   */
  private async connectWebSocket(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const config = DEEPGRAM_CONFIG.stt;
      const params = new URLSearchParams({
        model: config.model,
        language: config.language,
        smart_format: String(config.smart_format),
        punctuate: String(config.punctuate),
        interim_results: String(config.interim_results),
        utterance_end_ms: String(config.utterance_end_ms),
        vad_events: String(config.vad_events),
        endpointing: String(config.endpointing),
        sample_rate: String(this.options.sampleRate),
        encoding: "linear16",
        channels: "1",
      });

      const wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}`;
      
      this.ws = new WebSocket(wsUrl, ["token", token]);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.callbacks.onConnectionChange(true);
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "Results" && data.channel?.alternatives?.[0]) {
            const alternative = data.channel.alternatives[0];
            const transcript = alternative.transcript;
            const isFinal = data.is_final === true;

            if (transcript && transcript.trim()) {
              this.callbacks.onTranscript(transcript, isFinal);
            }
          }
        } catch (error) {
          console.error("Error parsing Deepgram message:", error);
        }
      };

      this.ws.onerror = (event) => {
        console.error("Deepgram WebSocket error:", event);
        this.callbacks.onError(new Error("WebSocket connection error"));
        reject(new Error("WebSocket connection error"));
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        this.callbacks.onConnectionChange(false);
        
        // Attempt reconnection if not intentionally closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          setTimeout(() => {
            this.reconnect();
          }, 1000 * this.reconnectAttempts);
        }
      };
    });
  }

  /**
   * Attempt to reconnect
   */
  private async reconnect(): Promise<void> {
    try {
      const tokenResponse = await fetch("/api/voice/token");
      if (tokenResponse.ok) {
        const { token } = await tokenResponse.json();
        await this.connectWebSocket(token);
      }
    } catch (error) {
      console.error("Reconnection failed:", error);
    }
  }

  /**
   * Stop STT and clean up resources
   */
  stop(): void {
    // Close WebSocket
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        // Send close frame
        this.ws.send(JSON.stringify({ type: "CloseStream" }));
      }
      this.ws.close(1000, "Intentional close");
      this.ws = null;
    }

    // Disconnect audio nodes
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.isConnected = false;
    this.callbacks.onConnectionChange(false);
  }

  /**
   * Check if STT is currently connected
   */
  isActive(): boolean {
    return this.isConnected;
  }

  /**
   * Mute/unmute the microphone
   */
  setMuted(muted: boolean): void {
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }
}
