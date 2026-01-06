"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar } from "lucide-react";
import {
  OnboardingModal,
  WelcomeStep,
  GoalsStep,
  MeetingChoiceStep,
  type OnboardingData,
  type OnboardingStepProps,
} from "@/components/onboarding";
import {
  Sidebar,
  MeetingBanner,
  CommitmentsTable,
  CollapsibleSection,
  AddGoalModal,
  type Goal,
  type GoalType,
  type Priority,
  type CommitmentStatus,
} from "@/components/dashboard";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  onboardingDone: boolean;
}

interface MeetingSchedule {
  id: string;
  time: string;
  timezone: string;
  frequency: string;
  isActive: boolean;
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [meetingSchedule, setMeetingSchedule] =
    useState<MeetingSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedType, setSelectedType] = useState<GoalType>("DAILY");

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
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

  // Fetch goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch("/api/goals");
        if (response.ok) {
          const goalsData = await response.json();
          setGoals(goalsData);
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
      } finally {
        setGoalsLoading(false);
      }
    };

    if (!loading && user) {
      fetchGoals();
    }
  }, [loading, user]);

  // Fetch meeting schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch("/api/meeting-schedule");
        if (response.ok) {
          const scheduleData = await response.json();
          setMeetingSchedule(scheduleData);
        }
      } catch (error) {
        console.error("Error fetching meeting schedule:", error);
      }
    };

    if (!loading && user) {
      fetchSchedule();
    }
  }, [loading, user]);

  // Filter goals by type
  const dailyGoals = useMemo(
    () => goals.filter((g) => g.type === "DAILY"),
    [goals]
  );
  const weeklyGoals = useMemo(
    () => goals.filter((g) => g.type === "WEEKLY"),
    [goals]
  );
  const monthlyGoals = useMemo(
    () => goals.filter((g) => g.type === "MONTHLY"),
    [goals]
  );

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(
    async (data: OnboardingData) => {
      try {
        if (data.name) {
          await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: data.name }),
          });
        }

        if (data.goals.length > 0) {
          await fetch("/api/goals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              goals: data.goals.map((g) => ({ title: g.title })),
            }),
          });
        }

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

        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ onboardingDone: true }),
        });

        setShowOnboarding(false);

        // Refresh data
        const [userRes, goalsRes, scheduleRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/goals"),
          fetch("/api/meeting-schedule"),
        ]);

        if (userRes.ok) setUser(await userRes.json());
        if (goalsRes.ok) setGoals(await goalsRes.json());
        if (scheduleRes.ok) setMeetingSchedule(await scheduleRes.json());

        if (data.meetingChoice === "try") {
          router.push("/meeting");
        }
      } catch (error) {
        console.error("Error completing onboarding:", error);
      }
    },
    [router]
  );

  // Handle goal toggle complete
  const handleToggleComplete = useCallback(
    async (id: string, currentStatus: CommitmentStatus) => {
      const newStatus: CommitmentStatus =
        currentStatus === "COMPLETED" ? "ACTIVE" : "COMPLETED";

      // Optimistic update
      setGoals((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                status: newStatus,
                completedAt:
                  newStatus === "COMPLETED" ? new Date().toISOString() : null,
              }
            : g
        )
      );

      try {
        const response = await fetch(`/api/goals/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          // Revert on error
          setGoals((prev) =>
            prev.map((g) => (g.id === id ? { ...g, status: currentStatus } : g))
          );
        }
      } catch (error) {
        console.error("Error updating goal:", error);
        // Revert on error
        setGoals((prev) =>
          prev.map((g) => (g.id === id ? { ...g, status: currentStatus } : g))
        );
      }
    },
    []
  );

  // Handle add/edit goal
  const handleSubmitGoal = useCallback(
    async (goalData: {
      title: string;
      description: string;
      type: GoalType;
      priority: Priority;
    }) => {
      if (editingGoal) {
        // Update existing goal
        try {
          const response = await fetch(`/api/goals/${editingGoal.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(goalData),
          });

          if (response.ok) {
            const updatedGoal = await response.json();
            setGoals((prev) =>
              prev.map((g) => (g.id === editingGoal.id ? updatedGoal : g))
            );
          }
        } catch (error) {
          console.error("Error updating goal:", error);
        }
      } else {
        // Create new goal
        try {
          const response = await fetch("/api/goals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(goalData),
          });

          if (response.ok) {
            const newGoal = await response.json();
            setGoals((prev) => [...prev, newGoal]);
          }
        } catch (error) {
          console.error("Error creating goal:", error);
        }
      }
      setEditingGoal(null);
    },
    [editingGoal]
  );

  // Handle delete goal
  const handleDeleteGoal = useCallback(async (id: string) => {
    // Optimistic delete
    setGoals((prev) => prev.filter((g) => g.id !== id));

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Refetch goals on error
        const goalsRes = await fetch("/api/goals");
        if (goalsRes.ok) {
          setGoals(await goalsRes.json());
        }
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      // Refetch goals on error
      const goalsRes = await fetch("/api/goals");
      if (goalsRes.ok) {
        setGoals(await goalsRes.json());
      }
    }
  }, []);

  // Handle edit goal
  const handleEditGoal = useCallback((goal: Goal) => {
    setEditingGoal(goal);
    setShowAddModal(true);
  }, []);

  // Handle reschedule meeting
  const handleRescheduleMeeting = useCallback(async (newTime: string) => {
    try {
      const response = await fetch("/api/meeting-schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time: newTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (response.ok) {
        const updatedSchedule = await response.json();
        setMeetingSchedule(updatedSchedule);
      }
    } catch (error) {
      console.error("Error rescheduling meeting:", error);
    }
  }, []);

  // Open add modal with specific type
  const openAddModalWithType = useCallback((type: GoalType) => {
    setSelectedType(type);
    setEditingGoal(null);
    setShowAddModal(true);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-zinc-300 border-t-[#156d95] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        user={user}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-foreground"
                style={{ fontFamily: "Figtree, sans-serif" }}
              >
                {getGreeting()}, {user?.name?.split(" ")[0] || "there"}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatCurrentDate()}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openAddModalWithType("DAILY")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#156d95] text-white text-sm font-medium hover:bg-[#125a7d] transition-colors shadow-lg shadow-[#156d95]/20"
            >
              <Plus className="w-4 h-4" />
              Add Commitment
            </motion.button>
          </header>

          {/* Meeting Banner */}
          <MeetingBanner
            schedule={meetingSchedule}
            onReschedule={handleRescheduleMeeting}
          />

          {/* Commitments Board */}
          <div className="space-y-4">
            {/* Daily Commitments */}
            <CollapsibleSection
              title="Daily Commitments"
              count={dailyGoals.length}
              defaultExpanded={true}
              onAddClick={() => openAddModalWithType("DAILY")}
            >
              <CommitmentsTable
                goals={dailyGoals}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                isLoading={goalsLoading}
              />
            </CollapsibleSection>

            {/* Weekly Commitments */}
            <CollapsibleSection
              title="Weekly Commitments"
              count={weeklyGoals.length}
              defaultExpanded={true}
              onAddClick={() => openAddModalWithType("WEEKLY")}
            >
              <CommitmentsTable
                goals={weeklyGoals}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                isLoading={goalsLoading}
              />
            </CollapsibleSection>

            {/* Monthly Commitments */}
            <CollapsibleSection
              title="Monthly Commitments"
              count={monthlyGoals.length}
              defaultExpanded={true}
              onAddClick={() => openAddModalWithType("MONTHLY")}
            >
              <CommitmentsTable
                goals={monthlyGoals}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                isLoading={goalsLoading}
              />
            </CollapsibleSection>
          </div>
        </div>
      </main>

      {/* Add/Edit Goal Modal */}
      <AddGoalModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingGoal(null);
        }}
        onSubmit={handleSubmitGoal}
        editingGoal={editingGoal}
      />

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
