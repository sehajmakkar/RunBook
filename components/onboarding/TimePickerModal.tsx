"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
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

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const PERIODS: ("AM" | "PM")[] = ["AM", "PM"];

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

interface WheelColumnProps {
  items: (number | string)[];
  selectedValue: number | string;
  onSelect: (value: number | string) => void;
  formatValue?: (value: number | string) => string;
  infinite?: boolean;
}

function WheelColumn({
  items,
  selectedValue,
  onSelect,
  formatValue = (v) => String(v),
  infinite = true,
}: WheelColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isWheelScrolling = useRef(false);

  // For infinite scroll, we repeat the items
  const repeatedItems = infinite ? [...items, ...items, ...items] : items;
  const baseOffset = infinite ? items.length : 0;

  const getSelectedIndex = useCallback(() => {
    const idx = items.indexOf(selectedValue);
    return idx >= 0 ? idx + baseOffset : baseOffset;
  }, [items, selectedValue, baseOffset]);

  // Scroll to position
  const scrollToIndex = useCallback((index: number, smooth = false) => {
    if (containerRef.current) {
      const scrollTop = index * ITEM_HEIGHT;
      containerRef.current.scrollTo({
        top: scrollTop,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Initialize scroll position
  useEffect(() => {
    const idx = getSelectedIndex();
    // Small delay to ensure DOM is ready
    requestAnimationFrame(() => {
      scrollToIndex(idx, false);
    });
  }, [getSelectedIndex, scrollToIndex]);

  // Handle scroll end - snap to nearest item
  const handleScrollEnd = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, repeatedItems.length - 1));

    // Get the actual value
    const actualIndex = clampedIndex % items.length;
    const value = items[actualIndex];

    // Update selection
    onSelect(value);

    // Snap to position
    scrollToIndex(clampedIndex, true);

    // For infinite scroll, reset to middle section if needed
    if (infinite) {
      setTimeout(() => {
        if (!containerRef.current) return;
        const currentScroll = containerRef.current.scrollTop;
        const singleSetHeight = items.length * ITEM_HEIGHT;

        if (currentScroll < singleSetHeight * 0.5) {
          scrollToIndex(actualIndex + items.length, false);
        } else if (currentScroll > singleSetHeight * 2.5) {
          scrollToIndex(actualIndex + items.length, false);
        }
      }, 150);
    }

    isWheelScrolling.current = false;
  }, [items, repeatedItems.length, infinite, onSelect, scrollToIndex]);

  // Handle scroll event
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(handleScrollEnd, 100);
  }, [handleScrollEnd]);

  // Handle wheel event with controlled delta - one item per scroll
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!containerRef.current || isWheelScrolling.current) return;

      isWheelScrolling.current = true;

      // Single item per scroll action
      const direction = e.deltaY > 0 ? 1 : -1;
      const currentIndex = Math.round(
        containerRef.current.scrollTop / ITEM_HEIGHT
      );
      const newIndex = Math.max(
        0,
        Math.min(currentIndex + direction, repeatedItems.length - 1)
      );

      scrollToIndex(newIndex, true);

      // Clear any existing timeout and set new one
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(handleScrollEnd, 200);
    },
    [repeatedItems.length, scrollToIndex, handleScrollEnd]
  );

  // Click to select
  const handleItemClick = useCallback(
    (index: number) => {
      const actualIndex = index % items.length;
      const value = items[actualIndex];
      onSelect(value);
      scrollToIndex(index, true);
    },
    [items, onSelect, scrollToIndex]
  );

  return (
    <div className="relative h-[220px] w-[70px]">
      {/* Fade overlays */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white dark:from-zinc-900 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none z-10" />

      {/* Selection highlight */}
      <div
        className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Scrollable container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        className="h-full overflow-y-auto overscroll-contain scrollbar-none"
        style={{
          paddingTop: CENTER_INDEX * ITEM_HEIGHT,
          paddingBottom: CENTER_INDEX * ITEM_HEIGHT,
          scrollBehavior: "auto",
        }}
      >
        {repeatedItems.map((item, idx) => {
          const isSelected = item === selectedValue;
          return (
            <div
              key={`${item}-${idx}`}
              onClick={() => handleItemClick(idx)}
              className="h-11 flex items-center justify-center cursor-pointer select-none"
            >
              <span
                className={`
                  text-xl font-medium transition-all duration-150
                  ${
                    isSelected
                      ? "text-zinc-900 dark:text-white scale-105"
                      : "text-zinc-400 dark:text-zinc-500"
                  }
                `}
                style={{ fontFamily: "Figtree, sans-serif" }}
              >
                {formatValue(item)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TimePickerModal({
  isOpen,
  onClose,
  onSelect,
  initialTime = "09:00 AM",
}: TimePickerModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Parse initial time
  const parseInitialTime = useCallback(() => {
    const parts = initialTime.split(" ");
    const timePart = parts[0];
    const periodPart = parts[1] as "AM" | "PM" | undefined;

    const [hoursStr, minutesStr] = timePart.split(":");
    let hour = parseInt(hoursStr, 10);
    const minute = parseInt(minutesStr, 10) || 0;

    let period: "AM" | "PM" = periodPart || (hour >= 12 ? "PM" : "AM");

    if (hour > 12) hour -= 12;
    else if (hour === 0) hour = 12;

    // Round minute to nearest 5
    const roundedMinute = Math.round(minute / 5) * 5;

    return {
      hour,
      minute: roundedMinute >= 60 ? 55 : roundedMinute,
      period,
    };
  }, [initialTime]);

  const initial = parseInitialTime();
  const [selectedHour, setSelectedHour] = useState(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState(initial.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(
    initial.period
  );

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      const init = parseInitialTime();
      setSelectedHour(init.hour);
      setSelectedMinute(init.minute);
      setSelectedPeriod(init.period);
      setIsLoading(false);
    }
  }, [isOpen, parseInitialTime]);

  const handleConfirm = async () => {
    setIsLoading(true);

    const timeString = `${selectedHour
      .toString()
      .padStart(2, "0")}:${selectedMinute
      .toString()
      .padStart(2, "0")} ${selectedPeriod}`;

    await new Promise((resolve) => setTimeout(resolve, 300));
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[320px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <h3
                className="text-lg font-semibold text-zinc-900 dark:text-white"
                style={{ fontFamily: "Figtree, sans-serif" }}
              >
                Set Time
              </h3>
              <motion.button
                onClick={onClose}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Time Display */}
            <div className="text-center py-3">
              <span
                className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-wide"
                style={{ fontFamily: "Figtree, sans-serif" }}
              >
                {formatDisplay()}
              </span>
            </div>

            {/* Time Picker */}
            <div
              className={`px-4 pb-4 ${
                isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                {/* Hours */}
                <WheelColumn
                  items={HOURS}
                  selectedValue={selectedHour}
                  onSelect={(v) => setSelectedHour(v as number)}
                  formatValue={(v) => String(v).padStart(2, "0")}
                  infinite={true}
                />

                {/* Separator */}
                <div className="text-2xl font-semibold text-zinc-300 dark:text-zinc-600 px-1">
                  :
                </div>

                {/* Minutes */}
                <WheelColumn
                  items={MINUTES}
                  selectedValue={selectedMinute}
                  onSelect={(v) => setSelectedMinute(v as number)}
                  formatValue={(v) => String(v).padStart(2, "0")}
                  infinite={true}
                />

                {/* Period */}
                <WheelColumn
                  items={PERIODS}
                  selectedValue={selectedPeriod}
                  onSelect={(v) => setSelectedPeriod(v as "AM" | "PM")}
                  infinite={false}
                />
              </div>
            </div>

            {/* Confirm Button */}
            <div className="px-5 pb-5">
              <motion.button
                onClick={handleConfirm}
                disabled={isLoading}
                whileHover={!isLoading ? buttonHover : undefined}
                whileTap={!isLoading ? buttonTap : undefined}
                className="w-full py-3.5 rounded-xl bg-[#156d95] text-white font-medium text-base transition-all duration-200 hover:bg-[#125a7a] flex items-center justify-center gap-2"
                style={{ fontFamily: "Figtree, sans-serif" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Confirm"
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
