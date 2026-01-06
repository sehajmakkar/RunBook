"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import {
  Search,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Target,
  Calendar,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  user: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
  } | null;
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    active: true,
  },
  { icon: Target, label: "Goals", href: "/dashboard", active: false },
  { icon: Calendar, label: "Meetings", href: "/meeting", active: false },
  { icon: Settings, label: "Settings", href: "/settings", active: false },
];

export function Sidebar({ user, isCollapsed, onToggle }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen flex flex-col bg-sidebar border-r border-sidebar-border"
    >
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={() => router.push("/")}
                className="font-bold text-lg text-sidebar-foreground hover:text-[#156d95] transition-colors"
                style={{ fontFamily: "Figtree, sans-serif" }}
              >
                RUNBOOK
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <button
            onClick={() => router.push("/")}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#156d95] to-[#1a7faa] flex items-center justify-center mx-auto hover:opacity-90 transition-opacity"
          >
            <span className="text-white font-bold text-sm">R</span>
          </button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className={`p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors ${
            isCollapsed ? "hidden" : ""
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Search Box */}
      <div className="p-3">
        {isCollapsed ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="w-full p-2.5 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors flex items-center justify-center"
          >
            <Search className="w-4 h-4" />
          </motion.button>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-sidebar-accent/50 border border-sidebar-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-ring text-sidebar-foreground placeholder:text-muted-foreground"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(item.href)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
              item.active
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 flex-shrink-0" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0" />
          )}
          {!isCollapsed && (
            <span className="text-sm font-medium">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </motion.button>
      </div>

      {/* User Profile & Sign Out */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* User Profile */}
        <div
          className={`flex items-center gap-3 p-2 rounded-lg ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || "User"}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#156d95] to-[#1a7faa] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {getUserInitials()}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium">
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </span>
          )}
        </motion.button>
      </div>

      {/* Expand Button (when collapsed) */}
      {isCollapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="w-full p-2.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </motion.aside>
  );
}
