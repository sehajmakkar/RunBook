import { createClient } from "@deepgram/sdk";

// Server-side Deepgram client (for TTS and token generation)
export function getDeepgramClient() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPGRAM_API_KEY is not set");
  }
  return createClient(apiKey);
}

// Deepgram configuration constants
export const DEEPGRAM_CONFIG = {
  // STT (Speech-to-Text) settings
  stt: {
    model: "nova-2",
    language: "en-US",
    smart_format: true,
    punctuate: true,
    interim_results: true,
    utterance_end_ms: 1000,
    vad_events: true,
    endpointing: 300,
  },
  
  // TTS (Text-to-Speech) settings
  tts: {
    model: "aura-asteria-en", // Female voice, professional tone
    // Alternative voices:
    // "aura-luna-en" - Female, warm
    // "aura-stella-en" - Female, confident
    // "aura-orion-en" - Male, authoritative
    encoding: "linear16",
    sample_rate: 24000,
    container: "none",
  },
} as const;

// Voice options for TTS
export const VOICE_OPTIONS = {
  "aura-asteria-en": { name: "Asteria", gender: "female", tone: "professional" },
  "aura-luna-en": { name: "Luna", gender: "female", tone: "warm" },
  "aura-stella-en": { name: "Stella", gender: "female", tone: "confident" },
  "aura-orion-en": { name: "Orion", gender: "male", tone: "authoritative" },
} as const;

export type VoiceId = keyof typeof VOICE_OPTIONS;
