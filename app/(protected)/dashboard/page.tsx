"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { SignOutButton } from "@/components/auth";
import {
  OnboardingModal,
  WelcomeStep,
  GoalsStep,
  MeetingChoiceStep,
  type OnboardingData,
  type OnboardingStepProps,
} from "@/components/onboarding";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  onboardingDone: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          // Show onboarding if not completed
          if (!userData.onboardingDone) {
            setShowOnboarding(true);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(
    async (data: OnboardingData) => {
      try {
        // Update user name
        if (data.name) {
          await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: data.name }),
          });
        }

        // Create goals if any
        if (data.goals.length > 0) {
          await fetch("/api/goals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              goals: data.goals.map((g) => ({ title: g.title })),
            }),
          });
        }

        // Create meeting schedule for BOTH options (try uses default 9 AM, schedule uses selected time)
        if (data.scheduledTime) {
          await fetch("/api/meeting-schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              time: data.scheduledTime,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }),
          });
        }

        // Mark onboarding as complete
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ onboardingDone: true }),
        });

        setShowOnboarding(false);

        // Refresh user data
        const response = await fetch("/api/profile");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }

        // If user chose to try a meeting, redirect to meeting page
        if (data.meetingChoice === "try") {
          router.push("/meeting");
        }
      } catch (error) {
        console.error("Error completing onboarding:", error);
      }
    },
    [router]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-zinc-300 border-t-[#156d95] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1
            className="text-2xl font-extrabold text-foreground"
            style={{ fontFamily: "Figtree, sans-serif" }}
          >
            RUNBOOK
          </h1>
          <div className="flex items-center gap-4">
            {user?.name && (
              <span className="text-sm text-muted-foreground">
                Hi, {user.name}
              </span>
            )}
            <SignOutButton variant="full" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2
            className="text-3xl font-semibold text-foreground mb-4"
            style={{ fontFamily: "Figtree, sans-serif" }}
          >
            Welcome to RunBook{user?.name ? `, ${user.name}` : ""}
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Your AI accountability manager is ready to help you achieve your
            goals.
          </p>

          {/* Dashboard placeholder */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto">
            <p className="text-muted-foreground">
              Dashboard content coming soon...
            </p>
            {!user?.onboardingDone && (
              <button
                onClick={() => setShowOnboarding(true)}
                className="mt-4 px-4 py-2 bg-[#156d95] text-white rounded-lg hover:bg-[#125a7d] transition-colors"
              >
                Complete Setup
              </button>
            )}
          </div>
        </motion.div>
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      >
        {(props: OnboardingStepProps) => <WelcomeStep {...props} />}
        {(props: OnboardingStepProps) => <GoalsStep {...props} />}
        {(props: OnboardingStepProps) => <MeetingChoiceStep {...props} />}
      </OnboardingModal>
    </div>
  );
}
