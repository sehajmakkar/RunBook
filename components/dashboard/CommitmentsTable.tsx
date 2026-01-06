"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  Briefcase,
  BookOpen,
  Dumbbell,
  Code,
  Sparkles,
  ShoppingCart,
  Heart,
  Home,
  DollarSign,
  Users,
  Plane,
  Music,
  Utensils,
  Pill,
  GraduationCap,
} from "lucide-react";

// Types
export type GoalType = "DAILY" | "WEEKLY" | "MONTHLY";
export type Priority = "DEFAULT" | "LOW" | "HIGH" | "URGENT";
export type CommitmentStatus = "ACTIVE" | "COMPLETED" | "ABANDONED";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  type: GoalType;
  priority: Priority;
  status: CommitmentStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CommitmentsTableProps {
  goals: Goal[];
  onToggleComplete: (id: string, currentStatus: CommitmentStatus) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

// Priority configuration
const priorityConfig: Record<
  Priority,
  { label: string; color: string; bgColor: string }
> = {
  DEFAULT: {
    label: "Normal",
    color: "text-zinc-600 dark:text-zinc-400",
    bgColor: "bg-zinc-100 dark:bg-zinc-800",
  },
  LOW: {
    label: "Low",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/30",
  },
  HIGH: {
    label: "High",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/30",
  },
  URGENT: {
    label: "Urgent",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/30",
  },
};

// Status configuration
const statusConfig: Record<
  CommitmentStatus,
  { label: string; color: string; bgColor: string; icon: typeof Circle }
> = {
  ACTIVE: {
    label: "Not Started",
    color: "text-zinc-600 dark:text-zinc-400",
    bgColor: "bg-zinc-100 dark:bg-zinc-800",
    icon: Circle,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-[#156d95] dark:text-[#5bb4db]",
    bgColor: "bg-[#156d95]/10 dark:bg-[#156d95]/20",
    icon: CheckCircle2,
  },
  ABANDONED: {
    label: "Blocked",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/30",
    icon: AlertCircle,
  },
};

// Infer category from title
function inferCategory(title: string): {
  icon: typeof Briefcase;
  label: string;
} {
  const lowercaseTitle = title.toLowerCase();

  // Work & Career
  if (
    lowercaseTitle.includes("work") ||
    lowercaseTitle.includes("meeting") ||
    lowercaseTitle.includes("project") ||
    lowercaseTitle.includes("deadline") ||
    lowercaseTitle.includes("presentation") ||
    lowercaseTitle.includes("report") ||
    lowercaseTitle.includes("client") ||
    lowercaseTitle.includes("office")
  ) {
    return { icon: Briefcase, label: "Work" };
  }

  // Learning & Education
  if (
    lowercaseTitle.includes("learn") ||
    lowercaseTitle.includes("study") ||
    lowercaseTitle.includes("read") ||
    lowercaseTitle.includes("book") ||
    lowercaseTitle.includes("course") ||
    lowercaseTitle.includes("class") ||
    lowercaseTitle.includes("tutorial") ||
    lowercaseTitle.includes("practice")
  ) {
    return { icon: GraduationCap, label: "Learning" };
  }

  // Fitness & Exercise
  if (
    lowercaseTitle.includes("gym") ||
    lowercaseTitle.includes("exercise") ||
    lowercaseTitle.includes("workout") ||
    lowercaseTitle.includes("run") ||
    lowercaseTitle.includes("fitness") ||
    lowercaseTitle.includes("yoga") ||
    lowercaseTitle.includes("walk") ||
    lowercaseTitle.includes("swim") ||
    lowercaseTitle.includes("stretch")
  ) {
    return { icon: Dumbbell, label: "Fitness" };
  }

  // Coding & Tech
  if (
    lowercaseTitle.includes("code") ||
    lowercaseTitle.includes("build") ||
    lowercaseTitle.includes("develop") ||
    lowercaseTitle.includes("programming") ||
    lowercaseTitle.includes("debug") ||
    lowercaseTitle.includes("deploy") ||
    lowercaseTitle.includes("api") ||
    lowercaseTitle.includes("app") ||
    lowercaseTitle.includes("frontend") ||
    lowercaseTitle.includes("backend") ||
    lowercaseTitle.includes("database") ||
    lowercaseTitle.includes("server") ||
    lowercaseTitle.includes("feature") ||
    lowercaseTitle.includes("bug") ||
    lowercaseTitle.includes("fix") ||
    lowercaseTitle.includes("refactor") ||
    lowercaseTitle.includes("test") ||
    lowercaseTitle.includes("commit") ||
    lowercaseTitle.includes("push") ||
    lowercaseTitle.includes("pull request") ||
    lowercaseTitle.includes("merge") ||
    lowercaseTitle.includes("review") ||
    lowercaseTitle.includes("component") ||
    lowercaseTitle.includes("function") ||
    lowercaseTitle.includes("module") ||
    lowercaseTitle.includes("script") ||
    lowercaseTitle.includes("css") ||
    lowercaseTitle.includes("html") ||
    lowercaseTitle.includes("react") ||
    lowercaseTitle.includes("next") ||
    lowercaseTitle.includes("node") ||
    lowercaseTitle.includes("python") ||
    lowercaseTitle.includes("java") ||
    lowercaseTitle.includes("docker") ||
    lowercaseTitle.includes("kubernetes") ||
    lowercaseTitle.includes("aws") ||
    lowercaseTitle.includes("azure") ||
    lowercaseTitle.includes("git") ||
    lowercaseTitle.includes("repo") ||
    lowercaseTitle.includes("ci/cd") ||
    lowercaseTitle.includes("pipeline") ||
    lowercaseTitle.includes("endpoint") ||
    lowercaseTitle.includes("schema") ||
    lowercaseTitle.includes("migration") ||
    lowercaseTitle.includes("implement") ||
    lowercaseTitle.includes("integrate") ||
    lowercaseTitle.includes("optimize") ||
    lowercaseTitle.includes("authentication") ||
    lowercaseTitle.includes("auth")
  ) {
    return { icon: Code, label: "Coding" };
  }

  // Shopping & Errands
  if (
    lowercaseTitle.includes("buy") ||
    lowercaseTitle.includes("shop") ||
    lowercaseTitle.includes("grocery") ||
    lowercaseTitle.includes("order") ||
    lowercaseTitle.includes("pick up") ||
    lowercaseTitle.includes("return")
  ) {
    return { icon: ShoppingCart, label: "Shopping" };
  }

  // Health & Wellness
  if (
    lowercaseTitle.includes("doctor") ||
    lowercaseTitle.includes("dentist") ||
    lowercaseTitle.includes("medicine") ||
    lowercaseTitle.includes("health") ||
    lowercaseTitle.includes("appointment") ||
    lowercaseTitle.includes("checkup") ||
    lowercaseTitle.includes("meditate")
  ) {
    return { icon: Pill, label: "Health" };
  }

  // Home & Chores
  if (
    lowercaseTitle.includes("clean") ||
    lowercaseTitle.includes("laundry") ||
    lowercaseTitle.includes("cook") ||
    lowercaseTitle.includes("house") ||
    lowercaseTitle.includes("repair") ||
    lowercaseTitle.includes("organize") ||
    lowercaseTitle.includes("dishes")
  ) {
    return { icon: Home, label: "Home" };
  }

  // Finance
  if (
    lowercaseTitle.includes("pay") ||
    lowercaseTitle.includes("bill") ||
    lowercaseTitle.includes("budget") ||
    lowercaseTitle.includes("invest") ||
    lowercaseTitle.includes("bank") ||
    lowercaseTitle.includes("tax") ||
    lowercaseTitle.includes("money")
  ) {
    return { icon: DollarSign, label: "Finance" };
  }

  // Social & Family
  if (
    lowercaseTitle.includes("call") ||
    lowercaseTitle.includes("visit") ||
    lowercaseTitle.includes("friend") ||
    lowercaseTitle.includes("family") ||
    lowercaseTitle.includes("party") ||
    lowercaseTitle.includes("dinner") ||
    lowercaseTitle.includes("birthday")
  ) {
    return { icon: Users, label: "Social" };
  }

  // Travel
  if (
    lowercaseTitle.includes("travel") ||
    lowercaseTitle.includes("trip") ||
    lowercaseTitle.includes("flight") ||
    lowercaseTitle.includes("hotel") ||
    lowercaseTitle.includes("vacation") ||
    lowercaseTitle.includes("pack")
  ) {
    return { icon: Plane, label: "Travel" };
  }

  // Hobbies & Creative
  if (
    lowercaseTitle.includes("music") ||
    lowercaseTitle.includes("paint") ||
    lowercaseTitle.includes("draw") ||
    lowercaseTitle.includes("write") ||
    lowercaseTitle.includes("play") ||
    lowercaseTitle.includes("hobby") ||
    lowercaseTitle.includes("game")
  ) {
    return { icon: Music, label: "Hobby" };
  }

  // Self-care & Relationships
  if (
    lowercaseTitle.includes("self") ||
    lowercaseTitle.includes("relax") ||
    lowercaseTitle.includes("journal") ||
    lowercaseTitle.includes("gratitude") ||
    lowercaseTitle.includes("date")
  ) {
    return { icon: Heart, label: "Self-care" };
  }

  return { icon: Sparkles, label: "Personal" };
}

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Animated strikethrough helpers
const getStrikeAnimate = (isChecked: boolean) => ({
  pathLength: isChecked ? 1 : 0,
  opacity: isChecked ? 1 : 0,
});

const getStrikeTransition = (isChecked: boolean): Transition => ({
  pathLength: { duration: 0.8, ease: "easeInOut" },
  opacity: {
    duration: 0.01,
    delay: isChecked ? 0 : 0.8,
  },
});

// Table Row Component
function TableRow({
  goal,
  onToggleComplete,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  onToggleComplete: (id: string, currentStatus: CommitmentStatus) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const priority = priorityConfig[goal.priority];
  const status = statusConfig[goal.status];
  const category = inferCategory(goal.title);
  const StatusIcon = status.icon;
  const CategoryIcon = category.icon;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="group border-b border-border/50 hover:bg-muted/30 transition-colors"
    >
      {/* Checkbox */}
      <td className="py-4 px-4 align-middle">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggleComplete(goal.id, goal.status)}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            goal.status === "COMPLETED"
              ? "bg-[#156d95] border-[#156d95] text-white"
              : "border-muted-foreground/40 hover:border-[#156d95]"
          }`}
        >
          {goal.status === "COMPLETED" && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          )}
        </motion.button>
      </td>

      {/* Task Title */}
      <td className="py-4 px-4 align-middle">
        <div className="relative inline-flex items-center max-w-full">
          <span
            className={`font-medium truncate transition-colors duration-300 ${
              goal.status === "COMPLETED"
                ? "text-muted-foreground"
                : "text-foreground"
            }`}
            title={goal.title}
          >
            {goal.title}
          </span>
          {/* Animated Strikethrough SVG */}
          <motion.svg
            width="100%"
            height="32"
            viewBox="0 0 340 32"
            preserveAspectRatio="none"
            className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-20 w-full h-8"
          >
            <motion.path
              d="M 10 16.91 s 79.8 -11.36 98.1 -11.34 c 22.2 0.02 -47.82 14.25 -33.39 22.02 c 12.61 6.77 124.18 -27.98 133.31 -17.28 c 7.52 8.38 -26.8 20.02 4.61 22.05 c 24.55 1.93 113.37 -20.36 113.37 -20.36"
              vectorEffect="non-scaling-stroke"
              strokeWidth={2}
              strokeLinecap="round"
              strokeMiterlimit={10}
              fill="none"
              initial={false}
              animate={getStrikeAnimate(goal.status === "COMPLETED")}
              transition={getStrikeTransition(goal.status === "COMPLETED")}
              className="stroke-[#156d95] dark:stroke-[#5bb4db]"
            />
          </motion.svg>
        </div>
      </td>

      {/* Description */}
      <td className="py-4 px-4">
        <span
          className="text-sm text-muted-foreground truncate block"
          title={goal.description || ""}
        >
          {goal.description || "—"}
        </span>
      </td>

      {/* Type/Category */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
            <CategoryIcon className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">
            {category.label}
          </span>
        </div>
      </td>

      {/* Priority */}
      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priority.color} ${priority.bgColor}`}
        >
          {priority.label}
        </span>
      </td>

      {/* Added At */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(goal.createdAt)}
        </div>
      </td>

      {/* Status */}
      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color} ${status.bgColor}`}
        >
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </td>

      {/* Actions */}
      <td className="py-4 px-4">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />

                {/* Menu */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute right-0 top-full mt-1 z-20 w-32 py-1 bg-popover border border-border rounded-lg shadow-lg"
                >
                  <button
                    onClick={() => {
                      onEdit(goal);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(goal.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </td>
    </motion.tr>
  );
}

// Empty State
function EmptyState({ type }: { type: GoalType }) {
  const typeLabels: Record<GoalType, string> = {
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
  };

  return (
    <tr>
      <td colSpan={8} className="py-12 px-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-muted mx-auto mb-3 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            No {typeLabels[type]} commitments yet. Add one to get started!
          </p>
        </div>
      </td>
    </tr>
  );
}

// Loading State
function LoadingState() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i} className="border-b border-border/50">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
            <td key={j} className="py-4 px-4">
              <div className="h-5 bg-muted animate-pulse rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Main Table Component
export function CommitmentsTable({
  goals,
  onToggleComplete,
  onEdit,
  onDelete,
  isLoading,
}: CommitmentsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-12" />
          <col className="w-[20%]" />
          <col className="w-[25%]" />
          <col className="w-[12%]" />
          <col className="w-[10%]" />
          <col className="w-[13%]" />
          <col className="w-[12%]" />
          <col className="w-12" />
        </colgroup>
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 px-4 text-left"></th>
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Task Name
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Type
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Priority
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Added At
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </th>
            <th className="py-3 px-4 text-left"></th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <LoadingState />
            ) : goals.length === 0 ? (
              <EmptyState type="DAILY" />
            ) : (
              goals.map((goal) => (
                <TableRow
                  key={goal.id}
                  goal={goal}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
