import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

/**
 * GET /api/meeting-schedule
 * Get the current user's meeting schedule
 */
export async function GET() {
  try {
    const supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const schedule = await prisma.meetingSchedule.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error fetching meeting schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/meeting-schedule
 * Create a meeting schedule
 */
export async function POST(request: Request) {
  try {
    const supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { time, timezone, frequency } = body;

    if (!time || typeof time !== "string") {
      return NextResponse.json({ error: "Time is required" }, { status: 400 });
    }

    // Check if schedule already exists
    const existing = await prisma.meetingSchedule.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      // Update existing schedule
      const schedule = await prisma.meetingSchedule.update({
        where: { userId: user.id },
        data: {
          time,
          timezone:
            timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          frequency: frequency || "daily",
          isActive: true,
        },
      });
      return NextResponse.json(schedule);
    }

    // Create new schedule
    const schedule = await prisma.meetingSchedule.create({
      data: {
        userId: user.id,
        time,
        timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        frequency: frequency || "daily",
        isActive: true,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/meeting-schedule
 * Update the meeting schedule
 */
export async function PATCH(request: Request) {
  try {
    const supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { time, timezone, frequency, isActive } = body;

    // Build update data
    const updateData: {
      time?: string;
      timezone?: string;
      frequency?: string;
      isActive?: boolean;
    } = {};

    if (time !== undefined) updateData.time = time;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (isActive !== undefined) updateData.isActive = isActive;

    const schedule = await prisma.meetingSchedule.update({
      where: { userId: user.id },
      data: updateData,
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error updating meeting schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/meeting-schedule
 * Delete the meeting schedule
 */
export async function DELETE() {
  try {
    const supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.meetingSchedule.delete({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meeting schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
