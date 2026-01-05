"use client";

import { motion } from "framer-motion";
import { SignOutButton } from "@/components/auth";

export default function DashboardPage() {
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
          <SignOutButton variant="full" />
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
            Welcome to RunBook
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Your AI accountability manager is ready to help you achieve your goals.
          </p>
          
          {/* Placeholder for onboarding trigger */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto">
            <p className="text-muted-foreground">
              Dashboard content coming soon...
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

