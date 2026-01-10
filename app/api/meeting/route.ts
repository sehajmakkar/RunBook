import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

// GET /api/meeting - Get current/recent meeting
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

    // Get the most recent meeting (either in progress or recently completed)
    const meeting = await prisma.meeting.findFirst({
      where: {
        userId: user.id,
        status: { in: ["IN_PROGRESS", "COMPLETED"] },
      },
      orderBy: { startedAt: "desc" },
    });

    if (!meeting) {
      return NextResponse.json(null);
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/meeting - Start a new meeting
export async function POST() {
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

    // Check if there's already an in-progress meeting
    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        userId: user.id,
        status: "IN_PROGRESS",
      },
    });

    if (existingMeeting) {
      // Return the existing meeting instead of creating a new one
      return NextResponse.json(existingMeeting);
    }

    // Create new meeting
    const meeting = await prisma.meeting.create({
      data: {
        userId: user.id,
        status: "IN_PROGRESS",
        phase: "OPENING",
        startedAt: new Date(),
        transcript: [],
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
