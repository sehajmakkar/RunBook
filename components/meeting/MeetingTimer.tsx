"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface MeetingTimerProps {
  isRunning: boolean;
  startTime?: number;
  maxDurationMs?: number;
  onMaxDurationReached?: () => void;
}

export function MeetingTimer({
  isRunning,
  startTime,
  maxDurationMs = 300000, // 5 minutes default
  onMaxDurationReached,
}: MeetingTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (!isRunning || !startTime) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const newElapsed = now - startTime;
      setElapsed(newElapsed);

      // Check if max duration reached
      if (newElapsed >= maxDurationMs && onMaxDurationReached) {
        onMaxDurationReached();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, startTime, maxDurationMs, onMaxDurationReached]);

  // Calculate progress percentage
  const progress = Math.min((elapsed / maxDurationMs) * 100, 100);
  const isNearEnd = progress > 80;
  const isOvertime = elapsed >= maxDurationMs;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Timer Display */}
      <motion.div
        className={`font-mono text-2xl font-semibold tracking-wider ${
          isOvertime
            ? "text-red-400"
            : isNearEnd
              ? "text-amber-400"
              : "text-white"
        }`}
        animate={isOvertime ? { opacity: [1, 0.5, 1] } : {}}
        transition={{ duration: 0.5, repeat: isOvertime ? Infinity : 0 }}
      >
        {formatTime(elapsed)}
      </motion.div>

      {/* Progress Bar */}
      <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${
            isOvertime
              ? "bg-red-500"
              : isNearEnd
                ? "bg-amber-400"
                : "bg-[#156d95]"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Time Remaining Label */}
      <span className="text-xs text-zinc-500">
        {isOvertime
          ? "Over time"
          : `${formatTime(maxDurationMs - elapsed)} remaining`}
      </span>
    </div>
  );
}
