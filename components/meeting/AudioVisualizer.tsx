"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AudioVisualizerProps {
  isActive: boolean;
  type: "user" | "ai";
  intensity?: number; // 0-1 for manual control
}

export function AudioVisualizer({
  isActive,
  type,
  intensity = 0.5,
}: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>([0.3, 0.5, 0.7, 0.5, 0.3]);

  useEffect(() => {
    if (!isActive) {
      setBars([0.15, 0.15, 0.15, 0.15, 0.15]);
      return;
    }

    const interval = setInterval(() => {
      setBars(
        Array.from({ length: 5 }, () =>
          Math.max(0.15, Math.min(1, intensity * (0.5 + Math.random() * 0.5)))
        )
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, intensity]);

  const baseColor = type === "ai" ? "#156d95" : "#22c55e";
  const glowColor = type === "ai" ? "rgba(21, 109, 149, 0.4)" : "rgba(34, 197, 94, 0.4)";

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full"
          style={{
            backgroundColor: baseColor,
            boxShadow: isActive ? `0 0 8px ${glowColor}` : "none",
          }}
          animate={{
            height: `${height * 48}px`,
            opacity: isActive ? 0.8 + height * 0.2 : 0.3,
          }}
          transition={{
            duration: 0.1,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Larger circular visualizer for the main AI indicator
export function AIPresenceIndicator({
  state,
}: {
  state: "idle" | "listening" | "thinking" | "speaking";
}) {
  const stateConfig = {
    idle: {
      scale: 1,
      opacity: 0.3,
      pulseSpeed: 3,
      color: "#156d95",
    },
    listening: {
      scale: 1.05,
      opacity: 0.6,
      pulseSpeed: 1.5,
      color: "#22c55e",
    },
    thinking: {
      scale: 1.1,
      opacity: 0.8,
      pulseSpeed: 0.8,
      color: "#f59e0b",
    },
    speaking: {
      scale: 1.15,
      opacity: 1,
      pulseSpeed: 0.5,
      color: "#156d95",
    },
  };

  const config = stateConfig[state];

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        className="absolute w-32 h-32 rounded-full"
        style={{
          background: `radial-gradient(circle, ${config.color}20 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [config.opacity * 0.5, config.opacity * 0.2, config.opacity * 0.5],
        }}
        transition={{
          duration: config.pulseSpeed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute w-24 h-24 rounded-full border-2"
        style={{ borderColor: config.color }}
        animate={{
          scale: [1, config.scale, 1],
          opacity: [config.opacity * 0.6, config.opacity, config.opacity * 0.6],
        }}
        transition={{
          duration: config.pulseSpeed * 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner core */}
      <motion.div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${config.color}, ${config.color}80)`,
          boxShadow: `0 0 30px ${config.color}40`,
        }}
        animate={{
          scale: [1, config.scale * 0.95, 1],
        }}
        transition={{
          duration: config.pulseSpeed * 0.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* State indicator icon */}
        <StateIcon state={state} />
      </motion.div>
    </div>
  );
}

function StateIcon({ state }: { state: "idle" | "listening" | "thinking" | "speaking" }) {
  if (state === "thinking") {
    return (
      <motion.div
        className="flex gap-1"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-white rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </motion.div>
    );
  }

  if (state === "speaking") {
    return (
      <div className="flex gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1 bg-white rounded-full"
            animate={{
              height: [8, 16 + Math.random() * 8, 8],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    );
  }

  if (state === "listening") {
    return (
      <motion.div
        className="w-4 h-4 border-2 border-white rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    );
  }

  // Idle
  return <div className="w-3 h-3 bg-white/50 rounded-full" />;
}
