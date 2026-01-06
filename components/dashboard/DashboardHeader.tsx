"use client";

import { motion } from "framer-motion";
import { Plus, Calendar } from "lucide-react";

interface DashboardHeaderProps {
  userName?: string | null;
  onAddClick: () => void;
}

// Greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

// Format current date
function formatCurrentDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardHeader({
  userName,
  onAddClick,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-foreground"
          style={{ fontFamily: "Figtree, sans-serif" }}
        >
          {getGreeting()}, {userName?.split(" ")[0] || "there"}
        </h1>
        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatCurrentDate()}</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAddClick}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#156d95] text-white text-sm font-medium hover:bg-[#125a7d] transition-colors shadow-lg shadow-[#156d95]/20"
      >
        <Plus className="w-4 h-4" />
        Add Commitment
      </motion.button>
    </header>
  );
}
