"use client";

import { motion } from "framer-motion";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          {/* Step number */}
          <motion.div
            initial={false}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`text-xs font-medium w-4 text-center ${
              currentStep >= index
                ? "text-[#156d95] dark:text-white"
                : "text-black/30 dark:text-zinc-500"
            }`}
          >
            {index + 1}
          </motion.div>

          {/* Animated line between steps */}
          {index < totalSteps - 1 && (
            <div className="relative w-12 h-[2px] mx-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{
                  width: currentStep > index ? "100%" : "0%",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-[#156d95] dark:bg-white rounded-full"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
