"use client";

import { motion } from "framer-motion";
import { MeetingTimer } from "./MeetingTimer";
import { AIPresenceIndicator } from "./AudioVisualizer";
import { TranscriptPanel, TranscriptMinimal } from "./TranscriptPanel";
import { MeetingControls } from "./MeetingControls";
import type { MeetingUIState, TranscriptEntry } from "./types";

interface MeetingRoomProps {
  state: MeetingUIState;
  transcript: TranscriptEntry[];
  startTime: number;
  isMuted: boolean;
  isTranscriptExpanded: boolean;
  currentPhase?: string;
  onToggleMute: () => void;
  onEndMeeting: () => void;
  onToggleTranscript: () => void;
  onMaxDurationReached: () => void;
}

export function MeetingRoom({
  state,
  transcript,
  startTime,
  isMuted,
  isTranscriptExpanded,
  currentPhase,
  onToggleMute,
  onEndMeeting,
  onToggleTranscript,
  onMaxDurationReached,
}: MeetingRoomProps) {
  // Map UI state to AI presence indicator state
  const getAIState = (): "idle" | "listening" | "thinking" | "speaking" => {
    switch (state) {
      case "AI_SPEAKING":
        return "speaking";
      case "USER_SPEAKING":
        return "listening";
      case "PROCESSING":
        return "thinking";
      default:
        return "idle";
    }
  };

  // Get status message based on state
  const getStatusMessage = (): string => {
    switch (state) {
      case "AI_SPEAKING":
        return "AI Manager is speaking...";
      case "USER_SPEAKING":
        return "Listening to you...";
      case "PROCESSING":
        return "Processing...";
      case "ENDING":
        return "Ending meeting...";
      default:
        return "In progress";
    }
  };

  const lastEntry = transcript.length > 0 ? transcript[transcript.length - 1] : null;

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial gradient from center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#156d95]/10 via-transparent to-transparent" />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-zinc-400">
            Meeting in progress
          </span>
          {currentPhase && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
              {formatPhase(currentPhase)}
            </span>
          )}
        </div>
        
        <MeetingTimer
          isRunning={state !== "ENDING" && state !== "COMPLETED"}
          startTime={startTime}
          maxDurationMs={300000} // 5 minutes
          onMaxDurationReached={onMaxDurationReached}
        />
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* AI Presence Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <AIPresenceIndicator state={getAIState()} />
        </motion.div>

        {/* Status Message */}
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <p className="text-zinc-400 text-sm">{getStatusMessage()}</p>
        </motion.div>

        {/* Last Transcript Entry (Minimal View) */}
        {!isTranscriptExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-md px-4 py-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50"
          >
            <TranscriptMinimal lastEntry={lastEntry} />
          </motion.div>
        )}
      </main>

      {/* Bottom Section */}
      <footer className="relative z-10 px-6 pb-6 space-y-4">
        {/* Expanded Transcript Panel */}
        {isTranscriptExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <TranscriptPanel
              entries={transcript}
              isExpanded={true}
              onToggleExpand={onToggleTranscript}
            />
          </motion.div>
        )}

        {/* Controls */}
        <MeetingControls
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          onEndMeeting={onEndMeeting}
          isTranscriptExpanded={isTranscriptExpanded}
          onToggleTranscript={onToggleTranscript}
          disabled={state === "ENDING"}
        />

        {/* Mute Warning */}
        {isMuted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="text-xs text-amber-400/80">
              You are muted. The AI cannot hear you.
            </span>
          </motion.div>
        )}
      </footer>
    </div>
  );
}

// Helper to format phase name
function formatPhase(phase: string): string {
  const phaseMap: Record<string, string> = {
    OPENING: "Opening",
    PROGRESS_REVIEW: "Review",
    BLOCKER_DISCUSSION: "Blockers",
    CONFRONTATION: "Discussion",
    COMMITMENT_LOCK_IN: "Commitments",
    CLOSING: "Closing",
  };
  return phaseMap[phase] || phase;
}
