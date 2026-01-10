"use client";

import { motion } from "framer-motion";
import { Mic, MicOff, PhoneOff, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

interface MeetingControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onEndMeeting: () => void;
  isTranscriptExpanded: boolean;
  onToggleTranscript: () => void;
  disabled?: boolean;
}

export function MeetingControls({
  isMuted,
  onToggleMute,
  onEndMeeting,
  isTranscriptExpanded,
  onToggleTranscript,
  disabled = false,
}: MeetingControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Mute Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onToggleMute}
        disabled={disabled}
        className={`relative p-4 rounded-full transition-all ${
          isMuted
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            : "bg-zinc-800 text-white hover:bg-zinc-700"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        {isMuted && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-400"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* End Meeting Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onEndMeeting}
        disabled={disabled}
        className={`p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-label="End meeting"
      >
        <PhoneOff className="w-6 h-6" />
      </motion.button>

      {/* Toggle Transcript Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleTranscript}
        className="p-4 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-all relative"
        aria-label={isTranscriptExpanded ? "Collapse transcript" : "Expand transcript"}
      >
        <MessageSquare className="w-6 h-6" />
        <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5">
          {isTranscriptExpanded ? (
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          ) : (
            <ChevronUp className="w-3 h-3 text-zinc-400" />
          )}
        </div>
      </motion.button>
    </div>
  );
}

// Minimal controls for specific states
export function MinimalControls({
  onEndMeeting,
  label = "End Meeting",
}: {
  onEndMeeting: () => void;
  label?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onEndMeeting}
      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
    >
      <PhoneOff className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </motion.button>
  );
}
