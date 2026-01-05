import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Gets the authenticated user's database record.
 * Returns null if not authenticated or user not found.
 */
export async function getDbUser() {
  const supabaseUser = await getUser();
  
  if (!supabaseUser) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: {
      goals: true,
      meetingSchedule: true,
    },
  });

  return dbUser;
}

/**
 * Gets the authenticated user or redirects to login.
 * Use this in protected pages/components.
 */
export async function requireAuth() {
  const user = await getDbUser();
  
  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Checks if user needs onboarding.
 * Returns true if onboarding is not complete.
 */
export async function needsOnboarding() {
  const user = await getDbUser();
  return user ? !user.onboardingDone : false;
}

