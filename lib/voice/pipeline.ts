"use client";

import { DeepgramSTT, type STTCallbacks } from "./stt";
import { DeepgramTTS, type TTSOptions } from "./tts";

export type VoicePipelineState =
  | "idle"
  | "connecting"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

export interface VoicePipelineCallbacks {
  onStateChange: (state: VoicePipelineState) => void;
  onTranscript: (text: string, isFinal: boolean) => void;
  onError: (error: Error) => void;
  onVoiceActivity?: (isActive: boolean, level: number) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

export interface VoicePipelineOptions {
  voice?: string;
  vadThreshold?: number;
  autoInterrupt?: boolean; // Stop TTS when user starts speaking
}

/**
 * Voice Pipeline - Orchestrates STT and TTS for real-time voice conversation
 */
export class VoicePipeline {
  private stt: DeepgramSTT | null = null;
  private tts: DeepgramTTS;
  private callbacks: VoicePipelineCallbacks;
  private options: Required<VoicePipelineOptions>;
  private state: VoicePipelineState = "idle";
  private isInitialized = false;
  private interimTranscript = "";

  constructor(
    callbacks: VoicePipelineCallbacks,
    options: VoicePipelineOptions = {}
  ) {
    this.callbacks = callbacks;
    this.options = {
      voice: options.voice ?? "aura-asteria-en",
      vadThreshold: options.vadThreshold ?? 0.01,
      autoInterrupt: options.autoInterrupt ?? true,
    };

    // Initialize TTS
    this.tts = new DeepgramTTS({
      voice: this.options.voice,
      onStart: () => {
        this.setState("speaking");
        // Mute STT while TTS is playing to prevent audio feedback from triggering voice activity
        this.stt?.setMuted(true);
        this.callbacks.onSpeechStart?.();
      },
      onEnd: () => {
        // Unmute STT after TTS finishes - add small delay to prevent picking up tail end of audio
        setTimeout(() => {
          this.stt?.setMuted(false);
        }, 300);
        this.setState("listening");
        this.callbacks.onSpeechEnd?.();
      },
      onError: (error) => {
        // Unmute STT on error too
        this.stt?.setMuted(false);
        this.callbacks.onError(error);
      },
    });
  }

  /**
   * Set pipeline state and notify callback
   */
  private setState(state: VoicePipelineState): void {
    this.state = state;
    this.callbacks.onStateChange(state);
  }

  /**
   * Initialize and start the voice pipeline
   */
  async start(): Promise<void> {
    if (this.isInitialized) {
      console.warn("Voice pipeline already initialized");
      return;
    }

    this.setState("connecting");

    try {
      // Initialize TTS audio context (needs user interaction first)
      await this.tts.init();

      // Set up STT callbacks
      const sttCallbacks: STTCallbacks = {
        onTranscript: (text, isFinal) => {
          if (isFinal) {
            this.interimTranscript = "";
            this.callbacks.onTranscript(text, true);
          } else {
            this.interimTranscript = text;
            this.callbacks.onTranscript(text, false);
          }
        },
        onError: (error) => {
          this.setState("error");
          this.callbacks.onError(error);
        },
        onConnectionChange: (connected) => {
          if (connected) {
            this.setState("listening");
          } else if (this.state !== "speaking" && this.state !== "processing") {
            this.setState("idle");
          }
        },
        onVoiceActivity: (isActive, level) => {
          this.callbacks.onVoiceActivity?.(isActive, level);

          // Auto-interrupt TTS if user starts speaking
          if (isActive && this.options.autoInterrupt && this.tts.isSpeaking()) {
            this.tts.stop();
            this.setState("listening");
          }
        },
      };

      // Initialize and start STT
      this.stt = new DeepgramSTT(sttCallbacks, {
        vadThreshold: this.options.vadThreshold,
      });

      await this.stt.start();
      this.isInitialized = true;
    } catch (error) {
      this.setState("error");
      throw error;
    }
  }

  /**
   * Speak text using TTS
   * Will be queued if already speaking
   */
  async speak(text: string): Promise<void> {
    console.log("[VoicePipeline] speak() called");
    if (!text.trim()) {
      console.log("[VoicePipeline] Empty text, skipping");
      return;
    }

    console.log("[VoicePipeline] Setting state to speaking and calling TTS");
    this.setState("speaking");
    await this.tts.speak(text);
    console.log("[VoicePipeline] TTS speak() completed");
  }

  /**
   * Stop TTS playback immediately
   */
  stopSpeaking(): void {
    this.tts.stop();
    if (this.state === "speaking") {
      this.setState("listening");
    }
  }

  /**
   * Set mute state for microphone
   */
  setMuted(muted: boolean): void {
    this.stt?.setMuted(muted);
  }

  /**
   * Get current pipeline state
   */
  getState(): VoicePipelineState {
    return this.state;
  }

  /**
   * Check if TTS is currently speaking
   */
  isSpeaking(): boolean {
    return this.tts.isSpeaking();
  }

  /**
   * Check if STT is active
   */
  isListening(): boolean {
    return this.stt?.isActive() ?? false;
  }

  /**
   * Stop the pipeline and clean up resources
   */
  stop(): void {
    this.stt?.stop();
    this.stt = null;

    this.tts.dispose();

    this.isInitialized = false;
    this.interimTranscript = "";
    this.setState("idle");
  }

  /**
   * Get current interim transcript
   */
  getInterimTranscript(): string {
    return this.interimTranscript;
  }
}

/**
 * Create a voice pipeline instance
 */
export function createVoicePipeline(
  callbacks: VoicePipelineCallbacks,
  options?: VoicePipelineOptions
): VoicePipeline {
  return new VoicePipeline(callbacks, options);
}
