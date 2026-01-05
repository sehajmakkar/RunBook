"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import type { OnboardingStepProps } from "../OnboardingModal";
import {
  staggerContainer,
  staggerItem,
  buttonHover,
  buttonTap,
} from "../animations";
import { TimePickerModal } from "../TimePickerModal";

export function MeetingChoiceStep({
  data,
  updateData,
  prevStep,
  onComplete,
}: OnboardingStepProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<
    "try" | "schedule" | null
  >(data.meetingChoice);
  const [isLoading, setIsLoading] = useState(false);

  const handleTryMeeting = () => {
    setSelectedChoice("try");
    // Set default 9 AM time for "try" option - will be saved to DB
    updateData({ meetingChoice: "try", scheduledTime: "09:00 AM" });
  };

  const handleSchedule = () => {
    setSelectedChoice("schedule");
    setShowTimePicker(true);
  };

  const handleTimeSelected = async (time: string) => {
    updateData({ meetingChoice: "schedule", scheduledTime: time });
    setShowTimePicker(false);
  };

  const handleComplete = async () => {
    if (!selectedChoice) return;

    setIsLoading(true);

    // Ensure data is updated before completing
    if (selectedChoice === "try") {
      updateData({ meetingChoice: "try", scheduledTime: "09:00 AM" });
    }

    // Small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 500));

    onComplete();
  };

  return (
    <>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center text-center"
      >
        {/* Icon */}
        <motion.div variants={staggerItem} className="mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#156d95]/10 to-[#156d95]/5 dark:from-[#156d95]/20 dark:to-[#156d95]/10 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-[#156d95]" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          variants={staggerItem}
          className="text-2xl font-semibold text-foreground mb-2"
          style={{ fontFamily: "Figtree, sans-serif" }}
        >
          Ready for Accountability?
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={staggerItem}
          className="text-muted-foreground mb-8 max-w-sm"
        >
          Schedule daily check-ins with your AI manager, or try a meeting right
          now.
        </motion.p>

        {/* Choice Cards */}
        <motion.div
          variants={staggerItem}
          className="w-full max-w-sm space-y-4 mb-6"
        >
          {/* Try Meeting Now Card */}
          <motion.button
            onClick={handleTryMeeting}
            disabled={isLoading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full p-5 rounded-2xl text-left
              transition-all duration-300
              border-2
              ${
                selectedChoice === "try"
                  ? "border-[#156d95] bg-[#156d95]/5 dark:bg-[#156d95]/10"
                  : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:border-[#156d95]/50"
              }
              ${isLoading ? "opacity-60 pointer-events-none" : ""}
            `}
          >
            <div className="flex items-start gap-4">
              <div
                className={`
                flex-shrink-0 w-12 h-12 rounded-xl
                flex items-center justify-center
                transition-all duration-300
                ${
                  selectedChoice === "try"
                    ? "bg-gradient-to-br from-[#156d95] to-[#1a7faa] text-white"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                }
              `}
              >
                <Video className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3
                  className="font-semibold text-foreground mb-1"
                  style={{ fontFamily: "Figtree, sans-serif" }}
                >
                  Try a Meeting Now
                </h3>
                <p className="text-sm text-muted-foreground">
                  Experience your first accountability check-in right away
                </p>
              </div>
              <AnimatePresence>
                {selectedChoice === "try" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-[#156d95] flex items-center justify-center"
                  >
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>

          {/* Schedule Daily Card */}
          <motion.button
            onClick={handleSchedule}
            disabled={isLoading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full p-5 rounded-2xl text-left
              transition-all duration-300
              border-2
              ${
                selectedChoice === "schedule"
                  ? "border-[#156d95] bg-[#156d95]/5 dark:bg-[#156d95]/10"
                  : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:border-[#156d95]/50"
              }
              ${isLoading ? "opacity-60 pointer-events-none" : ""}
            `}
          >
            <div className="flex items-start gap-4">
              <div
                className={`
                flex-shrink-0 w-12 h-12 rounded-xl
                flex items-center justify-center
                transition-all duration-300
                ${
                  selectedChoice === "schedule"
                    ? "bg-gradient-to-br from-[#156d95] to-[#1a7faa] text-white"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                }
              `}
              >
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3
                  className="font-semibold text-foreground mb-1"
                  style={{ fontFamily: "Figtree, sans-serif" }}
                >
                  Schedule Daily Check-ins
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pick a time for your daily accountability meeting
                </p>
                {data.scheduledTime && selectedChoice === "schedule" && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#156d95]/10 dark:bg-[#156d95]/20 rounded-lg"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#156d95]" />
                    <span className="text-sm font-medium text-[#156d95]">
                      {data.scheduledTime}
                    </span>
                  </motion.div>
                )}
              </div>
              <AnimatePresence>
                {selectedChoice === "schedule" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-[#156d95] flex items-center justify-center"
                  >
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        </motion.div>

        {/* Buttons */}
        <motion.div
          variants={staggerItem}
          className="w-full max-w-sm flex gap-3"
        >
          <motion.button
            onClick={prevStep}
            disabled={isLoading}
            whileHover={buttonHover}
            whileTap={buttonTap}
            className={`
              flex-1 py-4 px-6 rounded-2xl
              font-medium text-base
              bg-zinc-100 dark:bg-zinc-800
              text-foreground
              border-2 border-zinc-200 dark:border-zinc-700
              hover:border-zinc-300 dark:hover:border-zinc-600
              transition-all duration-300
              ${isLoading ? "opacity-60 pointer-events-none" : ""}
            `}
            style={{ fontFamily: "Figtree, sans-serif" }}
          >
            Back
          </motion.button>
          <motion.button
            onClick={handleComplete}
            disabled={!selectedChoice || isLoading}
            whileHover={selectedChoice && !isLoading ? buttonHover : undefined}
            whileTap={selectedChoice && !isLoading ? buttonTap : undefined}
            className={`
              flex-2 py-4 px-6 rounded-2xl
              font-medium text-base
              flex items-center justify-center gap-2
              transition-all duration-300
              ${
                selectedChoice && !isLoading
                  ? "bg-linear-to-r from-[#156d95] to-[#1a7faa] text-white shadow-lg shadow-[#156d95]/25 hover:shadow-xl hover:shadow-[#156d95]/30"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
              }
            `}
            style={{ fontFamily: "Figtree, sans-serif" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : selectedChoice === "try" ? (
              <>
                Start Meeting
                <ArrowRight className="w-5 h-5" />
              </>
            ) : selectedChoice === "schedule" ? (
              "Continue"
            ) : (
              "Choose an option"
            )}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Time Picker Modal */}
      <TimePickerModal
        isOpen={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelect={handleTimeSelected}
        initialTime={data.scheduledTime || "09:00 AM"}
      />
    </>
  );
}
