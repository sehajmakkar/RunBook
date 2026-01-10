// Voice Pipeline Exports

// Main pipeline
export { VoicePipeline, createVoicePipeline } from "./pipeline";
export type { VoicePipelineState, VoicePipelineCallbacks, VoicePipelineOptions } from "./pipeline";

// React Hook
export { useVoicePipeline } from "./use-voice-pipeline";
export type { UseVoicePipelineOptions, UseVoicePipelineReturn } from "./use-voice-pipeline";

// STT (Speech-to-Text)
export { DeepgramSTT } from "./stt";
export type { STTCallbacks, STTOptions } from "./stt";

// TTS (Text-to-Speech)
export { DeepgramTTS, speakText } from "./tts";
export type { TTSOptions } from "./tts";

// Configuration
export { DEEPGRAM_CONFIG, VOICE_OPTIONS } from "./deepgram";
export type { VoiceId } from "./deepgram";

// Audio utilities
export * from "./audio-utils";
