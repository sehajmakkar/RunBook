"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Loader2 } from "lucide-react";
import {
  backdropVariants,
  modalVariants,
  buttonHover,
  buttonTap,
} from "./animations";

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  initialTime?: string;
}

// Base values for infinite scroll
const BASE_HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const BASE_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const periods = ["AM", "PM"] as const;

// Repeat arrays for infinite scroll effect (3 copies)
const REPEAT_COUNT = 3;
const hours = Array(REPEAT_COUNT).fill(BASE_HOURS).flat();
const minutes = Array(REPEAT_COUNT).fill(BASE_MINUTES).flat();

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const SCROLL_CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export function TimePickerModal({
  isOpen,
  onClose,
  onSelect,
  initialTime = "09:00 AM",
}: TimePickerModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Parse initial time (now expects format like "09:00 AM")
  const parseInitialTime = useCallback(() => {
    // Handle both "09:00" and "09:00 AM" formats
    const parts = initialTime.split(" ");
    const timePart = parts[0];
    const periodPart = parts[1] as "AM" | "PM" | undefined;

    const [hoursStr, minutesStr] = timePart.split(":");
    let hour = parseInt(hoursStr, 10);
    const minute = parseInt(minutesStr, 10) || 0;

    let period: "AM" | "PM" = periodPart || (hour >= 12 ? "PM" : "AM");

    // Convert to 12-hour format if needed
    if (hour > 12) {
      hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }

    return { hour, minute, period };
  }, [initialTime]);

  const initial = parseInitialTime();
  const [selectedHour, setSelectedHour] = useState(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState(initial.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(
    initial.period
  );

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  // Scroll to selected values when modal opens
  useEffect(() => {
    if (isOpen) {
      const initial = parseInitialTime();
      setSelectedHour(initial.hour);
      setSelectedMinute(initial.minute);
      setSelectedPeriod(initial.period);
      setIsLoading(false);

      // Scroll to initial positions (middle set for infinite scroll)
      setTimeout(() => {
        // Position in the middle set of repeated arrays
        const hourIndex = BASE_HOURS.length + BASE_HOURS.indexOf(initial.hour);
        const minuteIndex =
          BASE_MINUTES.length + BASE_MINUTES.indexOf(initial.minute);
        const periodIndex = periods.indexOf(initial.period);

        scrollToValue(hourRef, hourIndex, false);
        scrollToValue(minuteRef, minuteIndex, false);
        scrollToValue(periodRef, periodIndex, false);
      }, 100);
    }
  }, [isOpen, parseInitialTime]);

  const scrollToValue = (
    ref: React.RefObject<HTMLDivElement | null>,
    index: number,
    smooth: boolean = true
  ) => {
    if (ref.current) {
      ref.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // Handle infinite scroll wrapping
  const handleInfiniteScroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    baseLength: number
  ) => {
    if (!ref.current) return;

    const scrollTop = ref.current.scrollTop;
    const totalHeight = baseLength * REPEAT_COUNT * ITEM_HEIGHT;
    const singleSetHeight = baseLength * ITEM_HEIGHT;

    // Wrap to middle section when scrolling too far
    if (scrollTop < singleSetHeight * 0.5) {
      // Scrolled too far up, jump to middle set
      ref.current.scrollTop = scrollTop + singleSetHeight;
    } else if (scrollTop > totalHeight - singleSetHeight * 1.5) {
      // Scrolled too far down, jump to middle set
      ref.current.scrollTop = scrollTop - singleSetHeight;
    }
  };

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    values: readonly (number | string)[],
    baseValues: readonly (number | string)[],
    setter: (val: number | "AM" | "PM") => void,
    type: "hour" | "minute" | "period"
  ) => {
    if (ref.current) {
      const scrollTop = ref.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
      const value = values[clampedIndex];

      if (type === "period") {
        setter(value as "AM" | "PM");
      } else {
        setter(value as number);
      }

      // Handle infinite scroll wrapping for hours and minutes
      if (type !== "period") {
        handleInfiniteScroll(ref, baseValues.length);
      }
    }
  };

  const handleScrollEnd = (
    ref: React.RefObject<HTMLDivElement | null>,
    values: readonly (number | string)[]
  ) => {
    if (ref.current) {
      const scrollTop = ref.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
      scrollToValue(ref, clampedIndex);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);

    // Format the time string with AM/PM
    const timeString = `${selectedHour
      .toString()
      .padStart(2, "0")}:${selectedMinute
      .toString()
      .padStart(2, "0")} ${selectedPeriod}`;

    // Small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSelect(timeString);
  };

  const formatDisplay = () => {
    return `${selectedHour}:${selectedMinute
      .toString()
      .padStart(2, "0")} ${selectedPeriod}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#156d95]/10 to-[#156d95]/5 dark:from-[#156d95]/20 dark:to-[#156d95]/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#156d95]" />
                </div>
                <div>
                  <h3
                    className="font-semibold text-foreground"
                    style={{ fontFamily: "Figtree, sans-serif" }}
                  >
                    Schedule Meeting
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Daily check-in time
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                disabled={isLoading}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`
                  w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors
                  ${isLoading ? "opacity-50 pointer-events-none" : ""}
                `}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Time Display */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center py-4"
            >
              <span
                className="text-4xl font-medium text-foreground"
                style={{ fontFamily: "Figtree, sans-serif" }}
              >
                {formatDisplay()}
              </span>
            </motion.div>

            {/* Time Picker Wheels */}
            <div
              className={`relative px-8 pb-4 ${
                isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {/* Selection indicator line */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="h-12 rounded-xl bg-[#156d95]/10 dark:bg-[#156d95]/20 border-2 border-[#156d95]/30" />
              </div>

              {/* Gradient overlays for fade effect */}
              <div className="absolute left-8 right-8 top-0 h-16 bg-gradient-to-b from-white dark:from-zinc-900 to-transparent pointer-events-none z-20" />
              <div className="absolute left-8 right-8 bottom-4 h-16 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none z-20" />

              <div
                className="flex justify-center gap-2"
                style={{ height: SCROLL_CONTAINER_HEIGHT }}
              >
                {/* Hours */}
                <div
                  ref={hourRef}
                  onScroll={() =>
                    handleScroll(
                      hourRef,
                      hours,
                      BASE_HOURS,
                      setSelectedHour as (val: number | "AM" | "PM") => void,
                      "hour"
                    )
                  }
                  onMouseUp={() => handleScrollEnd(hourRef, hours)}
                  onTouchEnd={() => handleScrollEnd(hourRef, hours)}
                  className="flex-1 overflow-y-scroll scroll-smooth snap-y snap-mandatory hide-scrollbar"
                  style={{
                    paddingTop: ITEM_HEIGHT * 2,
                    paddingBottom: ITEM_HEIGHT * 2,
                  }}
                >
                  {hours.map((hour, idx) => (
                    <div
                      key={`hour-${idx}`}
                      onClick={() => {
                        setSelectedHour(hour);
                        scrollToValue(hourRef, idx);
                      }}
                      className={`
                        h-12 flex items-center justify-center cursor-pointer snap-center
                        text-2xl font-medium transition-all duration-200
                        ${
                          selectedHour === hour
                            ? "text-foreground scale-110"
                            : "text-zinc-300 dark:text-zinc-600"
                        }
                      `}
                      style={{ fontFamily: "Figtree, sans-serif" }}
                    >
                      {hour}
                    </div>
                  ))}
                </div>

                {/* Separator */}
                <div className="flex items-center justify-center text-2xl font-medium text-zinc-300 dark:text-zinc-600">
                  :
                </div>

                {/* Minutes */}
                <div
                  ref={minuteRef}
                  onScroll={() =>
                    handleScroll(
                      minuteRef,
                      minutes,
                      BASE_MINUTES,
                      setSelectedMinute as (val: number | "AM" | "PM") => void,
                      "minute"
                    )
                  }
                  onMouseUp={() => handleScrollEnd(minuteRef, minutes)}
                  onTouchEnd={() => handleScrollEnd(minuteRef, minutes)}
                  className="flex-1 overflow-y-scroll scroll-smooth snap-y snap-mandatory hide-scrollbar"
                  style={{
                    paddingTop: ITEM_HEIGHT * 2,
                    paddingBottom: ITEM_HEIGHT * 2,
                  }}
                >
                  {minutes.map((minute, idx) => (
                    <div
                      key={`minute-${idx}`}
                      onClick={() => {
                        setSelectedMinute(minute);
                        scrollToValue(minuteRef, idx);
                      }}
                      className={`
                        h-12 flex items-center justify-center cursor-pointer snap-center
                        text-2xl font-medium transition-all duration-200
                        ${
                          selectedMinute === minute
                            ? "text-foreground scale-110"
                            : "text-zinc-300 dark:text-zinc-600"
                        }
                      `}
                      style={{ fontFamily: "Figtree, sans-serif" }}
                    >
                      {minute.toString().padStart(2, "0")}
                    </div>
                  ))}
                </div>

                {/* AM/PM */}
                <div
                  ref={periodRef}
                  onScroll={() =>
                    handleScroll(
                      periodRef,
                      periods,
                      periods,
                      setSelectedPeriod as (val: number | "AM" | "PM") => void,
                      "period"
                    )
                  }
                  onMouseUp={() => handleScrollEnd(periodRef, periods)}
                  onTouchEnd={() => handleScrollEnd(periodRef, periods)}
                  className="flex-1 overflow-y-scroll scroll-smooth snap-y snap-mandatory hide-scrollbar"
                  style={{
                    paddingTop: ITEM_HEIGHT * 2,
                    paddingBottom: ITEM_HEIGHT * 2,
                  }}
                >
                  {periods.map((period) => (
                    <div
                      key={`period-${period}`}
                      onClick={() => {
                        setSelectedPeriod(period);
                        scrollToValue(periodRef, periods.indexOf(period));
                      }}
                      className={`
                        h-12 flex items-center justify-center cursor-pointer snap-center
                        text-xl font-medium transition-all duration-200
                        ${
                          selectedPeriod === period
                            ? "text-foreground scale-110"
                            : "text-zinc-300 dark:text-zinc-600"
                        }
                      `}
                      style={{ fontFamily: "Figtree, sans-serif" }}
                    >
                      {period}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="p-5 pt-2">
              <motion.button
                onClick={handleConfirm}
                disabled={isLoading}
                whileHover={!isLoading ? buttonHover : undefined}
                whileTap={!isLoading ? buttonTap : undefined}
                className={`
                  w-full py-4 px-6 rounded-2xl
                  font-medium text-lg
                  bg-gradient-to-r from-[#156d95] to-[#1a7faa] text-white
                  shadow-lg shadow-[#156d95]/25 hover:shadow-xl hover:shadow-[#156d95]/30
                  transition-all duration-300
                  flex items-center justify-center gap-2
                  ${isLoading ? "opacity-90" : ""}
                `}
                style={{ fontFamily: "Figtree, sans-serif" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Confirm Time"
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
