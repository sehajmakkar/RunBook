/**
 * Google Gemini AI Client Configuration
 *
 * This module provides a configured Gemini client for the AI Manager Meeting.
 * Uses gemini-2.5-flash for low-latency conversational responses.
 */

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

/**
 * Safety settings - configured to be lenient for accountability conversations
 * while still blocking harmful content
 */
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

/**
 * Generation config optimized for voice conversations
 * - Low max tokens for concise responses (suitable for TTS)
 * - Moderate temperature for natural but focused responses
 */
export const voiceGenerationConfig = {
  maxOutputTokens: 500, // Keep responses short for voice
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
};

/**
 * Generation config for longer responses (summaries, etc.)
 */
export const extendedGenerationConfig = {
  maxOutputTokens: 500,
  temperature: 0.6,
  topP: 0.9,
  topK: 40,
};

/**
 * Get the Gemini model for meeting conversations
 * Uses gemini-2.5-flash for optimal latency
 */
export function getMeetingModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    safetySettings,
    generationConfig: voiceGenerationConfig,
  });
}

/**
 * Get the Gemini model for extended tasks (summaries, analysis)
 */
export function getExtendedModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    safetySettings,
    generationConfig: extendedGenerationConfig,
  });
}

/**
 * Generate a streaming response for real-time voice output
 */
export async function* generateStreamingResponse(
  prompt: string,
  systemInstruction?: string
): AsyncGenerator<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    safetySettings,
    generationConfig: voiceGenerationConfig,
    systemInstruction,
  });

  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

/**
 * Generate a complete response (non-streaming)
 */
export async function generateResponse(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    safetySettings,
    generationConfig: voiceGenerationConfig,
    systemInstruction,
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

/**
 * Generate an extended response (for summaries, etc.)
 */
export async function generateExtendedResponse(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    safetySettings,
    generationConfig: extendedGenerationConfig,
    systemInstruction,
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

export { genAI };
