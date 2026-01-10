// Meeting UI Types

export type MeetingUIState =
  | "READY"        // Meeting can start
  | "CONNECTING"   // Establishing connection
  | "IN_PROGRESS"  // Active meeting
  | "AI_SPEAKING"  // AI is talking
  | "USER_SPEAKING" // User is talking
  | "PROCESSING"   // AI thinking
  | "ENDING"       // Meeting concluding
  | "COMPLETED";   // Meeting finished

export interface TranscriptEntry {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
  isInterim?: boolean; // For real-time STT interim results
}

export interface MeetingData {
  id: string;
  status: string;
  phase: string;
  startedAt: string;
  transcript: TranscriptEntry[];
  summary?: string;
  observations?: {
    patterns: string[];
    risks: string[];
    improvements: string[];
  };
}

export interface CommitmentPreview {
  id: string;
  title: string;
  type: "DAILY" | "WEEKLY" | "MONTHLY";
  priority: "DEFAULT" | "LOW" | "HIGH" | "URGENT";
  status: "ACTIVE" | "COMPLETED" | "ABANDONED";
}

export interface MeetingConfig {
  maxDurationMs: number;
  phases: {
    name: string;
    estimatedDuration: string;
  }[];
}

export const DEFAULT_MEETING_CONFIG: MeetingConfig = {
  maxDurationMs: 300000, // 5 minutes
  phases: [
    { name: "Opening", estimatedDuration: "15-20s" },
    { name: "Progress Review", estimatedDuration: "1-2min" },
    { name: "Blocker Discussion", estimatedDuration: "45s-1min" },
    { name: "Commitment Lock-In", estimatedDuration: "45s-1min" },
    { name: "Closing", estimatedDuration: "15-20s" },
  ],
};
