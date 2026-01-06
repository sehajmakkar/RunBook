"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  count: number;
  defaultExpanded?: boolean;
  onAddClick?: () => void;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  count,
  defaultExpanded = true,
  onAddClick,
  children,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 group"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.div>
          <div className="flex items-center gap-2">
            <h3
              className="font-semibold text-foreground"
              style={{ fontFamily: "Figtree, sans-serif" }}
            >
              {title}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
              {count}
            </span>
          </div>
        </button>

        {onAddClick && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#156d95] hover:bg-[#156d95]/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </motion.button>
        )}
      </div>

      {/* Section Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
