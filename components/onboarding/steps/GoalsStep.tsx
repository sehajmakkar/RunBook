"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Target } from "lucide-react";
import type { OnboardingStepProps } from "../OnboardingModal";
import {
  staggerContainer,
  staggerItem,
  buttonHover,
  buttonTap,
} from "../animations";

const MAX_GOALS = 3;

export function GoalsStep({
  data,
  updateData,
  nextStep,
  prevStep,
}: OnboardingStepProps) {
  const [goals, setGoals] = useState<{ title: string; id: string }[]>(
    data.goals.length > 0 ? data.goals : []
  );
  const [newGoal, setNewGoal] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when a goal is added (except when we've hit max)
  useEffect(() => {
    if (goals.length > 0 && goals.length < MAX_GOALS) {
      // Small delay to let the DOM update
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [goals.length]);

  const addGoal = () => {
    if (newGoal.trim() && goals.length < MAX_GOALS) {
      const newGoalItem = {
        title: newGoal.trim(),
        id: `goal-${Date.now()}`,
      };
      setGoals([...goals, newGoalItem]);
      setNewGoal("");
    }
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newGoal.trim()) {
      e.preventDefault();
      addGoal();
    }
  };

  const handleContinue = () => {
    updateData({ goals });
    nextStep();
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
          <Target className="w-8 h-8 text-[#156d95]" />
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h2
        variants={staggerItem}
        className="text-2xl font-semibold text-foreground mb-2"
        style={{ fontFamily: "Figtree, sans-serif" }}
      >
        Set Your Daily Goals
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={staggerItem}
        className="text-muted-foreground mb-6 max-w-sm"
      >
        Add up to {MAX_GOALS} goals you want to achieve. We&apos;ll help you
        stay accountable.
      </motion.p>

      {/* Goals List */}
      <motion.div
        variants={staggerItem}
        className="w-full max-w-sm mb-4 space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -100 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="group flex items-center gap-3 p-4 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-xl border-2 border-transparent hover:border-[#156d95]/20 transition-all duration-300"
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-[#156d95] to-[#1a7faa] flex items-center justify-center text-white text-sm font-medium">
                {index + 1}
              </div>
              <span className="flex-1 text-left text-foreground truncate">
                {goal.title}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeGoal(goal.id)}
                className="flex-shrink-0 w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Add Goal Input */}
      {goals.length < MAX_GOALS && (
        <motion.div variants={staggerItem} className="w-full max-w-sm mb-8">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={`Goal ${goals.length + 1} of ${MAX_GOALS}`}
              className={`
                flex-1 px-4 py-3 text-base
                bg-zinc-100/80 dark:bg-zinc-800/80
                border-2 border-transparent
                rounded-xl
                text-foreground placeholder:text-muted-foreground
                focus:outline-none
                transition-all duration-300
                ${
                  isFocused
                    ? "ring-2 ring-[#156d95] ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
                    : ""
                }
              `}
              style={{ fontFamily: "Figtree, sans-serif" }}
            />
            <motion.button
              onClick={addGoal}
              disabled={!newGoal.trim()}
              whileHover={newGoal.trim() ? { scale: 1.05 } : undefined}
              whileTap={newGoal.trim() ? { scale: 0.95 } : undefined}
              className={`
                flex-shrink-0 w-12 h-12 rounded-xl
                flex items-center justify-center
                transition-all duration-300
                ${
                  newGoal.trim()
                    ? "bg-gradient-to-r from-[#156d95] to-[#1a7faa] text-white shadow-lg shadow-[#156d95]/25"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                }
              `}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Spacer when all goals are added */}
      {goals.length >= MAX_GOALS && (
        <motion.div variants={staggerItem} className="mb-8" />
      )}

      {/* Buttons */}
      <motion.div variants={staggerItem} className="w-full max-w-sm flex gap-3">
        <motion.button
          onClick={prevStep}
          whileHover={buttonHover}
          whileTap={buttonTap}
          className="
            flex-1 py-4 px-6 rounded-2xl
            font-medium text-base
            bg-zinc-100 dark:bg-zinc-800
            text-foreground
            border-2 border-zinc-200 dark:border-zinc-700
            hover:border-zinc-300 dark:hover:border-zinc-600
            transition-all duration-300
          "
          style={{ fontFamily: "Figtree, sans-serif" }}
        >
          Back
        </motion.button>
        <motion.button
          onClick={handleContinue}
          whileHover={buttonHover}
          whileTap={buttonTap}
          className="
            flex-[2] py-4 px-6 rounded-2xl
            font-medium text-base
            bg-gradient-to-r from-[#156d95] to-[#1a7faa] text-white
            shadow-lg shadow-[#156d95]/25 hover:shadow-xl hover:shadow-[#156d95]/30
            transition-all duration-300
          "
          style={{ fontFamily: "Figtree, sans-serif" }}
        >
          {goals.length === 0 ? "Skip" : "Continue"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
