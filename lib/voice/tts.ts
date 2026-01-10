"use client";

export interface TTSOptions {
  voice?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Text-to-Speech client using Deepgram Aura
 * Uses server-side API route to keep API key secure
 */
export class DeepgramTTS {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private isPlaying = false;
  private queue: Array<{ text: string; options?: TTSOptions }> = [];
  private defaultOptions: TTSOptions;

  constructor(defaultOptions: TTSOptions = {}) {
    this.defaultOptions = defaultOptions;
  }

  /**
   * Initialize audio context (must be called from user interaction)
   */
  async init(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    
    // Resume if suspended (browser autoplay policy)
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  /**
   * Speak text using TTS
   */
  async speak(text: string, options?: TTSOptions): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    // If already playing, add to queue
    if (this.isPlaying) {
      this.queue.push({ text, options: mergedOptions });
      return;
    }

    await this.playAudio(text, mergedOptions);
  }

  /**
   * Play audio for given text
   */
  private async playAudio(text: string, options: TTSOptions): Promise<void> {
    if (!text.trim()) return;

    try {
      await this.init();
      
      this.isPlaying = true;
      options.onStart?.();

      console.log("[TTS] Fetching audio for:", text.substring(0, 50) + "...");

      // Fetch audio from server API
      const response = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: options.voice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`TTS request failed: ${response.status} ${errorData.error || response.statusText}`);
      }

      // Get audio data as ArrayBuffer
      const audioData = await response.arrayBuffer();
      console.log("[TTS] Received audio data:", audioData.byteLength, "bytes");

      if (!this.audioContext) {
        throw new Error("AudioContext not initialized");
      }

      // Decode MP3 audio data
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      console.log("[TTS] Decoded audio:", audioBuffer.duration, "seconds");

      // Create and play source
      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.connect(this.audioContext.destination);

      this.currentSource.onended = () => {
        console.log("[TTS] Playback ended");
        this.isPlaying = false;
        this.currentSource = null;
        options.onEnd?.();

        // Process queue
        this.processQueue();
      };

      console.log("[TTS] Starting playback...");
      this.currentSource.start();

    } catch (error) {
      this.isPlaying = false;
      const err = error instanceof Error ? error : new Error(String(error));
      options.onError?.(err);
      console.error("[TTS] Error:", error);

      // Process queue even on error
      this.processQueue();
    }
  }

  /**
   * Process queued speech requests
   */
  private processQueue(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        this.playAudio(next.text, next.options || this.defaultOptions);
      }
    }
  }

  /**
   * Stop current playback
   */
  stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // Ignore errors if already stopped
      }
      this.currentSource = null;
    }
    this.isPlaying = false;
    this.queue = [];
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.isPlaying;
  }

  /**
   * Clear the speech queue
   */
  clearQueue(): void {
    this.queue = [];
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

/**
 * Speak text immediately (convenience function)
 */
export async function speakText(text: string, options?: TTSOptions): Promise<void> {
  const tts = new DeepgramTTS(options);
  await tts.speak(text, options);
}
