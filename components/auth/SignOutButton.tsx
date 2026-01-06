"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SignOutButtonProps {
  className?: string;
  variant?: "icon" | "text" | "full";
}

export function SignOutButton({ 
  className = "", 
  variant = "full" 
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    const supabase = createClient();
    
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (variant === "icon") {
    return (
      <motion.button
        onClick={handleSignOut}
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className}`}
        aria-label="Sign out"
      >
        <LogOut className="w-5 h-5" />
      </motion.button>
    );
  }

  if (variant === "text") {
    return (
      <button
        onClick={handleSignOut}
        disabled={isLoading}
        className={`text-muted-foreground hover:text-foreground transition-colors ${className}`}
      >
        {isLoading ? "Signing out..." : "Sign out"}
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleSignOut}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        text-muted-foreground hover:text-foreground
        hover:bg-muted transition-all
        ${className}
      `}
    >
      <LogOut className="w-4 h-4" />
      <span>{isLoading ? "Signing out..." : "Sign out"}</span>
    </motion.button>
  );
}

