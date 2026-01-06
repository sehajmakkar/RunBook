"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Video, CalendarClock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { TimePickerModal } from "@/components/onboarding/TimePickerModal";

interface MeetingSchedule {
  id: string;
  time: string;
  timezone: string;
  frequency: string;
  isActive: boolean;
}

interface MeetingBannerProps {
  schedule: MeetingSchedule | null;
  onReschedule?: (newTime: string) => void;
}

// Helper function to safely parse time string
function parseTimeString(
  timeStr: string
): { hours: number; minutes: number } | null {
  if (!timeStr) return null;

  // Handle "HH:MM" format
  if (timeStr.includes(":")) {
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (!isNaN(hours) && !isNaN(minutes)) {
      return { hours, minutes };
    }
  }

  // Handle ISO date string format
  try {
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return { hours: date.getHours(), minutes: date.getMinutes() };
    }
  } catch {
    // Ignore parsing errors
  }

  return null;
}

// Dot pattern background component
function DotPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="dotPattern"
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1" fill="currentColor" fillOpacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotPattern)" />
    </svg>
  );
}

// Animated wave pattern
function WavePattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute bottom-0 left-0 w-full ${className}`}
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      <path
        d="M0,60 C300,100 400,20 600,60 C800,100 900,20 1200,60 L1200,120 L0,120 Z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M0,80 C200,40 400,100 600,80 C800,60 1000,100 1200,80 L1200,120 L0,120 Z"
        fill="currentColor"
        fillOpacity="0.05"
      />
    </svg>
  );
}

// Floating shapes for visual interest
function FloatingShapes() {
  return (
    <>
      {/* Large blurred circle */}
      <motion.div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-[#1a8fc4]/30 to-[#156d95]/10 blur-2xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Small accent circle */}
      {/* <motion.div
        className="absolute top-4 right-20 w-3 h-3 rounded-full bg-[#5bb4db]"
        animate={{
          y: [0, -5, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      /> */}
      {/* Medium circle */}
      {/* <motion.div
        className="absolute bottom-6 right-40 w-2 h-2 rounded-full bg-[#156d95]/60"
        animate={{
          y: [0, 5, 0],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      /> */}
      {/* Diagonal line accent */}
      <div className="absolute top-0 right-32 w-px h-16 bg-gradient-to-b from-transparent via-[#156d95]/20 to-transparent rotate-45" />
      <div className="absolute bottom-0 right-48 w-px h-12 bg-gradient-to-b from-transparent via-[#5bb4db]/30 to-transparent -rotate-45" />
    </>
  );
}

export function MeetingBanner({ schedule, onReschedule }: MeetingBannerProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState<string>("");
  const [nextMeetingDate, setNextMeetingDate] = useState<Date | null>(null);
  const [isMeetingTime, setIsMeetingTime] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (!schedule?.time) return;

    const calculateNextMeeting = () => {
      const now = new Date();
      const parsed = parseTimeString(schedule.time);

      if (!parsed) {
        console.error("Failed to parse time:", schedule.time);
        return;
      }

      const { hours, minutes } = parsed;

      const todayMeeting = new Date();
      todayMeeting.setHours(hours, minutes, 0, 0);

      let nextMeeting: Date;
      if (now > todayMeeting) {
        nextMeeting = new Date(todayMeeting);
        nextMeeting.setDate(nextMeeting.getDate() + 1);
      } else {
        nextMeeting = todayMeeting;
      }

      setNextMeetingDate(nextMeeting);
    };

    calculateNextMeeting();
  }, [schedule]);

  useEffect(() => {
    if (!nextMeetingDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = nextMeetingDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown("Starting now!");
        setIsMeetingTime(true);
        return;
      }

      const fifteenMinutes = 15 * 60 * 1000;
      setIsMeetingTime(diff <= fifteenMinutes);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextMeetingDate]);

  const formatMeetingTime = () => {
    if (!nextMeetingDate || isNaN(nextMeetingDate.getTime()))
      return "Not scheduled";

    return nextMeetingDate.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleReschedule = (newTime: string) => {
    setShowTimePicker(false);
    if (onReschedule) {
      onReschedule(newTime);
    }
  };

  // No schedule state - CTA style
  if (!schedule) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Gradient border effect */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[#156d95]/60 via-[#1a8fc4]/40 to-[#5bb4db]/60" />

        {/* Main content container */}
        <div className="relative m-px rounded-2xl bg-gradient-to-br from-[#0c3d52] via-[#114a63] to-[#156d95] p-6 sm:p-8">
          {/* Background patterns */}
          <DotPattern className="text-white opacity-30" />
          <WavePattern className="text-[#5bb4db] h-24" />
          <FloatingShapes />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Icon and Text */}
            <div className="flex items-center gap-4 text-center sm:text-left">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <CalendarClock className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Ready to Stay Accountable?
                </h3>
                <p className="text-[#a8d4e8] text-sm max-w-md">
                  Set up your daily AI-powered check-in and never lose track of
                  your goals again.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 40px rgba(21, 109, 149, 0.4)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/meeting")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#156d95] font-semibold shadow-lg shadow-black/20 hover:bg-[#f0f9fc] transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Schedule Your First Meeting
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Has schedule - Dynamic banner with same CTA style
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Gradient border effect - animated when meeting time */}
      <motion.div
        className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[#156d95]/60 via-[#1a8fc4]/40 to-[#5bb4db]/60"
        animate={
          isMeetingTime
            ? {
                opacity: [0.6, 1, 0.6],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main content container - Light mode: brand gradient, Dark mode: dark gradient */}
      <div
        className={`relative m-px rounded-2xl p-6 sm:p-8 ${
          isMeetingTime
            ? "bg-gradient-to-br from-[#0c3d52] via-[#114a63] to-[#156d95]"
            : "bg-gradient-to-br from-[#e8f4f8] via-[#d4ebf2] to-[#c0e2ed] dark:from-[#0c3d52] dark:via-[#114a63] dark:to-[#156d95]"
        }`}
      >
        {/* Background patterns */}
        <DotPattern
          className={
            isMeetingTime
              ? "text-white opacity-20"
              : "text-[#156d95] opacity-20 dark:text-white dark:opacity-30"
          }
        />
        <WavePattern
          className={
            isMeetingTime
              ? "text-[#5bb4db] h-24"
              : "text-[#156d95] h-24 dark:text-[#5bb4db]"
          }
        />
        <FloatingShapes />

        {/* Grid pattern overlay */}
        <div
          className={`absolute inset-0 ${
            isMeetingTime
              ? "opacity-[0.03]"
              : "opacity-[0.05] dark:opacity-[0.03]"
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(21, 109, 149, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(21, 109, 149, 0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Meeting Info Section */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            {/* Animated Icon */}
            <motion.div
              className={`relative w-14 h-14 rounded-2xl flex items-center justify-center ${
                isMeetingTime
                  ? "bg-white/20 backdrop-blur-sm border border-white/30"
                  : "bg-[#156d95]/10 backdrop-blur-sm border border-[#156d95]/20 dark:bg-white/10 dark:border-white/20"
              }`}
              whileHover={{ scale: 1.05, rotate: 5 }}
              animate={
                isMeetingTime
                  ? {
                      boxShadow: [
                        "0 0 0 0 rgba(91, 180, 219, 0.4)",
                        "0 0 0 10px rgba(91, 180, 219, 0)",
                      ],
                    }
                  : {}
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            >
              <Video
                className={`w-7 h-7 ${
                  isMeetingTime
                    ? "text-white"
                    : "text-[#156d95] dark:text-white"
                }`}
              />
              {isMeetingTime && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Text Content */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`text-xl font-bold ${
                    isMeetingTime
                      ? "text-white"
                      : "text-[#0c3d52] dark:text-white"
                  }`}
                >
                  {isMeetingTime ? "Your Check-in Awaits!" : "Next AI Check-in"}
                </h3>
                {isMeetingTime && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-3 py-1 rounded-full bg-green-400/20 text-green-300 text-xs font-semibold border border-green-400/30"
                  >
                    Starting Soon
                  </motion.span>
                )}
              </div>
              <p
                className={`text-sm flex items-center gap-1.5 ${
                  isMeetingTime
                    ? "text-[#a8d4e8]"
                    : "text-[#156d95]/80 dark:text-[#a8d4e8]"
                }`}
              >
                <Calendar className="w-4 h-4" />
                {formatMeetingTime()}
              </p>
            </div>
          </div>

          {/* Countdown & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            {/* Countdown Box */}
            <div
              className={`flex-1 sm:flex-initial text-center px-6 py-1 rounded-xl backdrop-blur-sm ${
                isMeetingTime
                  ? "bg-white/10 border border-white/20"
                  : "bg-[#156d95]/10 border border-[#156d95]/20 dark:bg-white/10 dark:border-white/20"
              }`}
            >
              <p
                className={`text-xs uppercase tracking-wider ${
                  isMeetingTime
                    ? "text-[#a8d4e8]"
                    : "text-[#156d95]/60 dark:text-[#a8d4e8]"
                }`}
              >
                Countdown
              </p>
              <motion.p
                key={countdown}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xl font-bold font-mono ${
                  isMeetingTime
                    ? "text-white"
                    : "text-[#156d95] dark:text-white"
                }`}
              >
                {countdown || "..."}
              </motion.p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 40px rgba(21, 109, 149, 0.4)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/meeting")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold shadow-lg transition-all ${
                  isMeetingTime
                    ? "bg-white text-[#156d95] shadow-black/20 hover:bg-[#f0f9fc]"
                    : "bg-[#156d95] text-white shadow-[#156d95]/30 hover:bg-[#125a7d] dark:bg-white dark:text-[#156d95] dark:shadow-black/20 dark:hover:bg-[#f0f9fc]"
                }`}
              >
                <Video className="w-4 h-4" />
                Join Meeting
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTimePicker(true)}
                className={`px-5 py-3 rounded-xl font-medium transition-all ${
                  isMeetingTime
                    ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    : "bg-white/60 text-[#156d95] border border-[#156d95]/20 hover:bg-white/80 dark:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/20"
                }`}
              >
                Reschedule
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Time Picker Modal for Rescheduling */}
      <TimePickerModal
        isOpen={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelect={handleReschedule}
        initialTime={schedule?.time || "09:00"}
      />
    </motion.div>
  );
}
