"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target } from "lucide-react";
import type { Goal, GoalType, Priority } from "./CommitmentsTable";

type GoalInput = {
  title: string;
  description: string;
  type: GoalType;
  priority: Priority;
};

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: GoalInput) => void;
  editingGoal?: Goal | null;
  defaultType?: GoalType;
}

const goalTypes: { value: GoalType; label: string }[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "DEFAULT", label: "Normal", color: "bg-zinc-200 dark:bg-zinc-700" },
  { value: "LOW", label: "Low", color: "bg-blue-500" },
  { value: "HIGH", label: "High", color: "bg-amber-500" },
  { value: "URGENT", label: "Urgent", color: "bg-red-500" },
];

export function AddGoalModal({
  isOpen,
  onClose,
  onSubmit,
  editingGoal,
  defaultType = "DAILY",
}: AddGoalModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<GoalInput>({
    title: "",
    description: "",
    type: "DAILY",
    priority: "DEFAULT",
  });
  const [errors, setErrors] = useState<{ title?: string }>({});

  // Reset form when modal opens/closes or when editing goal changes
  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        setFormData({
          title: editingGoal.title,
          description: editingGoal.description || "",
          type: editingGoal.type,
          priority: editingGoal.priority,
        });
      } else {
        setFormData({
          title: "",
          description: "",
          type: defaultType,
          priority: "DEFAULT",
        });
      }
      setErrors({});

      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, editingGoal, defaultType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-card rounded-2xl shadow-xl border border-border overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#156d95]/10 to-[#156d95]/5 dark:from-[#156d95]/20 dark:to-[#156d95]/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#156d95]" />
                </div>
                <h2
                  className="text-lg font-semibold text-foreground"
                  style={{ fontFamily: "Figtree, sans-serif" }}
                >
                  {editingGoal ? "Edit Commitment" : "New Commitment"}
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title <span className="text-destructive">*</span>
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({});
                  }}
                  placeholder="What do you want to accomplish?"
                  className={`w-full px-4 py-3 text-base bg-background border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    errors.title
                      ? "border-destructive focus:ring-destructive/30"
                      : "border-input focus:ring-[#156d95]/30 focus:border-[#156d95]"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1.5 text-sm text-destructive">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Add more details about this commitment..."
                  rows={3}
                  className="w-full px-4 py-3 text-base bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#156d95]/30 focus:border-[#156d95] resize-none transition-colors"
                />
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Commitment Type
                </label>
                <div className="flex gap-2">
                  {goalTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, type: type.value })
                      }
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        formData.type === type.value
                          ? "bg-[#156d95] text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  {priorities.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, priority: priority.value })
                      }
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        formData.priority === priority.value
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${priority.color}`}
                      />
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-[#156d95] text-white hover:bg-[#125a7d] transition-colors"
                >
                  {editingGoal ? "Save Changes" : "Add Commitment"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
