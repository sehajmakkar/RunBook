"use client";

import { motion } from "framer-motion";
import { Video, ArrowLeft, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import type { CommitmentPreview, MeetingData } from "./types";

// ============================================
// PRE-MEETING STATE (Ready to Join)
// ============================================

interface ReadyStateProps {
  userName: string;
  commitments: CommitmentPreview[];
  onJoinMeeting: () => void;
  isLoading?: boolean;
}

export function ReadyState({
  userName,
  commitments,
  onJoinMeeting,
  isLoading = false,
}: ReadyStateProps) {
  const activeCommitments = commitments.filter((c) => c.status === "ACTIVE");
  const topPriorities = activeCommitments
    .sort((a, b) => {
      const priorityOrder = { URGENT: 0, HIGH: 1, DEFAULT: 2, LOW: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8"
      >
        {/* Header */}
        <div className="space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-full bg-[#156d95]/20 flex items-center justify-center"
          >
            <Video className="w-10 h-10 text-[#156d95]" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">
            Ready for your check-in, {userName?.split(" ")[0] || "there"}?
          </h1>
          <p className="text-zinc-400">
            Your AI manager is ready to review your commitments.
          </p>
        </div>

        {/* Agenda Preview */}
        {topPriorities.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-left"
          >
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Today&apos;s Agenda
            </h3>
            <ul className="space-y-2">
              {topPriorities.map((commitment, index) => (
                <motion.li
                  key={commitment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <PriorityDot priority={commitment.priority} />
                  <span className="text-sm text-zinc-300 truncate">
                    {commitment.title}
                  </span>
                </motion.li>
              ))}
            </ul>
            {activeCommitments.length > 3 && (
              <p className="text-xs text-zinc-600 mt-2">
                +{activeCommitments.length - 3} more commitments
              </p>
            )}
          </motion.div>
        )}

        {/* Duration Notice */}
        <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>Meeting will last 3-5 minutes</span>
        </div>

        {/* Join Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onJoinMeeting}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-[#156d95] text-white font-semibold text-lg hover:bg-[#125a7d] transition-all shadow-lg shadow-[#156d95]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              Join Meeting
            </>
          )}
        </motion.button>

        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}

// ============================================
// CONNECTING STATE
// ============================================

export function ConnectingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-6"
      >
        {/* Loading Animation */}
        <div className="relative w-24 h-24 mx-auto">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#156d95]/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-[#156d95]/50"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="absolute inset-4 rounded-full bg-[#156d95]/20 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
          >
            <Loader2 className="w-8 h-8 text-[#156d95] animate-spin" />
          </motion.div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Connecting...</h2>
          <p className="text-zinc-500 text-sm">
            Setting up your meeting environment
          </p>
        </div>

        {/* Connection Steps */}
        <div className="space-y-2 text-left max-w-xs mx-auto">
          <ConnectionStep label="Initializing audio" status="complete" />
          <ConnectionStep label="Connecting to AI manager" status="loading" />
          <ConnectionStep label="Loading your commitments" status="pending" />
        </div>
      </motion.div>
    </div>
  );
}

function ConnectionStep({
  label,
  status,
}: {
  label: string;
  status: "pending" | "loading" | "complete";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3"
    >
      {status === "complete" && (
        <CheckCircle className="w-4 h-4 text-emerald-400" />
      )}
      {status === "loading" && (
        <Loader2 className="w-4 h-4 text-[#156d95] animate-spin" />
      )}
      {status === "pending" && (
        <div className="w-4 h-4 rounded-full border border-zinc-700" />
      )}
      <span
        className={`text-sm ${
          status === "complete"
            ? "text-zinc-400"
            : status === "loading"
              ? "text-white"
              : "text-zinc-600"
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
}

// ============================================
// COMPLETED STATE (Meeting Summary)
// ============================================

interface CompletedStateProps {
  meeting: MeetingData;
  onBackToDashboard: () => void;
}

export function CompletedState({ meeting, onBackToDashboard }: CompletedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full space-y-6"
      >
        {/* Success Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Meeting Complete</h1>
          <p className="text-zinc-400">
            Great job showing up. Here&apos;s your summary.
          </p>
        </div>

        {/* Summary */}
        {meeting.summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5"
          >
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Summary
            </h3>
            <p className="text-zinc-300 text-sm leading-relaxed">
              {meeting.summary}
            </p>
          </motion.div>
        )}

        {/* Observations */}
        {meeting.observations && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            {meeting.observations.patterns?.length > 0 && (
              <ObservationBlock
                title="Patterns Noticed"
                items={meeting.observations.patterns}
                type="warning"
              />
            )}
            {meeting.observations.risks?.length > 0 && (
              <ObservationBlock
                title="Risks Flagged"
                items={meeting.observations.risks}
                type="danger"
              />
            )}
            {meeting.observations.improvements?.length > 0 && (
              <ObservationBlock
                title="Improvements"
                items={meeting.observations.improvements}
                type="success"
              />
            )}
          </motion.div>
        )}

        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBackToDashboard}
          className="w-full py-4 rounded-2xl bg-[#156d95] text-white font-semibold hover:bg-[#125a7d] transition-all"
        >
          Back to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}

function ObservationBlock({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "warning" | "danger" | "success";
}) {
  const colors = {
    warning: "border-amber-500/20 bg-amber-500/5",
    danger: "border-red-500/20 bg-red-500/5",
    success: "border-emerald-500/20 bg-emerald-500/5",
  };

  const textColors = {
    warning: "text-amber-400",
    danger: "text-red-400",
    success: "text-emerald-400",
  };

  return (
    <div className={`border rounded-xl p-4 ${colors[type]}`}>
      <h4 className={`text-xs font-medium uppercase tracking-wider mb-2 ${textColors[type]}`}>
        {title}
      </h4>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-zinc-400 flex items-start gap-2">
            <span className={`mt-1.5 w-1 h-1 rounded-full ${textColors[type].replace("text-", "bg-")}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// ERROR STATE
// ============================================

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  onBackToDashboard: () => void;
}

export function ErrorState({ message, onRetry, onBackToDashboard }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center"
        >
          <AlertCircle className="w-8 h-8 text-red-400" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
          <p className="text-zinc-400 text-sm">{message}</p>
        </div>

        <div className="flex flex-col gap-3">
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetry}
              className="w-full py-3 rounded-xl bg-[#156d95] text-white font-medium hover:bg-[#125a7d] transition-all"
            >
              Try Again
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBackToDashboard}
            className="w-full py-3 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-all"
          >
            Back to Dashboard
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function PriorityDot({ priority }: { priority: CommitmentPreview["priority"] }) {
  const colors = {
    URGENT: "bg-red-500",
    HIGH: "bg-amber-500",
    DEFAULT: "bg-[#156d95]",
    LOW: "bg-zinc-500",
  };

  return <div className={`w-2 h-2 rounded-full ${colors[priority]}`} />;
}
