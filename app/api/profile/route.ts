import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

/**
 * GET /api/profile
 * Get the current user's profile
 */
export async function GET() {
  try {
    const supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      include: {
        goals: {
          orderBy: { order: "asc" },
        },
        meetingSchedule: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Update the current user's profile
 */
export async function PATCH(request: Request) {
  try {
    const supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, onboardingDone, avatarUrl } = body;

    // Build update data
    const updateData: {
      name?: string;
      onboardingDone?: boolean;
      avatarUrl?: string;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (onboardingDone !== undefined)
      updateData.onboardingDone = onboardingDone;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const user = await prisma.user.update({
      where: { supabaseId: supabaseUser.id },
      data: updateData,
      include: {
        goals: {
          orderBy: { order: "asc" },
        },
        meetingSchedule: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
