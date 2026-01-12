"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  VoicePipeline,
  type VoicePipelineState,
  type VoicePipelineOptions,
} from "./pipeline";

export interface UseVoicePipelineOptions extends VoicePipelineOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: VoicePipelineState) => void;
  onVoiceActivity?: (isActive: boolean, level: number) => void;
}

export interface UseVoicePipelineReturn {
  state: VoicePipelineState;
  isReady: boolean;
  isConnected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  voiceLevel: number;
  error: Error | null;
  start: () => Promise<VoicePipeline | null>;
  stop: () => void;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  setMuted: (muted: boolean) => void;
  getPipeline: () => VoicePipeline | null;
}

/**
 * React hook for using the voice pipeline
 */
export function useVoicePipeline(
  options: UseVoicePipelineOptions = {}
): UseVoicePipelineReturn {
  const [state, setState] = useState<VoicePipelineState>("idle");
  const [isReady, setIsReady] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const pipelineRef = useRef<VoicePipeline | null>(null);
  const optionsRef = useRef(options);

  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Start the voice pipeline
  const start = useCallback(async (): Promise<VoicePipeline | null> => {
    console.log("[useVoicePipeline] start() called");

    if (pipelineRef.current) {
      console.warn("[useVoicePipeline] Pipeline already started");
      return pipelineRef.current;
    }

    setError(null);
    setIsReady(false);

    const pipeline = new VoicePipeline(
      {
        onStateChange: (newState) => {
          console.log("[useVoicePipeline] State changed to:", newState);
          setState(newState);
          optionsRef.current.onStateChange?.(newState);
        },
        onTranscript: (text, isFinal) => {
          optionsRef.current.onTranscript?.(text, isFinal);
        },
        onError: (err) => {
          console.error("[useVoicePipeline] Error:", err);
          setError(err);
          optionsRef.current.onError?.(err);
        },
        onVoiceActivity: (isActive, level) => {
          setVoiceLevel(level);
          optionsRef.current.onVoiceActivity?.(isActive, level);
        },
      },
      {
        voice: optionsRef.current.voice,
        vadThreshold: optionsRef.current.vadThreshold,
        autoInterrupt: optionsRef.current.autoInterrupt,
      }
    );

    pipelineRef.current = pipeline;
    console.log(
      "[useVoicePipeline] Pipeline instance created and stored in ref"
    );

    try {
      await pipeline.start();
      console.log("[useVoicePipeline] Pipeline started successfully");
      setIsReady(true);
      return pipeline;
    } catch (err) {
      console.error("[useVoicePipeline] Pipeline start failed:", err);
      pipelineRef.current = null;
      setIsReady(false);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []); // Remove dependencies to prevent recreation

  // Stop the voice pipeline
  const stop = useCallback(() => {
    if (pipelineRef.current) {
      pipelineRef.current.stop();
      pipelineRef.current = null;
    }
    setState("idle");
    setIsReady(false);
    setVoiceLevel(0);
  }, []);

  // Get the current pipeline instance (useful for direct access)
  const getPipeline = useCallback((): VoicePipeline | null => {
    return pipelineRef.current;
  }, []);

  // Speak text - uses a function getter pattern to avoid stale closures
  const speak = useCallback(async (text: string) => {
    console.log(
      "[useVoicePipeline] speak() called with:",
      text.substring(0, 50) + "..."
    );

    // Access ref directly at call time to avoid stale closure
    const pipeline = pipelineRef.current;
    console.log("[useVoicePipeline] pipelineRef.current exists:", !!pipeline);

    if (!pipeline) {
      console.warn(
        "[useVoicePipeline] Pipeline not started, cannot speak. Use the pipeline returned from start() or getPipeline() for immediate use after starting."
      );
      return;
    }

    console.log("[useVoicePipeline] Calling pipeline.speak()");
    try {
      await pipeline.speak(text);
      console.log("[useVoicePipeline] pipeline.speak() completed");
    } catch (err) {
      console.error("[useVoicePipeline] pipeline.speak() failed:", err);
      throw err;
    }
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    pipelineRef.current?.stopSpeaking();
  }, []);

  // Set muted state
  const setMuted = useCallback((muted: boolean) => {
    pipelineRef.current?.setMuted(muted);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pipelineRef.current) {
        pipelineRef.current.stop();
        pipelineRef.current = null;
      }
    };
  }, []);

  return {
    state,
    isReady,
    isConnected:
      state !== "idle" && state !== "error" && state !== "connecting",
    isSpeaking: state === "speaking",
    isListening: state === "listening",
    voiceLevel,
    error,
    start,
    stop,
    speak,
    stopSpeaking,
    setMuted,
    getPipeline,
  };
}
