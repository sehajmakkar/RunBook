"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TranscriptEntry } from "./types";

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function TranscriptPanel({
  entries,
  isExpanded = false,
  onToggleExpand,
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <motion.div
      className={`bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden transition-all ${
        isExpanded ? "h-80" : "h-40"
      }`}
      layout
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Live Transcript
        </span>
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        )}
      </div>

      {/* Transcript Content */}
      <div
        ref={scrollRef}
        className={`overflow-y-auto px-4 py-3 space-y-3 ${
          isExpanded ? "h-[calc(100%-40px)]" : "h-[calc(100%-40px)]"
        }`}
      >
        <AnimatePresence mode="popLayout">
          {entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-zinc-600 text-sm text-center py-4"
            >
              Transcript will appear here...
            </motion.div>
          ) : (
            entries.map((entry) => (
              <TranscriptEntry key={entry.id} entry={entry} />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TranscriptEntry({ entry }: { entry: TranscriptEntry }) {
  const isAI = entry.role === "ai";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: entry.isInterim ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
          isAI
            ? "bg-[#156d95]/20 text-[#156d95]"
            : "bg-emerald-500/20 text-emerald-400"
        }`}
      >
        {isAI ? "AI" : "U"}
      </div>

      {/* Message */}
      <div
        className={`flex-1 ${isAI ? "text-left" : "text-right"}`}
      >
        <p
          className={`text-sm leading-relaxed ${
            entry.isInterim
              ? "text-zinc-500 italic"
              : isAI
                ? "text-zinc-300"
                : "text-zinc-400"
          }`}
        >
          {entry.content}
          {entry.isInterim && (
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="ml-1"
            >
              ...
            </motion.span>
          )}
        </p>
        <span className="text-[10px] text-zinc-600 mt-0.5 block">
          {formatTimestamp(entry.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

// Compact transcript for the minimal view
export function TranscriptMinimal({
  lastEntry,
}: {
  lastEntry: TranscriptEntry | null;
}) {
  if (!lastEntry) {
    return (
      <div className="text-zinc-600 text-sm">Waiting for conversation...</div>
    );
  }

  const isAI = lastEntry.role === "ai";

  return (
    <motion.div
      key={lastEntry.id}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2"
    >
      <span
        className={`text-xs font-medium ${
          isAI ? "text-[#156d95]" : "text-emerald-400"
        }`}
      >
        {isAI ? "AI:" : "You:"}
      </span>
      <p className="text-sm text-zinc-400 line-clamp-2">{lastEntry.content}</p>
    </motion.div>
  );
}
