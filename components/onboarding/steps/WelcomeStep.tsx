"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { OnboardingStepProps } from "../OnboardingModal";
import {
  staggerContainer,
  staggerItem,
  buttonHover,
  buttonTap,
} from "../animations";

export function WelcomeStep({
  data,
  updateData,
  nextStep,
}: OnboardingStepProps) {
  const [name, setName] = useState(data.name);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the input after animation
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (name.trim()) {
      updateData({ name: name.trim() });
      nextStep();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      handleContinue();
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center text-center"
    >
      {/* Icon */}
      <motion.div variants={staggerItem} className="mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#156d95]/10 to-[#156d95]/5 dark:from-[#156d95]/20 dark:to-[#156d95]/10 flex items-center justify-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl"
          >
            👋
          </motion.span>
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h2
        variants={staggerItem}
        className="text-2xl font-semibold text-foreground mb-2"
        style={{ fontFamily: "Figtree, sans-serif" }}
      >
        Welcome to RunBook
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={staggerItem}
        className="text-muted-foreground mb-8 max-w-sm"
      >
        Your AI accountability manager is here to help you achieve your goals.
        What should we call you?
      </motion.p>

      {/* Name Input */}
      <motion.div variants={staggerItem} className="w-full max-w-sm mb-6">
        <div
          className={`
            relative rounded-2xl transition-all duration-300
            ${
              isFocused
                ? "ring-2 ring-[#156d95] ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
                : ""
            }
          `}
        >
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your name"
            className="
              w-full px-5 py-4 text-lg
              bg-zinc-100/80 dark:bg-zinc-800/80
              border-2 border-transparent
              rounded-2xl
              text-foreground placeholder:text-muted-foreground
              focus:outline-none
              transition-all duration-300
            "
            style={{ fontFamily: "Figtree, sans-serif" }}
          />

          {/* Animated underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isFocused ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-[#156d95]/0 via-[#156d95] to-[#156d95]/0 rounded-full origin-center"
          />
        </div>
      </motion.div>

      {/* Continue Button */}
      <motion.div variants={staggerItem} className="w-full max-w-sm">
        <motion.button
          onClick={handleContinue}
          disabled={!name.trim()}
          whileHover={name.trim() ? buttonHover : undefined}
          whileTap={name.trim() ? buttonTap : undefined}
          className={`
            w-full py-4 px-6 rounded-2xl
            font-medium text-lg
            transition-all duration-300
            ${
              name.trim()
                ? "bg-gradient-to-r from-[#156d95] to-[#1a7faa] text-white shadow-lg shadow-[#156d95]/25 hover:shadow-xl hover:shadow-[#156d95]/30"
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
            }
          `}
          style={{ fontFamily: "Figtree, sans-serif" }}
        >
          Continue
        </motion.button>
      </motion.div>

      {/* Skip option */}
      <motion.button
        variants={staggerItem}
        onClick={() => {
          updateData({ name: "Friend" });
          nextStep();
        }}
        className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
      >
        Skip for now
      </motion.button>
    </motion.div>
  );
}
